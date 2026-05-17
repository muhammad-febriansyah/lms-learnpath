<?php

use App\Models\Course;
use App\Models\CourseDocument;
use App\Models\CourseDocumentChunk;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\AI\DocumentIngestionService;
use App\Services\AI\DocumentRetrievalService;
use App\Services\AI\EmbeddingService;
use App\Services\AI\PdfTextExtractor;
use App\Services\AI\TutorService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    config()->set('services.openai.api_key', 'test-key');
    config()->set('services.openai.model', 'gpt-5');
    config()->set('services.openai.embedding_model', 'text-embedding-3-small');
    Storage::fake();

    foreach (['course.view', 'course.update', 'course.create', 'course.delete'] as $p) {
        Permission::findOrCreate($p, 'web');
    }
    $instructorRole = Role::findOrCreate('instructor', 'web');
    $instructorRole->syncPermissions(['course.view', 'course.update', 'course.create', 'course.delete']);
    Role::findOrCreate('admin_tenant', 'web');

    $this->org = Organization::create([
        'name' => 'Acme RAG',
        'slug' => 'acme-rag',
        'contact_name' => 'HR',
        'contact_email' => 'hr@acme-rag.test',
        'seat_quota' => 10,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->instructor = User::factory()->create(['email_verified_at' => now()]);
    $this->instructor->assignRole('instructor');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->instructor->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);

    $this->course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'title' => 'Analisa Kredit AO',
    ]);
});

it('computes cosine similarity correctly', function () {
    expect(EmbeddingService::cosine([1.0, 0.0], [1.0, 0.0]))->toBe(1.0);
    expect(EmbeddingService::cosine([1.0, 0.0], [0.0, 1.0]))->toBe(0.0);
    expect(round(EmbeddingService::cosine([1.0, 1.0], [1.0, 0.0]), 4))->toBe(0.7071);
    expect(EmbeddingService::cosine([0.0, 0.0], [1.0, 1.0]))->toBe(0.0);
});

it('chunks long text with overlap and keeps each chunk under the size limit', function () {
    $ingest = app(DocumentIngestionService::class);
    $text = str_repeat('A', 2500);

    $chunks = $ingest->chunkText($text);

    expect(count($chunks))->toBeGreaterThanOrEqual(3);
    foreach ($chunks as $chunk) {
        expect(mb_strlen($chunk))->toBeLessThanOrEqual(1000);
    }
});

it('persists chunks with embeddings and marks document ready on success', function () {
    Http::fake([
        'api.openai.com/v1/embeddings' => Http::response([
            'model' => 'text-embedding-3-small',
            'usage' => ['total_tokens' => 42],
            'data' => [
                ['index' => 0, 'embedding' => [0.1, 0.2, 0.3]],
            ],
        ], 200),
    ]);

    $document = CourseDocument::create([
        'course_id' => $this->course->id,
        'uploaded_by_user_id' => $this->instructor->id,
        'title' => 'Bab 1',
        'source_type' => 'paste',
        'status' => 'pending',
    ]);

    app(DocumentIngestionService::class)->ingest($document, 'Materi singkat tentang 5C.');

    $document->refresh();
    expect($document->status)->toBe('ready');
    expect($document->total_chunks)->toBe(1);
    expect($document->total_tokens)->toBe(42);

    $chunk = $document->chunks()->first();
    expect($chunk->embedding)->toBe([0.1, 0.2, 0.3]);
});

it('marks document failed when OpenAI rejects the embedding request', function () {
    Http::fake([
        'api.openai.com/v1/embeddings' => Http::response(['error' => 'rate limit'], 429),
    ]);

    $document = CourseDocument::create([
        'course_id' => $this->course->id,
        'uploaded_by_user_id' => $this->instructor->id,
        'title' => 'Gagal',
        'source_type' => 'paste',
        'status' => 'pending',
    ]);

    app(DocumentIngestionService::class)->ingest($document, 'isi materi');

    $document->refresh();
    expect($document->status)->toBe('failed');
    expect($document->error_message)->not->toBeNull();
});

it('retrieves top-K chunks ordered by cosine similarity', function () {
    Http::fake([
        'api.openai.com/v1/embeddings' => Http::response([
            'model' => 'text-embedding-3-small',
            'usage' => ['total_tokens' => 5],
            'data' => [
                ['index' => 0, 'embedding' => [1.0, 0.0, 0.0]],
            ],
        ], 200),
    ]);

    $doc = CourseDocument::create([
        'course_id' => $this->course->id,
        'uploaded_by_user_id' => $this->instructor->id,
        'title' => 'Materi',
        'source_type' => 'paste',
        'status' => 'ready',
    ]);

    CourseDocumentChunk::create([
        'course_document_id' => $doc->id,
        'chunk_index' => 0,
        'content' => 'identical match',
        'embedding' => [1.0, 0.0, 0.0],
    ]);
    CourseDocumentChunk::create([
        'course_document_id' => $doc->id,
        'chunk_index' => 1,
        'content' => 'orthogonal',
        'embedding' => [0.0, 1.0, 0.0],
    ]);
    CourseDocumentChunk::create([
        'course_document_id' => $doc->id,
        'chunk_index' => 2,
        'content' => 'partial',
        'embedding' => [0.7071, 0.7071, 0.0],
    ]);

    $hits = app(DocumentRetrievalService::class)
        ->retrieveForCourse($this->course, 'apa pertanyaannya?', topK: 2);

    expect($hits)->toHaveCount(2);
    expect($hits->first()['chunk']->content)->toBe('identical match');
    expect($hits->first()['score'])->toBeGreaterThan($hits[1]['score']);
});

it('injects retrieved citations into the tutor system prompt', function () {
    Http::fake([
        'api.openai.com/v1/embeddings' => Http::response([
            'model' => 'text-embedding-3-small',
            'usage' => ['total_tokens' => 5],
            'data' => [
                ['index' => 0, 'embedding' => [1.0, 0.0]],
            ],
        ], 200),
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['role' => 'assistant', 'content' => 'Jawab pakai [Sumber 1].']]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5, 'total_tokens' => 15],
        ], 200),
    ]);

    $doc = CourseDocument::create([
        'course_id' => $this->course->id,
        'uploaded_by_user_id' => $this->instructor->id,
        'title' => 'Modul 5C',
        'source_type' => 'paste',
        'status' => 'ready',
    ]);
    CourseDocumentChunk::create([
        'course_document_id' => $doc->id,
        'chunk_index' => 0,
        'content' => 'Character, capacity, capital, collateral, condition.',
        'embedding' => [1.0, 0.0],
    ]);

    $student = User::factory()->create();
    app(TutorService::class)->sendMessage(
        user: $student,
        userMessage: 'Apa itu 5C?',
        course: $this->course,
    );

    Http::assertSent(function ($request) {
        if (! str_contains($request->url(), 'chat/completions')) {
            return false;
        }
        $systemPrompt = collect($request->data()['messages'])
            ->firstWhere('role', 'system')['content'] ?? '';

        return str_contains($systemPrompt, 'REFERENSI MATERI')
            && str_contains($systemPrompt, 'Modul 5C')
            && str_contains($systemPrompt, 'Character, capacity');
    });
});

it('lets the instructor upload a .txt file and runs ingestion', function () {
    Http::fake([
        'api.openai.com/v1/embeddings' => Http::response([
            'model' => 'text-embedding-3-small',
            'usage' => ['total_tokens' => 10],
            'data' => [
                ['index' => 0, 'embedding' => [0.1, 0.2]],
            ],
        ], 200),
    ]);

    $file = UploadedFile::fake()->createWithContent(
        'modul-1.txt',
        'Isi modul pertama tentang analisa kredit.',
    );

    $this->actingAs($this->instructor)
        ->post(route('admin.courses.documents.store', ['course' => $this->course->id]), [
            'title' => 'Modul 1',
            'source_type' => 'upload',
            'file' => $file,
        ])
        ->assertSessionHas('success');

    $doc = CourseDocument::where('course_id', $this->course->id)->first();
    expect($doc)->not->toBeNull();
    expect($doc->status)->toBe('ready');
    expect($doc->filename)->toBe('modul-1.txt');
    expect($doc->chunks()->count())->toBe(1);
});

it('extracts text from a .pdf upload and runs ingestion', function () {
    $this->app->instance(PdfTextExtractor::class, new class extends PdfTextExtractor
    {
        public function extract(string $path): string
        {
            return 'Isi PDF: pengantar manajemen risiko kredit.';
        }
    });

    Http::fake([
        'api.openai.com/v1/embeddings' => Http::response([
            'model' => 'text-embedding-3-small',
            'usage' => ['total_tokens' => 12],
            'data' => [
                ['index' => 0, 'embedding' => [0.5, 0.5]],
            ],
        ], 200),
    ]);

    $file = UploadedFile::fake()->create('manual.pdf', 50, 'application/pdf');

    $this->actingAs($this->instructor)
        ->post(route('admin.courses.documents.store', ['course' => $this->course->id]), [
            'title' => 'Manual Risiko',
            'source_type' => 'upload',
            'file' => $file,
        ])
        ->assertSessionHas('success');

    $doc = CourseDocument::where('course_id', $this->course->id)->first();
    expect($doc->status)->toBe('ready');
    expect($doc->filename)->toBe('manual.pdf');
    expect($doc->chunks()->first()->content)->toContain('manajemen risiko');
});

it('rejects a PDF that yields no extractable text (scanned/image)', function () {
    $this->app->instance(PdfTextExtractor::class, new class extends PdfTextExtractor
    {
        public function extract(string $path): string
        {
            return '';
        }
    });

    $file = UploadedFile::fake()->create('scanned.pdf', 50, 'application/pdf');

    $this->actingAs($this->instructor)
        ->post(route('admin.courses.documents.store', ['course' => $this->course->id]), [
            'title' => 'Hasil Scan',
            'source_type' => 'upload',
            'file' => $file,
        ])
        ->assertSessionHasErrors('file');

    expect(CourseDocument::count())->toBe(0);
});

it('deletes a document and removes the stored file', function () {
    $doc = CourseDocument::create([
        'course_id' => $this->course->id,
        'uploaded_by_user_id' => $this->instructor->id,
        'title' => 'Hapus',
        'source_type' => 'upload',
        'filename' => 'x.txt',
        'storage_path' => 'course-documents/x.txt',
        'status' => 'ready',
    ]);
    Storage::put($doc->storage_path, 'isi');

    $this->actingAs($this->instructor)
        ->delete(route('admin.courses.documents.destroy', [
            'course' => $this->course->id,
            'document' => $doc->id,
        ]))
        ->assertSessionHas('success');

    expect(CourseDocument::find($doc->id))->toBeNull();
    Storage::assertMissing('course-documents/x.txt');
});

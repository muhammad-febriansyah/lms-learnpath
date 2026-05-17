<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseDocument;
use App\Services\AI\DocumentIngestionService;
use App\Services\AI\PdfTextExtractor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CourseDocumentController extends Controller
{
    public function __construct(
        private readonly DocumentIngestionService $ingestion,
        private readonly PdfTextExtractor $pdfExtractor,
    ) {}

    public function index(Request $request, Course $course): Response
    {
        $this->authorize('update', $course);

        $documents = CourseDocument::query()
            ->where('course_id', $course->id)
            ->with('uploader:id,name')
            ->latest('id')
            ->get()
            ->map(fn (CourseDocument $d) => [
                'id' => $d->id,
                'title' => $d->title,
                'source_type' => $d->source_type,
                'filename' => $d->filename,
                'status' => $d->status,
                'error_message' => $d->error_message,
                'total_chunks' => $d->total_chunks,
                'total_tokens' => $d->total_tokens,
                'uploader' => $d->uploader ? ['id' => $d->uploader->id, 'name' => $d->uploader->name] : null,
                'created_at' => $d->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/courses/documents/index', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'documents' => $documents,
        ]);
    }

    public function store(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'source_type' => ['required', 'in:upload,paste'],
            'file' => ['nullable', 'required_if:source_type,upload', 'file', 'mimes:txt,md,pdf', 'max:5120'],
            'content' => ['nullable', 'required_if:source_type,paste', 'string', 'max:50000'],
        ], [
            'required_if' => ':attribute wajib diisi.',
            'mimes' => 'Hanya file .txt, .md, dan .pdf yang didukung.',
            'max' => ':attribute terlalu besar.',
        ], [
            'title' => 'Judul materi',
            'file' => 'File',
            'content' => 'Konten',
        ]);

        $rawText = '';
        $filename = null;
        $mime = null;
        $storagePath = null;

        if ($data['source_type'] === 'upload') {
            $file = $request->file('file');
            $filename = $file->getClientOriginalName();
            $mime = $file->getMimeType();
            $extension = strtolower((string) $file->getClientOriginalExtension());

            if ($extension === 'pdf') {
                try {
                    $rawText = $this->pdfExtractor->extract($file->getRealPath());
                } catch (RuntimeException $e) {
                    return back()->withErrors(['file' => $e->getMessage()]);
                }

                if (trim($rawText) === '') {
                    return back()->withErrors([
                        'file' => 'PDF tidak punya teks yang bisa diekstrak (mungkin hasil scan / image-only). Paste teksnya secara manual.',
                    ]);
                }
            } else {
                $rawText = (string) file_get_contents($file->getRealPath());
            }

            $storagePath = $file->store("course-documents/{$course->id}");
        } else {
            $rawText = (string) $data['content'];
        }

        $document = CourseDocument::create([
            'course_id' => $course->id,
            'uploaded_by_user_id' => $request->user()->id,
            'title' => $data['title'],
            'source_type' => $data['source_type'],
            'filename' => $filename,
            'mime' => $mime,
            'storage_path' => $storagePath,
            'status' => CourseDocument::STATUS_PENDING,
        ]);

        $this->ingestion->ingest($document, $rawText);

        $document->refresh();

        $message = match ($document->status) {
            CourseDocument::STATUS_READY => "Materi '{$document->title}' siap dipakai Tutor ({$document->total_chunks} potongan).",
            CourseDocument::STATUS_FAILED => "Materi '{$document->title}' gagal diproses: {$document->error_message}",
            default => "Materi '{$document->title}' tersimpan, masih diproses.",
        };

        return back()->with(
            $document->status === CourseDocument::STATUS_READY ? 'success' : 'error',
            $message,
        );
    }

    public function destroy(Request $request, Course $course, CourseDocument $document): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($document->course_id === $course->id, 404);

        if ($document->storage_path) {
            Storage::delete($document->storage_path);
        }
        $document->delete();

        return back()->with('success', 'Materi referensi dihapus.');
    }
}

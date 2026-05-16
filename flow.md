# Claude Code Flow — LMS + Skill Matrix + UI Standard
## Laravel 13 + React Inertia + MySQL + shadcn/ui

Dokumen ini adalah instruksi gabungan untuk Claude Code agar membangun sistem:

1. LMS
2. Pre Test dan Post Test
3. Video Upload
4. Embed Link
5. Embed YouTube
6. SCORM
7. Certificate
8. Competency / Skill Matrix
9. OJT Assessment
10. Supervisor Review
11. Skill Gap
12. Training Recommendation
13. UI standard dengan shadcn/ui

Stack:

```text
Laravel 13
React
Inertia.js
TypeScript
Tailwind CSS
shadcn/ui
MySQL
Eloquent ORM
Laravel Form Request
```

---

# 1. Prinsip Arsitektur

## 1.1 Laravel Inertia Tidak Pakai API untuk Halaman Utama

Gunakan pola:

```text
routes/web.php
→ Laravel Controller
→ Eloquent query + eager loading
→ Inertia::render()
→ React page menerima props
→ Form submit pakai useForm/router dari @inertiajs/react
→ Laravel Controller proses data
→ redirect back / redirect route
```

Jangan gunakan pola ini untuk halaman utama:

```text
React SPA
→ React Router
→ Axios fetch REST API
→ Controller API
```

API hanya dibuat jika dibutuhkan untuk:

```text
Mobile app
Webhook payment
Integrasi pihak ketiga
SCORM runtime tracking endpoint
Public API
```

---

# 2. Modul Utama Sistem

```text
LMS Core
├── Course
├── Section / Module
├── Lesson
│   ├── Video Upload
│   ├── Embed Link
│   ├── Embed YouTube
│   └── SCORM
├── Enrollment
├── Lesson Progress
├── Pre Test
├── Post Test
├── Certificate
│
└── Competency & Skill Matrix
    ├── Master Jabatan / Position
    ├── Master Kompetensi / Competency
    ├── Position Competency Target
    ├── Course Competency Mapping
    ├── OJT Score
    ├── Supervisor Review
    ├── User Competency Profile
    ├── Skill Gap
    └── Training Recommendation
```

---

# 3. Flow Besar LMS

```text
Admin login
→ Admin membuat course
→ Admin membuat pre test
→ Admin membuat section/module
→ Admin membuat lesson:
   - video
   - embed_link
   - youtube
   - scorm
→ Admin membuat post test
→ Admin mapping course ke competency
→ Admin publish course

Peserta login
→ Peserta enroll course
→ Peserta mengerjakan pre test
→ Materi terbuka
→ Peserta belajar lesson
→ Progress tersimpan
→ Peserta mengerjakan post test
→ Jika lulus, certificate terbit
→ Sistem update user competency profile
→ Sistem hitung skill gap
→ Sistem tampilkan rekomendasi training
```

---

# 4. Flow Skill Matrix

```text
HR/Admin membuat master jabatan
→ HR/Admin membuat master kompetensi
→ HR/Admin menentukan target kompetensi per jabatan
→ Instructor/HR mapping course ke kompetensi
→ Peserta menyelesaikan course
→ Peserta menyelesaikan quiz/final assessment
→ Supervisor memberi OJT score
→ Supervisor/Manager memberi review
→ Sistem membaca certificate status
→ Sistem menghitung actual level user
→ Sistem membandingkan target vs actual
→ Sistem menghasilkan skill gap
→ Sistem memberi rekomendasi course / OJT
```

---

# 5. Level Kompetensi

Gunakan skala level 0 sampai 5.

```text
0 = Belum ada data
1 = Awareness
2 = Basic
3 = Competent
4 = Proficient
5 = Expert
```

Formula gap:

```text
gap = actual_level - target_level
```

Makna gap:

```text
gap >= 1  = melebihi target
gap = 0   = sesuai target
gap = -1  = kurang 1 level
gap <= -2 = gap tinggi
```

---

# 6. UI/UX Standard Wajib

Semua halaman harus:

```text
Responsive
Clean
Modern
Konsisten
Mudah dibaca
Tidak terlalu padat
Menggunakan shadcn/ui
Menggunakan TypeScript
Menggunakan komponen reusable
```

## 6.1 Responsive Rule

Gunakan layout responsive:

```text
Mobile:
- 1 kolom
- Card stack
- Table bisa horizontal scroll
- Dialog fullscreen jika perlu

Tablet:
- 2 kolom jika memungkinkan
- Sidebar bisa collapsible

Desktop:
- Grid 2-4 kolom
- Sidebar course player tetap terlihat
- DataTable lengkap
```

Contoh class Tailwind:

```tsx
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
```

```tsx
<div className="overflow-x-auto rounded-xl border">
```

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

---

# 7. Global Form Standard

Semua form wajib mengikuti aturan ini:

```text
1. Semua input wajib punya placeholder.
2. Semua field required wajib menampilkan tanda *.
3. Semua pesan validasi wajib Bahasa Indonesia.
4. Error ditampilkan tepat di bawah field.
5. Gunakan shadcn/ui Input, Select, Textarea, Button, Calendar, Popover.
6. Submit menggunakan useForm dari @inertiajs/react.
7. Jangan pakai axios untuk form utama.
8. Jangan kirim form manual pakai fetch.
9. Semua form harus responsive.
10. Semua label harus jelas.
```

---

# 8. Required Label Component

Buat komponen:

```text
resources/js/components/form/required-label.tsx
```

Isi:

```tsx
import { Label } from '@/components/ui/label';

type RequiredLabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
};

export function RequiredLabel({
  htmlFor,
  children,
  required = false,
}: RequiredLabelProps) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  );
}
```

Contoh penggunaan:

```tsx
<RequiredLabel htmlFor="title" required>
  Judul Course
</RequiredLabel>
```

---

# 9. Field Error Component

Buat komponen:

```text
resources/js/components/form/field-error.tsx
```

Isi:

```tsx
type FieldErrorProps = {
  message?: string;
};

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive">
      {message}
    </p>
  );
}
```

---

# 10. Form Field Pattern

Gunakan pattern ini di semua form.

```tsx
<div className="space-y-2">
  <RequiredLabel htmlFor="title" required>
    Judul Course
  </RequiredLabel>

  <Input
    id="title"
    placeholder="Contoh: Belajar Digital Marketing Dasar"
    value={form.data.title}
    onChange={(event) => form.setData('title', event.target.value)}
  />

  <FieldError message={form.errors.title} />
</div>
```

---

# 11. Placeholder Standard

Placeholder wajib deskriptif, bukan hanya "Masukkan data".

Contoh bagus:

```text
Judul Course:
Contoh: Belajar Digital Marketing Dasar

Nama Kompetensi:
Contoh: Analisa Kredit

Nama Jabatan:
Contoh: Account Officer

Harga:
Contoh: Rp 250.000

Tanggal Terbit:
Pilih tanggal terbit sertifikat

Deskripsi:
Jelaskan tujuan, materi, dan hasil yang diharapkan
```

Contoh buruk:

```text
Masukkan judul
Input data
Tulis di sini
```

---

# 12. Validasi Bahasa Indonesia

Gunakan Form Request Laravel.

Semua validasi wajib menggunakan Bahasa Indonesia melalui:

```text
messages()
attributes()
```

Contoh:

```php
public function messages(): array
{
    return [
        'required' => ':attribute wajib diisi.',
        'string' => ':attribute harus berupa teks.',
        'max' => ':attribute maksimal :max karakter.',
        'min' => ':attribute minimal :min karakter.',
        'numeric' => ':attribute harus berupa angka.',
        'integer' => ':attribute harus berupa angka bulat.',
        'boolean' => ':attribute harus bernilai benar atau salah.',
        'exists' => ':attribute tidak valid.',
        'unique' => ':attribute sudah digunakan.',
        'date' => ':attribute harus berupa tanggal yang valid.',
        'after_or_equal' => ':attribute harus sama atau setelah :date.',
        'before_or_equal' => ':attribute harus sama atau sebelum :date.',
        'file' => ':attribute harus berupa file.',
        'mimes' => ':attribute harus berformat: :values.',
        'max.file' => 'Ukuran :attribute maksimal :max KB.',
    ];
}

public function attributes(): array
{
    return [
        'title' => 'Judul',
        'slug' => 'Slug',
        'description' => 'Deskripsi',
        'price' => 'Harga',
        'category_id' => 'Kategori',
        'instructor_id' => 'Instruktur',
        'thumbnail' => 'Thumbnail',
        'passing_score' => 'Nilai kelulusan',
        'max_attempts' => 'Maksimal percobaan',
        'target_level' => 'Target level',
        'actual_level' => 'Aktual level',
        'competency_id' => 'Kompetensi',
        'position_id' => 'Jabatan',
        'issue_date' => 'Tanggal terbit',
        'expiry_date' => 'Tanggal kedaluwarsa',
    ];
}
```

---

# 13. Contoh StoreCourseRequest

File:

```text
app/Http/Requests/Admin/StoreCourseRequest.php
```

Contoh:

```php
public function rules(): array
{
    return [
        'category_id' => ['nullable', 'exists:categories,id'],
        'instructor_id' => ['nullable', 'exists:users,id'],
        'title' => ['required', 'string', 'max:255'],
        'slug' => ['required', 'string', 'max:255', 'unique:courses,slug'],
        'description' => ['nullable', 'string'],
        'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        'price' => ['required', 'integer', 'min:0'],
        'level' => ['nullable', 'string', 'max:50'],
        'duration_minutes' => ['nullable', 'integer', 'min:0'],
        'pre_test_required' => ['boolean'],
        'post_test_required' => ['boolean'],
        'passing_score' => ['required', 'integer', 'min:0', 'max:100'],
        'max_attempts' => ['required', 'integer', 'min:1', 'max:10'],
        'is_published' => ['boolean'],
    ];
}

public function messages(): array
{
    return [
        'required' => ':attribute wajib diisi.',
        'string' => ':attribute harus berupa teks.',
        'integer' => ':attribute harus berupa angka bulat.',
        'min' => ':attribute minimal :min.',
        'max' => ':attribute maksimal :max.',
        'exists' => ':attribute tidak valid.',
        'unique' => ':attribute sudah digunakan.',
        'image' => ':attribute harus berupa gambar.',
        'mimes' => ':attribute harus berformat: :values.',
    ];
}

public function attributes(): array
{
    return [
        'category_id' => 'Kategori',
        'instructor_id' => 'Instruktur',
        'title' => 'Judul course',
        'slug' => 'Slug',
        'description' => 'Deskripsi',
        'thumbnail' => 'Thumbnail',
        'price' => 'Harga',
        'level' => 'Level',
        'duration_minutes' => 'Durasi',
        'passing_score' => 'Nilai kelulusan',
        'max_attempts' => 'Maksimal percobaan',
    ];
}
```

Catatan harga:

```text
price disimpan sebagai integer rupiah.
Contoh:
Rp 250.000 disimpan sebagai 250000.
```

---

# 14. Rupiah Input Wajib

Untuk field uang/harga, jangan pakai input number polos.

Buat reusable component:

```text
resources/js/components/form/rupiah-input.tsx
```

Isi:

```tsx
import { Input } from '@/components/ui/input';

type RupiahInputProps = {
  id?: string;
  value: number | string;
  placeholder?: string;
  onChange: (value: number) => void;
};

function formatRupiah(value: number | string) {
  const numericValue = String(value || '').replace(/\D/g, '');

  if (!numericValue) return '';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(numericValue));
}

export function RupiahInput({
  id,
  value,
  placeholder = 'Contoh: Rp 250.000',
  onChange,
}: RupiahInputProps) {
  return (
    <Input
      id={id}
      inputMode="numeric"
      placeholder={placeholder}
      value={formatRupiah(value)}
      onChange={(event) => {
        const rawValue = event.target.value.replace(/\D/g, '');
        onChange(rawValue ? Number(rawValue) : 0);
      }}
    />
  );
}
```

Contoh penggunaan:

```tsx
<RupiahInput
  id="price"
  value={form.data.price}
  placeholder="Contoh: Rp 250.000"
  onChange={(value) => form.setData('price', value)}
/>
```

MySQL:

```php
$table->unsignedBigInteger('price')->default(0);
```

Alasan:

```text
Rupiah tidak butuh angka desimal.
Lebih aman simpan sebagai integer.
Lebih mudah diformat di frontend.
```

---

# 15. Date Picker Wajib

Untuk field tanggal, gunakan Date Picker shadcn/ui.

Komponen yang dibutuhkan:

```bash
npx shadcn@latest add button
npx shadcn@latest add calendar
npx shadcn@latest add popover
```

Buat reusable component:

```text
resources/js/components/form/date-picker-field.tsx
```

Isi:

```tsx
import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerFieldProps = {
  value?: string | null;
  placeholder?: string;
  onChange: (value: string | null) => void;
};

export function DatePickerField({
  value,
  placeholder = 'Pilih tanggal',
  onChange,
}: DatePickerFieldProps) {
  const selectedDate = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              onChange(null);
              return;
            }

            onChange(format(date, 'yyyy-MM-dd'));
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
```

Contoh penggunaan:

```tsx
<div className="space-y-2">
  <RequiredLabel htmlFor="issued_at" required>
    Tanggal Terbit
  </RequiredLabel>

  <DatePickerField
    value={form.data.issued_at}
    placeholder="Pilih tanggal terbit sertifikat"
    onChange={(value) => form.setData('issued_at', value)}
  />

  <FieldError message={form.errors.issued_at} />
</div>
```

---

# 16. DataTable Wajib untuk List Data

Semua halaman list data wajib menggunakan reusable DataTable berbasis shadcn/ui Table.

DataTable harus mendukung:

```text
Search
Sorting
Pagination
Column visibility jika diperlukan
Action dropdown
Responsive horizontal scroll
Empty state
Loading state
Badge status
```

Gunakan untuk halaman:

```text
Course List
User List
Position List
Competency List
Position Competency Target List
Course Competency Mapping List
Enrollment List
Assessment List
Certificate List
Skill Matrix List
OJT Assessment List
Supervisor Review List
```

---

# 17. Struktur DataTable Component

Buat folder:

```text
resources/js/components/data-table/
├── data-table.tsx
├── data-table-pagination.tsx
├── data-table-view-options.tsx
├── data-table-column-header.tsx
├── data-table-row-actions.tsx
└── empty-state.tsx
```

Gunakan shadcn/ui:

```text
Table
Button
Input
DropdownMenu
Checkbox
Badge
Select
Skeleton
```

Install:

```bash
npx shadcn@latest add table
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dropdown-menu
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add skeleton
```

Install TanStack Table:

```bash
npm install @tanstack/react-table
```

---

# 18. DataTable Usage Pattern

Contoh halaman:

```text
resources/js/pages/admin/competencies/index.tsx
```

Props dari Laravel:

```ts
type Props = {
  competencies: {
    data: Competency[];
    links: unknown[];
    meta: unknown;
  };
  filters: {
    search?: string;
  };
};
```

Layout:

```tsx
<Card>
  <CardHeader>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardTitle>Master Kompetensi</CardTitle>
        <CardDescription>
          Kelola daftar kompetensi yang akan diukur pada skill matrix.
        </CardDescription>
      </div>

      <Button>
        Tambah Kompetensi
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <DataTable
      columns={columns}
      data={competencies.data}
      searchPlaceholder="Cari nama kompetensi..."
    />
  </CardContent>
</Card>
```

---

# 19. Search Filter Pattern dengan Inertia

Gunakan `router.get` agar tetap server-side.

```tsx
import { router } from '@inertiajs/react';

function handleSearch(value: string) {
  router.get(
    route('admin.competencies.index'),
    { search: value },
    {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    }
  );
}
```

Controller:

```php
$competencies = Competency::query()
    ->when($request->search, function ($query, $search) {
        $query->where('name', 'like', "%{$search}%")
            ->orWhere('category', 'like', "%{$search}%");
    })
    ->latest()
    ->paginate(10)
    ->withQueryString();

return Inertia::render('admin/competencies/index', [
    'competencies' => $competencies,
    'filters' => $request->only('search'),
]);
```

---

# 20. Badge Standard

Buat reusable badge:

```text
resources/js/components/status/status-badge.tsx
```

Status LMS:

```text
draft
published
active
in_progress
completed
failed
expired
locked
passed
not_started
not_issued
issued
```

Status Skill Matrix:

```text
met
gap
exceeded
no_data
pending_review
approved
rejected
```

Mapping label Bahasa Indonesia:

```tsx
const statusLabels: Record<string, string> = {
  draft: 'Draft',
  published: 'Terbit',
  active: 'Aktif',
  in_progress: 'Sedang Berjalan',
  completed: 'Selesai',
  failed: 'Gagal',
  expired: 'Kedaluwarsa',
  locked: 'Terkunci',
  passed: 'Lulus',
  not_started: 'Belum Mulai',
  not_issued: 'Belum Terbit',
  issued: 'Terbit',
  met: 'Sesuai Target',
  gap: 'Ada Gap',
  exceeded: 'Melebihi Target',
  no_data: 'Belum Ada Data',
  pending_review: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};
```

---

# 21. Database Schema LMS Core

## 21.1 categories

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

## 21.2 courses

```php
Schema::create('courses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('instructor_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('title');
    $table->string('slug')->unique();
    $table->longText('description')->nullable();
    $table->string('thumbnail')->nullable();
    $table->unsignedBigInteger('price')->default(0);
    $table->string('level')->nullable();
    $table->unsignedInteger('duration_minutes')->default(0);
    $table->boolean('pre_test_required')->default(false);
    $table->boolean('post_test_required')->default(false);
    $table->unsignedTinyInteger('passing_score')->default(70);
    $table->unsignedTinyInteger('max_attempts')->default(3);
    $table->boolean('is_published')->default(false);
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
});
```

## 21.3 course_sections

```php
Schema::create('course_sections', function (Blueprint $table) {
    $table->id();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('description')->nullable();
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

## 21.4 lessons

```php
Schema::create('lessons', function (Blueprint $table) {
    $table->id();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_section_id')->constrained()->cascadeOnDelete();
    $table->foreignId('scorm_package_id')->nullable()->constrained()->nullOnDelete();
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('type');
    $table->longText('content')->nullable();
    $table->string('video_path')->nullable();
    $table->string('embed_url')->nullable();
    $table->string('youtube_url')->nullable();
    $table->string('youtube_video_id')->nullable();
    $table->unsignedInteger('duration_minutes')->default(0);
    $table->unsignedInteger('sort_order')->default(0);
    $table->boolean('is_preview')->default(false);
    $table->boolean('is_required')->default(true);
    $table->timestamps();

    $table->index(['course_id', 'course_section_id']);
    $table->index('type');
});
```

Value `lessons.type`:

```text
video
embed_link
youtube
scorm
text
pdf
```

## 21.5 enrollments

```php
Schema::create('enrollments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->string('status')->default('active');
    $table->unsignedTinyInteger('progress_percent')->default(0);
    $table->string('pre_test_status')->default('not_started');
    $table->string('post_test_status')->default('not_started');
    $table->string('certificate_status')->default('not_issued');
    $table->timestamp('enrolled_at')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamp('expired_at')->nullable();
    $table->timestamps();

    $table->unique(['user_id', 'course_id']);
    $table->index('status');
});
```

## 21.6 lesson_progress

```php
Schema::create('lesson_progress', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
    $table->string('status')->default('not_started');
    $table->unsignedTinyInteger('progress_percent')->default(0);
    $table->unsignedInteger('last_position')->default(0);
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();

    $table->unique(['user_id', 'lesson_id']);
    $table->index(['user_id', 'course_id']);
});
```

---

# 22. Database Schema Assessment

## 22.1 assessments

```php
Schema::create('assessments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('type');
    $table->text('description')->nullable();
    $table->unsignedTinyInteger('passing_score')->default(70);
    $table->unsignedTinyInteger('max_attempts')->default(3);
    $table->unsignedInteger('duration_minutes')->nullable();
    $table->boolean('is_required')->default(true);
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();

    $table->index(['course_id', 'type']);
});
```

Value `assessments.type`:

```text
pre_test
post_test
quiz
```

## 22.2 questions

```php
Schema::create('questions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
    $table->text('question_text');
    $table->string('type')->default('multiple_choice');
    $table->unsignedInteger('points')->default(1);
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

## 22.3 question_options

```php
Schema::create('question_options', function (Blueprint $table) {
    $table->id();
    $table->foreignId('question_id')->constrained()->cascadeOnDelete();
    $table->text('option_text');
    $table->boolean('is_correct')->default(false);
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();
});
```

## 22.4 assessment_attempts

```php
Schema::create('assessment_attempts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('submitted_at')->nullable();
    $table->unsignedTinyInteger('score')->default(0);
    $table->string('status')->default('in_progress');
    $table->boolean('passed')->default(false);
    $table->timestamps();

    $table->index(['user_id', 'course_id']);
});
```

## 22.5 assessment_answers

```php
Schema::create('assessment_answers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('assessment_attempt_id')->constrained()->cascadeOnDelete();
    $table->foreignId('question_id')->constrained()->cascadeOnDelete();
    $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
    $table->text('answer_text')->nullable();
    $table->boolean('is_correct')->default(false);
    $table->unsignedInteger('point_earned')->default(0);
    $table->timestamps();
});
```

---

# 23. Database Schema SCORM dan Certificate

## 23.1 scorm_packages

```php
Schema::create('scorm_packages', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('zip_path');
    $table->string('extracted_path')->nullable();
    $table->string('manifest_path')->nullable();
    $table->string('launch_file')->nullable();
    $table->string('version')->nullable();
    $table->string('status')->default('uploaded');
    $table->timestamps();
});
```

## 23.2 scorm_trackings

```php
Schema::create('scorm_trackings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
    $table->foreignId('scorm_package_id')->constrained()->cascadeOnDelete();
    $table->string('lesson_status')->nullable();
    $table->string('completion_status')->nullable();
    $table->decimal('score_raw', 8, 2)->nullable();
    $table->decimal('score_min', 8, 2)->nullable();
    $table->decimal('score_max', 8, 2)->nullable();
    $table->string('total_time')->nullable();
    $table->string('session_time')->nullable();
    $table->longText('suspend_data')->nullable();
    $table->json('cmi_data')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'course_id', 'lesson_id']);
});
```

## 23.3 certificates

```php
Schema::create('certificates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->string('certificate_number')->unique();
    $table->string('verification_code')->unique();
    $table->string('pdf_path')->nullable();
    $table->timestamp('issued_at')->nullable();
    $table->timestamp('expired_at')->nullable();
    $table->string('status')->default('issued');
    $table->timestamps();

    $table->unique(['user_id', 'course_id']);
});
```

---

# 24. Database Schema Skill Matrix

## 24.1 positions

```php
Schema::create('positions', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('division')->nullable();
    $table->string('branch')->nullable();
    $table->text('description')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->index(['division', 'branch']);
});
```

## 24.2 employee_profiles

```php
Schema::create('employee_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('employee_number')->nullable();
    $table->string('division')->nullable();
    $table->string('branch')->nullable();
    $table->date('joined_at')->nullable();
    $table->timestamps();

    $table->unique('user_id');
    $table->index(['position_id', 'division', 'branch']);
});
```

## 24.3 competencies

```php
Schema::create('competencies', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('category')->nullable();
    $table->text('description')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->index('category');
});
```

## 24.4 position_competency_targets

```php
Schema::create('position_competency_targets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('position_id')->constrained()->cascadeOnDelete();
    $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('target_level');
    $table->boolean('is_required')->default(true);
    $table->timestamps();

    $table->unique(['position_id', 'competency_id']);
});
```

## 24.5 course_competency_mappings

```php
Schema::create('course_competency_mappings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('weight')->default(1);
    $table->unsignedTinyInteger('target_level_impact')->default(1);
    $table->timestamps();

    $table->unique(['course_id', 'competency_id']);
});
```

## 24.6 ojt_assessments

```php
Schema::create('ojt_assessments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
    $table->foreignId('supervisor_id')->constrained('users')->cascadeOnDelete();
    $table->unsignedTinyInteger('rubric_score')->default(0);
    $table->unsignedTinyInteger('actual_level')->default(0);
    $table->text('notes')->nullable();
    $table->string('status')->default('pending_review');
    $table->timestamp('assessed_at')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'competency_id']);
});
```

## 24.7 supervisor_reviews

```php
Schema::create('supervisor_reviews', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
    $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
    $table->unsignedTinyInteger('rating')->default(0);
    $table->unsignedTinyInteger('actual_level')->default(0);
    $table->text('notes')->nullable();
    $table->string('approval_status')->default('pending_review');
    $table->timestamp('reviewed_at')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'competency_id']);
});
```

## 24.8 user_competencies

```php
Schema::create('user_competencies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('actual_level')->default(0);
    $table->string('source')->default('no_data');
    $table->unsignedBigInteger('source_id')->nullable();
    $table->unsignedTinyInteger('confidence_score')->default(0);
    $table->timestamp('last_evaluated_at')->nullable();
    $table->timestamps();

    $table->unique(['user_id', 'competency_id']);
});
```

## 24.9 skill_gaps

```php
Schema::create('skill_gaps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('position_id')->constrained()->cascadeOnDelete();
    $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('target_level')->default(0);
    $table->unsignedTinyInteger('actual_level')->default(0);
    $table->smallInteger('gap')->default(0);
    $table->text('recommendation')->nullable();
    $table->string('status')->default('no_data');
    $table->timestamp('calculated_at')->nullable();
    $table->timestamps();

    $table->unique(['user_id', 'position_id', 'competency_id']);
});
```

---

# 25. Model Relationship

## 25.1 Course

```php
public function category()
{
    return $this->belongsTo(Category::class);
}

public function instructor()
{
    return $this->belongsTo(User::class, 'instructor_id');
}

public function sections()
{
    return $this->hasMany(CourseSection::class)->orderBy('sort_order');
}

public function lessons()
{
    return $this->hasMany(Lesson::class)->orderBy('sort_order');
}

public function assessments()
{
    return $this->hasMany(Assessment::class);
}

public function preTest()
{
    return $this->hasOne(Assessment::class)->where('type', 'pre_test');
}

public function postTest()
{
    return $this->hasOne(Assessment::class)->where('type', 'post_test');
}

public function enrollments()
{
    return $this->hasMany(Enrollment::class);
}

public function certificates()
{
    return $this->hasMany(Certificate::class);
}

public function competencyMappings()
{
    return $this->hasMany(CourseCompetencyMapping::class);
}

public function competencies()
{
    return $this->belongsToMany(Competency::class, 'course_competency_mappings')
        ->withPivot(['weight', 'target_level_impact'])
        ->withTimestamps();
}
```

## 25.2 Position

```php
public function employeeProfiles()
{
    return $this->hasMany(EmployeeProfile::class);
}

public function competencyTargets()
{
    return $this->hasMany(PositionCompetencyTarget::class);
}

public function competencies()
{
    return $this->belongsToMany(Competency::class, 'position_competency_targets')
        ->withPivot(['target_level', 'is_required'])
        ->withTimestamps();
}
```

## 25.3 Competency

```php
public function positionTargets()
{
    return $this->hasMany(PositionCompetencyTarget::class);
}

public function courseMappings()
{
    return $this->hasMany(CourseCompetencyMapping::class);
}

public function userCompetencies()
{
    return $this->hasMany(UserCompetency::class);
}

public function skillGaps()
{
    return $this->hasMany(SkillGap::class);
}
```

## 25.4 User

```php
public function employeeProfile()
{
    return $this->hasOne(EmployeeProfile::class);
}

public function enrollments()
{
    return $this->hasMany(Enrollment::class);
}

public function certificates()
{
    return $this->hasMany(Certificate::class);
}

public function competencies()
{
    return $this->hasMany(UserCompetency::class);
}

public function skillGaps()
{
    return $this->hasMany(SkillGap::class);
}

public function ojtAssessments()
{
    return $this->hasMany(OjtAssessment::class);
}

public function supervisorReviews()
{
    return $this->hasMany(SupervisorReview::class);
}
```

---

# 26. Eager Loading Query Wajib

## 26.1 Course Index Admin

```php
$courses = Course::query()
    ->with([
        'category:id,name',
        'instructor:id,name,email',
    ])
    ->withCount([
        'sections',
        'lessons',
        'enrollments',
        'competencyMappings',
    ])
    ->when($request->search, function ($query, $search) {
        $query->where('title', 'like', "%{$search}%");
    })
    ->latest()
    ->paginate(10)
    ->withQueryString();

return Inertia::render('admin/courses/index', [
    'courses' => $courses,
    'filters' => $request->only('search'),
]);
```

## 26.2 Course Builder

```php
$course = Course::query()
    ->with([
        'category:id,name',
        'instructor:id,name,email',
        'sections' => fn ($query) => $query->orderBy('sort_order'),
        'sections.lessons' => fn ($query) => $query->orderBy('sort_order'),
        'assessments' => fn ($query) => $query->orderBy('sort_order'),
        'assessments.questions' => fn ($query) => $query->orderBy('sort_order'),
        'assessments.questions.options' => fn ($query) => $query->orderBy('sort_order'),
        'competencyMappings.competency',
    ])
    ->withCount(['lessons', 'enrollments'])
    ->findOrFail($course->id);

return Inertia::render('admin/courses/builder', [
    'course' => $course,
]);
```

## 26.3 Course Player

```php
$userId = auth()->id();

$course = Course::query()
    ->where('slug', $slug)
    ->with([
        'sections' => fn ($query) => $query->orderBy('sort_order'),
        'sections.lessons' => fn ($query) => $query->orderBy('sort_order'),
        'sections.lessons.progresses' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        },
        'preTest:id,course_id,title,type,passing_score,max_attempts,duration_minutes',
        'postTest:id,course_id,title,type,passing_score,max_attempts,duration_minutes',
        'competencyMappings.competency:id,name,category',
    ])
    ->firstOrFail();

$enrollment = Enrollment::query()
    ->where('user_id', $userId)
    ->where('course_id', $course->id)
    ->firstOrFail();

return Inertia::render('learning/course-player', [
    'course' => $course,
    'enrollment' => $enrollment,
]);
```

## 26.4 Skill Matrix Employee Detail

```php
$user = User::query()
    ->with([
        'employeeProfile.position.competencyTargets.competency',
        'competencies.competency',
        'skillGaps.competency',
        'enrollments.course.competencyMappings.competency',
        'certificates.course',
        'ojtAssessments.competency',
        'supervisorReviews.competency',
    ])
    ->findOrFail($userId);

return Inertia::render('admin/skill-matrix/show', [
    'employee' => $user,
]);
```

## 26.5 Skill Matrix Position Detail

```php
$position = Position::query()
    ->with([
        'competencyTargets.competency',
    ])
    ->findOrFail($positionId);

$employees = User::query()
    ->whereHas('employeeProfile', function ($query) use ($position) {
        $query->where('position_id', $position->id);
    })
    ->with([
        'employeeProfile',
        'competencies.competency',
        'skillGaps.competency',
    ])
    ->paginate(10)
    ->withQueryString();

return Inertia::render('admin/skill-matrix/position', [
    'position' => $position,
    'employees' => $employees,
]);
```

---

# 27. Service Layer

Buat service:

```text
app/Services/EnrollmentService.php
app/Services/LearningProgressService.php
app/Services/AssessmentService.php
app/Services/CertificateService.php
app/Services/CompetencyProfileService.php
app/Services/SkillGapService.php
app/Services/TrainingRecommendationService.php
```

## 27.1 CompetencyProfileService

Tugas:

```text
Menentukan actual_level user per competency.
```

Urutan sumber aktual level:

```text
1. OJT Score
2. Supervisor Review
3. Final Assessment
4. Certificate
5. Quiz Result
6. Course Completion
7. Self Assessment
8. No Data
```

Pseudo:

```php
public function syncUserCompetency(User $user, Competency $competency): UserCompetency
{
    $latestOjt = OjtAssessment::query()
        ->where('user_id', $user->id)
        ->where('competency_id', $competency->id)
        ->where('status', 'approved')
        ->latest('assessed_at')
        ->first();

    if ($latestOjt) {
        return $this->saveProfile($user, $competency, [
            'actual_level' => $latestOjt->actual_level,
            'source' => 'ojt',
            'source_id' => $latestOjt->id,
            'confidence_score' => 95,
        ]);
    }

    $latestReview = SupervisorReview::query()
        ->where('user_id', $user->id)
        ->where('competency_id', $competency->id)
        ->where('approval_status', 'approved')
        ->latest('reviewed_at')
        ->first();

    if ($latestReview) {
        return $this->saveProfile($user, $competency, [
            'actual_level' => $latestReview->actual_level,
            'source' => 'supervisor_review',
            'source_id' => $latestReview->id,
            'confidence_score' => 90,
        ]);
    }

    return $this->saveProfile($user, $competency, [
        'actual_level' => 0,
        'source' => 'no_data',
        'source_id' => null,
        'confidence_score' => 0,
    ]);
}
```

## 27.2 SkillGapService

Tugas:

```text
Membandingkan target level jabatan dengan actual level user.
```

Pseudo:

```php
public function calculateForUser(User $user): void
{
    $profile = $user->employeeProfile()->with('position.competencyTargets')->first();

    if (! $profile || ! $profile->position) {
        return;
    }

    foreach ($profile->position->competencyTargets as $target) {
        $userCompetency = UserCompetency::query()
            ->where('user_id', $user->id)
            ->where('competency_id', $target->competency_id)
            ->first();

        $actualLevel = $userCompetency?->actual_level ?? 0;
        $gap = $actualLevel - $target->target_level;

        SkillGap::updateOrCreate(
            [
                'user_id' => $user->id,
                'position_id' => $profile->position_id,
                'competency_id' => $target->competency_id,
            ],
            [
                'target_level' => $target->target_level,
                'actual_level' => $actualLevel,
                'gap' => $gap,
                'status' => $this->resolveStatus($actualLevel, $gap),
                'recommendation' => app(TrainingRecommendationService::class)
                    ->getRecommendationText($target->competency_id, $gap),
                'calculated_at' => now(),
            ]
        );
    }
}
```

Status rule:

```php
private function resolveStatus(int $actualLevel, int $gap): string
{
    if ($actualLevel === 0) {
        return 'no_data';
    }

    if ($gap > 0) {
        return 'exceeded';
    }

    if ($gap === 0) {
        return 'met';
    }

    return 'gap';
}
```

## 27.3 TrainingRecommendationService

Tugas:

```text
Mencari course yang relevan untuk menutup skill gap.
```

Pseudo:

```php
public function getRecommendedCourses(int $competencyId)
{
    return Course::query()
        ->where('is_published', true)
        ->whereHas('competencyMappings', function ($query) use ($competencyId) {
            $query->where('competency_id', $competencyId);
        })
        ->with(['category:id,name', 'competencyMappings.competency'])
        ->get();
}
```

---

# 28. Routes Web

Gunakan `routes/web.php`.

```php
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/my-courses', [MyCourseController::class, 'index'])->name('my-courses.index');
    Route::get('/learn/{course:slug}', [LearningController::class, 'show'])->name('learn.show');
    Route::get('/learn/{course:slug}/lessons/{lesson}', [LearningController::class, 'lesson'])->name('learn.lesson');

    Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'store'])->name('courses.enroll');
    Route::post('/lessons/{lesson}/complete', [LessonProgressController::class, 'complete'])->name('lessons.complete');

    Route::get('/assessments/{assessment}', [AssessmentController::class, 'show'])->name('assessments.show');
    Route::post('/assessments/{assessment}/start', [AssessmentAttemptController::class, 'start'])->name('assessments.start');
    Route::post('/assessment-attempts/{attempt}/submit', [AssessmentAttemptController::class, 'submit'])->name('assessment-attempts.submit');

    Route::get('/my-skill-matrix', [MySkillMatrixController::class, 'show'])->name('my-skill-matrix.show');
});

Route::middleware(['auth', 'role:super_admin|admin|hr'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('courses', AdminCourseController::class);
        Route::get('/courses/{course}/builder', CourseBuilderController::class)->name('courses.builder');

        Route::resource('positions', PositionController::class);
        Route::resource('competencies', CompetencyController::class);
        Route::resource('position-competency-targets', PositionCompetencyTargetController::class);
        Route::resource('course-competency-mappings', CourseCompetencyMappingController::class);

        Route::get('/skill-matrix', [SkillMatrixController::class, 'index'])->name('skill-matrix.index');
        Route::get('/skill-matrix/employees/{user}', [SkillMatrixController::class, 'show'])->name('skill-matrix.show');
        Route::get('/skill-matrix/positions/{position}', [SkillMatrixController::class, 'position'])->name('skill-matrix.position');

        Route::resource('ojt-assessments', OjtAssessmentController::class);
        Route::resource('supervisor-reviews', SupervisorReviewController::class);
    });
```

---

# 29. React Pages

Struktur page:

```text
resources/js/pages/
├── public/
│   ├── home.tsx
│   └── courses/
│       ├── index.tsx
│       └── show.tsx
│
├── dashboard/
│   ├── index.tsx
│   ├── my-courses.tsx
│   ├── certificates.tsx
│   └── my-skill-matrix.tsx
│
├── learning/
│   ├── course-player.tsx
│   ├── lesson-show.tsx
│   └── assessment-show.tsx
│
├── admin/
│   ├── courses/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── edit.tsx
│   │   └── builder.tsx
│   ├── positions/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── edit.tsx
│   ├── competencies/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── edit.tsx
│   ├── skill-matrix/
│   │   ├── index.tsx
│   │   ├── show.tsx
│   │   └── position.tsx
│   ├── ojt-assessments/
│   └── supervisor-reviews/
```

---

# 30. Reusable Components

Buat reusable components:

```text
resources/js/components/form/
├── required-label.tsx
├── field-error.tsx
├── rupiah-input.tsx
├── date-picker-field.tsx
├── form-section.tsx
└── select-field.tsx

resources/js/components/data-table/
├── data-table.tsx
├── data-table-pagination.tsx
├── data-table-column-header.tsx
├── data-table-view-options.tsx
├── data-table-row-actions.tsx
└── empty-state.tsx

resources/js/components/lms/
├── course-card.tsx
├── course-player-sidebar.tsx
├── lesson-content-renderer.tsx
├── lesson-status-badge.tsx
├── assessment-form.tsx
└── assessment-result-card.tsx

resources/js/components/skill-matrix/
├── skill-matrix-table.tsx
├── skill-gap-badge.tsx
├── competency-level-badge.tsx
├── recommendation-card.tsx
├── employee-skill-summary-card.tsx
└── competency-source-badge.tsx
```

---

# 31. Skill Matrix Table UI

Tampilan wajib:

```text
Karyawan
Jabatan
Kompetensi
Target Level
Aktual Level
Gap
Sumber Aktual
Rekomendasi
Aksi
```

Contoh data:

```text
Andi Saputra | Account Officer | Analisa Kredit       | 4 | 4 |  0 | Final Assessment | Maintain / advanced case study
Andi Saputra | Account Officer | Survey Debitur       | 4 | 3 | -1 | OJT Supervisor   | OJT Survey Debitur Lanjutan
Andi Saputra | Account Officer | Komunikasi Nasabah   | 3 | 4 |  1 | OJT + Review     | Bisa menjadi mentor
Andi Saputra | Account Officer | Manajemen Risiko     | 3 | 2 | -1 | Quiz             | Training Manajemen Risiko Kredit
Andi Saputra | Account Officer | Collection Dasar     | 2 | 0 | -2 | Belum Ada        | Wajib ikut Course Collection Dasar
```

Badge gap:

```text
gap >= 1: Melebihi Target
gap = 0: Sesuai Target
gap = -1: Gap Ringan
gap <= -2: Gap Tinggi
actual_level = 0: Belum Ada Data
```

---

# 32. Form Master Position

Fields:

```text
name required
division required
branch nullable
description nullable
is_active boolean
```

Placeholder:

```text
name: Contoh: Account Officer
division: Contoh: Sales & Lending
branch: Contoh: Jakarta Selatan
description: Jelaskan tanggung jawab utama jabatan ini
```

Validation Indonesia:

```php
'name.required' => 'Nama jabatan wajib diisi.',
'division.required' => 'Divisi wajib diisi.',
```

---

# 33. Form Master Competency

Fields:

```text
name required
category required
description nullable
is_active boolean
```

Placeholder:

```text
name: Contoh: Analisa Kredit
category: Contoh: Technical Skill
description: Jelaskan definisi kompetensi dan indikator penilaiannya
```

---

# 34. Form Position Competency Target

Fields:

```text
position_id required
competency_id required
target_level required
is_required boolean
```

Placeholder:

```text
position_id: Pilih jabatan
competency_id: Pilih kompetensi
target_level: Pilih target level kompetensi
```

Gunakan Select shadcn/ui.

Target level options:

```text
0 - Belum ada data
1 - Awareness
2 - Basic
3 - Competent
4 - Proficient
5 - Expert
```

---

# 35. Form Course Competency Mapping

Fields:

```text
course_id required
competency_id required
weight required
target_level_impact required
```

Placeholder:

```text
course_id: Pilih course
competency_id: Pilih kompetensi yang ditingkatkan
weight: Contoh: 80
target_level_impact: Pilih estimasi peningkatan level
```

---

# 36. Form OJT Assessment

Fields:

```text
user_id required
course_id nullable
competency_id required
supervisor_id required
rubric_score required
actual_level required
notes nullable
status required
assessed_at required date
```

Placeholder:

```text
user_id: Pilih karyawan
course_id: Pilih course terkait jika ada
competency_id: Pilih kompetensi yang dinilai
supervisor_id: Pilih supervisor penilai
rubric_score: Contoh: 85
actual_level: Pilih level aktual hasil observasi
notes: Tulis catatan hasil praktik di lapangan
assessed_at: Pilih tanggal penilaian
```

Tanggal wajib pakai `DatePickerField`.

---

# 37. Form Supervisor Review

Fields:

```text
user_id required
competency_id required
reviewer_id required
rating required
actual_level required
notes nullable
approval_status required
reviewed_at required date
```

Placeholder:

```text
user_id: Pilih karyawan
competency_id: Pilih kompetensi
reviewer_id: Pilih reviewer
rating: Contoh: 4
actual_level: Pilih level aktual dari review
notes: Tulis catatan observasi supervisor
approval_status: Pilih status approval
reviewed_at: Pilih tanggal review
```

---

# 38. Form Course

Fields:

```text
title required
slug required
category_id nullable
instructor_id nullable
description nullable
thumbnail nullable image
price required rupiah
level nullable
duration_minutes nullable
pre_test_required boolean
post_test_required boolean
passing_score required
max_attempts required
is_published boolean
```

Placeholder:

```text
title: Contoh: Belajar Digital Marketing Dasar
slug: belajar-digital-marketing-dasar
category_id: Pilih kategori course
instructor_id: Pilih instruktur
description: Jelaskan tujuan, materi, dan hasil pembelajaran course
price: Contoh: Rp 250.000
level: Contoh: Beginner
duration_minutes: Contoh: 120
passing_score: Contoh: 70
max_attempts: Contoh: 3
```

Harga wajib pakai `RupiahInput`.

---

# 39. Form Lesson

Fields:

```text
course_id required
course_section_id required
title required
type required
description nullable
content nullable
video_path nullable
embed_url nullable
youtube_url nullable
youtube_video_id nullable
scorm_package_id nullable
duration_minutes nullable
sort_order required
is_preview boolean
is_required boolean
```

Placeholder:

```text
title: Contoh: Pengenalan Analisa Kredit
type: Pilih tipe materi
description: Jelaskan ringkasan materi
content: Tulis isi materi jika tipe text
embed_url: Contoh: https://example.com/materi
youtube_url: Contoh: https://www.youtube.com/watch?v=xxxx
duration_minutes: Contoh: 30
sort_order: Contoh: 1
```

Rule field dinamis:

```text
Jika type = video:
  tampilkan upload video

Jika type = embed_link:
  tampilkan embed_url

Jika type = youtube:
  tampilkan youtube_url

Jika type = scorm:
  tampilkan scorm_package_id

Jika type = text:
  tampilkan content
```

---

# 40. Admin Sidebar Menu

```text
Dashboard

LMS
- Course
- Category
- Enrollment
- Assessment
- Certificate
- SCORM Package

Skill Matrix
- Dashboard Skill Matrix
- Master Jabatan
- Master Kompetensi
- Target Kompetensi Jabatan
- Mapping Course Kompetensi
- OJT Assessment
- Supervisor Review
- Skill Gap
- Rekomendasi Training

Reports
- Course Progress Report
- Assessment Report
- Certificate Report
- Skill Gap Report
```

---

# 41. Student Sidebar Menu

```text
Dashboard
Kelas Saya
Sertifikat Saya
Skill Matrix Saya
Rekomendasi Training
Profil
```

---

# 42. Supervisor Sidebar Menu

```text
Dashboard
Team Skill Matrix
OJT Assessment
Supervisor Review
Approval
```

---

# 43. Controller Pattern

## 43.1 Index

```php
public function index(Request $request): Response
{
    $items = Model::query()
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        })
        ->latest()
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('admin/model/index', [
        'items' => $items,
        'filters' => $request->only('search'),
    ]);
}
```

## 43.2 Create

```php
public function create(): Response
{
    return Inertia::render('admin/model/create');
}
```

## 43.3 Store

```php
public function store(StoreModelRequest $request): RedirectResponse
{
    Model::create($request->validated());

    return redirect()
        ->route('admin.model.index')
        ->with('success', 'Data berhasil ditambahkan.');
}
```

## 43.4 Update

```php
public function update(UpdateModelRequest $request, Model $model): RedirectResponse
{
    $model->update($request->validated());

    return redirect()
        ->route('admin.model.index')
        ->with('success', 'Data berhasil diperbarui.');
}
```

## 43.5 Delete

```php
public function destroy(Model $model): RedirectResponse
{
    $model->delete();

    return back()->with('success', 'Data berhasil dihapus.');
}
```

---

# 44. Inertia Form Submit Pattern

```tsx
const form = useForm({
  name: '',
  category: '',
  description: '',
  is_active: true,
});

function submit(event: React.FormEvent) {
  event.preventDefault();

  form.post(route('admin.competencies.store'), {
    preserveScroll: true,
  });
}
```

Button:

```tsx
<Button type="submit" disabled={form.processing}>
  {form.processing ? 'Menyimpan...' : 'Simpan'}
</Button>
```

---

# 45. Delete Confirmation Pattern

Gunakan Dialog shadcn/ui.

```text
Judul dialog:
Hapus data?

Deskripsi:
Data yang sudah dihapus tidak dapat dikembalikan.

Button:
Batal
Hapus
```

Submit delete:

```tsx
router.delete(route('admin.competencies.destroy', competency.id), {
  preserveScroll: true,
});
```

---

# 46. Empty State Pattern

Jika table kosong:

```text
Belum ada data
Data akan muncul setelah Anda menambahkan data baru.
```

Dengan button:

```text
Tambah Data
```

---

# 47. Loading State Pattern

Gunakan Skeleton untuk:

```text
Dashboard card
DataTable rows
Course card
Skill matrix table
```

---

# 48. Dashboard Card Standard

Gunakan Card shadcn/ui.

Contoh cards:

```text
Total Course
Total Peserta
Course Selesai
Certificate Terbit
Total Kompetensi
Total Skill Gap
Gap Tinggi
OJT Menunggu Review
```

Layout:

```tsx
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
```

---

# 49. Skill Matrix Dashboard

Cards:

```text
Total Karyawan
Total Kompetensi
Karyawan Sesuai Target
Total Skill Gap
Gap Tinggi
OJT Pending
Review Pending
Training Recommended
```

Tables:

```text
Top Skill Gap
Karyawan Dengan Gap Tertinggi
Kompetensi Paling Banyak Gap
Training Recommendation
```

---

# 50. MVP Development Order

Claude Code harus mengerjakan berurutan:

```text
Phase 1 — Foundation
1. Migrations MySQL
2. Model relationship
3. Seeder role, category, sample data
4. shadcn/ui install
5. Reusable form components
6. Reusable DataTable components
7. RupiahInput
8. DatePickerField

Phase 2 — LMS Core
1. Course CRUD
2. Section CRUD
3. Lesson CRUD
4. Course Builder
5. Enrollment
6. My Courses
7. Course Player
8. Lesson Progress

Phase 3 — Assessment
1. Pre Test
2. Post Test
3. Questions
4. Options
5. Attempt
6. Auto grading
7. Indonesian validation

Phase 4 — Certificate
1. Certificate table
2. Generate certificate number
3. Certificate status
4. Verification code
5. Download placeholder

Phase 5 — Skill Matrix Master
1. Master Position
2. Master Competency
3. Position Competency Target
4. Course Competency Mapping

Phase 6 — Skill Matrix Derived
1. User Competency Profile
2. Skill Gap Calculation
3. Training Recommendation
4. Skill Matrix Dashboard

Phase 7 — OJT & Review
1. OJT Assessment
2. Supervisor Review
3. Approval flow
4. Sync actual level

Phase 8 — SCORM
1. Upload package
2. Extract package
3. Launch iframe
4. Runtime tracking endpoint
```

---

# 51. Hard Rules untuk Claude Code

Ikuti aturan ini tanpa pengecualian:

```text
1. Halaman utama tidak boleh pakai REST API.
2. Gunakan routes/web.php.
3. Gunakan Inertia::render().
4. Gunakan useForm/router dari @inertiajs/react.
5. Semua query relasi wajib eager loading.
6. List data wajib pakai reusable DataTable shadcn/ui.
7. Semua form wajib pakai placeholder.
8. Semua required field wajib ada tanda *.
9. Semua validasi wajib Bahasa Indonesia.
10. Semua date field wajib pakai DatePickerField.
11. Semua field rupiah wajib pakai RupiahInput.
12. Semua table harus responsive dengan overflow-x-auto.
13. Semua halaman harus clean, modern, responsive.
14. Jangan kirim is_correct ke frontend peserta.
15. Business logic wajib masuk Service class.
16. Validasi wajib pakai Form Request.
17. Store rupiah sebagai integer di MySQL.
18. Jangan menulis query database langsung di React.
19. Jangan melakukan fetch/axios untuk CRUD utama.
20. Gunakan Badge untuk status.
```

---

# 52. Target Output Akhir

Sistem selesai jika sudah memiliki:

```text
Admin/HR:
- CRUD course
- CRUD lesson
- CRUD assessment
- CRUD position
- CRUD competency
- Mapping target competency per position
- Mapping course ke competency
- Skill matrix dashboard
- Skill gap table
- OJT assessment
- Supervisor review

Peserta:
- Enroll course
- Pre test
- Belajar materi
- Post test
- Certificate
- Melihat skill matrix pribadi
- Melihat rekomendasi training

Supervisor:
- Melihat team skill matrix
- Memberi OJT score
- Memberi supervisor review
- Approval kompetensi
```

---

# 53. Ringkasan Arsitektur Final

```text
Laravel Controller
→ Eloquent eager loading
→ Inertia props
→ React TypeScript page
→ shadcn/ui component
→ useForm/router submit
→ Laravel Form Request validasi Bahasa Indonesia
→ Service class business logic
→ MySQL
```

Sistem ini adalah:

```text
LMS + Competency Management + Skill Matrix + Skill Gap Analysis
```

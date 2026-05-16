<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyCertificateController extends Controller
{
    public function index(Request $request): Response
    {
        $certificates = Certificate::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'course:id,title,slug,thumbnail',
                'learningPath:id,title,slug,thumbnail',
            ])
            ->latest('issued_at')
            ->paginate(12)
            ->withQueryString();

        $certificates->getCollection()->transform(function (Certificate $c) {
            return [
                'id' => $c->id,
                'subject_type' => $c->subject_type,
                'certificate_number' => $c->certificate_number,
                'verification_code' => $c->verification_code,
                'pdf_path' => $c->pdf_path,
                'issued_at' => $c->issued_at?->toIso8601String(),
                'expired_at' => $c->expired_at?->toIso8601String(),
                'status' => $c->status,
                'course' => $c->course ? [
                    'id' => $c->course->id,
                    'title' => $c->course->title,
                    'slug' => $c->course->slug,
                    'thumbnail' => $c->course->thumbnail,
                ] : null,
                'learning_path' => $c->learningPath ? [
                    'id' => $c->learningPath->id,
                    'title' => $c->learningPath->title,
                    'slug' => $c->learningPath->slug,
                    'thumbnail' => $c->learningPath->thumbnail,
                ] : null,
            ];
        });

        return Inertia::render('student/my-certificates/index', [
            'certificates' => $certificates,
        ]);
    }

    public function verify(string $code): Response
    {
        $cert = Certificate::query()
            ->where('verification_code', $code)
            ->with([
                'user:id,name',
                'course:id,title,slug',
                'learningPath:id,title,slug',
            ])
            ->first();

        return Inertia::render('public/certificate-verify', [
            'certificate' => $cert ? [
                'id' => $cert->id,
                'subject_type' => $cert->subject_type,
                'certificate_number' => $cert->certificate_number,
                'verification_code' => $cert->verification_code,
                'issued_at' => $cert->issued_at?->toIso8601String(),
                'expired_at' => $cert->expired_at?->toIso8601String(),
                'status' => $cert->status,
                'user' => $cert->user ? ['id' => $cert->user->id, 'name' => $cert->user->name] : null,
                'course' => $cert->course ? ['id' => $cert->course->id, 'title' => $cert->course->title, 'slug' => $cert->course->slug] : null,
                'learning_path' => $cert->learningPath ? ['id' => $cert->learningPath->id, 'title' => $cert->learningPath->title, 'slug' => $cert->learningPath->slug] : null,
            ] : null,
            'verificationCode' => $code,
            'isValid' => $cert && $cert->status === 'issued',
        ]);
    }

    public function print(Request $request, string $code): View
    {
        $cert = Certificate::query()
            ->where('verification_code', $code)
            ->with([
                'user:id,name',
                'course:id,title,slug,instructor_id',
                'course.instructor:id,name',
                'learningPath:id,title,slug,position_id',
                'learningPath.position:id,name',
            ])
            ->firstOrFail();

        abort_unless(
            $cert->user_id === $request->user()->id,
            403,
            'Anda hanya bisa mencetak sertifikat milik sendiri.',
        );

        return view('certificates.print', [
            'certificate' => $cert,
            'verifyUrl' => url("/verify-certificate/{$cert->verification_code}"),
        ]);
    }
}

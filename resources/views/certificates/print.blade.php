<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Sertifikat — {{ $certificate->certificate_number }}</title>
    <style>
        @page { size: A4 landscape; margin: 0; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; }
        body { background: #f1f5f9; }

        .toolbar {
            position: sticky; top: 0; z-index: 10;
            display: flex; gap: 8px; align-items: center; justify-content: center;
            padding: 12px 16px; background: #0f172a; color: #fff;
            font-size: 13px;
        }
        .toolbar a, .toolbar button {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px; border-radius: 8px;
            font-size: 12.5px; font-weight: 600;
            text-decoration: none; cursor: pointer; border: 0;
        }
        .toolbar .btn-primary { background: #4338ca; color: #fff; }
        .toolbar .btn-secondary { background: #1e293b; color: #fff; border: 1px solid #334155; }
        .toolbar .btn-primary:hover { background: #3730a3; }
        .toolbar .btn-secondary:hover { background: #334155; }

        .page {
            width: 297mm; height: 210mm;
            margin: 24px auto; padding: 20mm;
            background: #ffffff;
            box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12);
            position: relative;
            display: flex; flex-direction: column;
            background-image:
                radial-gradient(circle at 0% 0%, rgba(67, 56, 202, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(124, 58, 237, 0.08) 0%, transparent 40%);
        }

        .frame {
            position: absolute; inset: 12mm;
            border: 2px solid #4338ca;
            border-radius: 8px;
            pointer-events: none;
        }
        .frame-inner {
            position: absolute; inset: 14mm;
            border: 1px solid #c7d2fe;
            border-radius: 6px;
            pointer-events: none;
        }

        .seal {
            position: absolute;
            top: 18mm; right: 18mm;
            width: 26mm; height: 26mm;
            border-radius: 50%;
            background: linear-gradient(135deg, #4338ca, #7c3aed);
            color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 9px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
            text-align: center; line-height: 1.2;
            box-shadow: 0 4px 14px rgba(67, 56, 202, 0.35);
        }

        .content { position: relative; z-index: 1; padding: 0 24mm; flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; }
        .eyebrow {
            font-size: 10.5px; font-weight: 800;
            letter-spacing: 0.28em; text-transform: uppercase;
            color: #4338ca;
        }
        h1 { margin: 6mm 0 0; font-size: 36px; font-weight: 800; letter-spacing: -0.01em; }
        .subline { margin-top: 3mm; font-size: 13px; color: #64748b; }
        .recipient {
            margin: 10mm 0 4mm;
            font-size: 38px; font-weight: 800;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4mm;
        }
        .for-completing { margin-top: 6mm; font-size: 13px; color: #475569; }
        .course-title { margin-top: 3mm; font-size: 20px; font-weight: 700; color: #4338ca; }

        .footer {
            position: relative; z-index: 1;
            display: flex; justify-content: space-between; align-items: flex-end;
            padding: 0 24mm; margin-top: 8mm;
            font-size: 11px; color: #475569;
        }
        .footer .col { min-width: 70mm; }
        .footer .label {
            display: block; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
            color: #94a3b8; margin-bottom: 2mm;
        }
        .footer .value { font-weight: 700; color: #0f172a; font-size: 12px; }
        .footer .value.mono { font-family: 'SF Mono', Consolas, monospace; }

        .signature-line {
            border-top: 1px solid #cbd5e1;
            padding-top: 2mm;
            min-width: 60mm;
            text-align: center;
        }

        @media print {
            body { background: #ffffff; }
            .toolbar { display: none; }
            .page { box-shadow: none; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <span>Tekan tombol Cetak lalu pilih “Save as PDF” untuk menyimpan.</span>
        <button class="btn-primary" onclick="window.print()">Cetak / Simpan PDF</button>
        <a class="btn-secondary" href="/my-certificates">Kembali</a>
    </div>

    <div class="page">
        <div class="frame"></div>
        <div class="frame-inner"></div>
        <div class="seal">Sertifikat<br>Resmi</div>

        @php
            $isPath = $certificate->isPathCertificate();
            $subjectTitle = $certificate->subjectTitle();
            $kindLabel = $isPath ? 'Learning Path' : 'Course';
            $completionLine = $isPath
                ? 'telah berhasil menuntaskan seluruh kurikulum dari'
                : 'telah berhasil menyelesaikan pelatihan';
        @endphp

        <div class="content">
            <div class="eyebrow">Sertifikat Penyelesaian {{ $kindLabel }}</div>
            <h1>{{ config('app.name', 'LearnPath') }}</h1>
            <p class="subline">Dengan bangga kami menyatakan bahwa</p>

            <div class="recipient">{{ $certificate->user?->name }}</div>

            <p class="for-completing">{{ $completionLine }}</p>
            <p class="course-title">{{ $subjectTitle }}</p>
            @if ($isPath && $certificate->learningPath?->position?->name)
                <p style="margin-top: 2mm; font-size: 12px; color: #64748b;">
                    Roadmap karir untuk jabatan
                    <strong>{{ $certificate->learningPath->position->name }}</strong>
                </p>
            @endif
        </div>

        <div class="footer">
            <div class="col">
                <span class="label">Diterbitkan</span>
                <span class="value">{{ $certificate->issued_at?->translatedFormat('d F Y') }}</span>
                <div style="margin-top: 5mm;">
                    <span class="label">No. Sertifikat</span>
                    <span class="value mono">{{ $certificate->certificate_number }}</span>
                </div>
            </div>

            <div class="col" style="text-align: center;">
                <div class="signature-line">
                    <div class="value" style="font-size: 13px;">
                        @if ($isPath)
                            {{ config('app.name', 'LearnPath') }} Academy
                        @else
                            {{ $certificate->course?->instructor?->name ?? 'Instruktur' }}
                        @endif
                    </div>
                    <div style="font-size: 10.5px; color: #64748b;">
                        {{ $isPath ? 'Penyelenggara' : 'Instruktur' }}
                    </div>
                </div>
            </div>

            <div class="col" style="text-align: right;">
                <span class="label">Kode Verifikasi</span>
                <span class="value mono">{{ $certificate->verification_code }}</span>
                <div style="margin-top: 4mm; font-size: 10px; color: #64748b; word-break: break-all;">
                    Verifikasi di:<br>{{ $verifyUrl }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>

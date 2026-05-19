<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Lightweight image compression using raw GD (no extra dependency).
 *
 * Pipeline:
 *  1. Read original (jpg/png/webp).
 *  2. Auto-rotate via EXIF if available (JPEG only).
 *  3. Resize so the longest side is at most $maxSide while keeping aspect ratio.
 *     Skips upscaling for already-small images.
 *  4. Re-encode as JPEG with the configured quality (smaller + universally supported).
 *  5. Store under {disk}/{folder}/<random>.jpg.
 *
 * Typical 4000×3000 JPEG (~3 MB) lands at <250 KB after compression.
 */
class ImageCompressor
{
    public function __construct(
        private int $maxSide = 1600,
        private int $quality = 75,
    ) {}

    /**
     * Compress and store an uploaded image. Returns the relative storage path.
     */
    public function compressAndStore(
        UploadedFile $file,
        string $folder,
        string $disk = 'public',
    ): string {
        $bytes = file_get_contents($file->getRealPath());
        if ($bytes === false) {
            throw new RuntimeException('Tidak dapat membaca file gambar.');
        }

        $source = @imagecreatefromstring($bytes);
        if ($source === false) {
            throw new RuntimeException('Format gambar tidak didukung atau file rusak.');
        }

        $source = $this->autoRotate($source, $file);

        $srcW = imagesx($source);
        $srcH = imagesy($source);
        $longest = max($srcW, $srcH);

        if ($longest > $this->maxSide) {
            $ratio = $this->maxSide / $longest;
            $dstW = (int) round($srcW * $ratio);
            $dstH = (int) round($srcH * $ratio);
            $resized = imagecreatetruecolor($dstW, $dstH);
            // Fill with white in case source has transparency (JPEG can't keep alpha).
            imagefilledrectangle($resized, 0, 0, $dstW, $dstH, imagecolorallocate($resized, 255, 255, 255));
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH);
            imagedestroy($source);
            $source = $resized;
        }

        ob_start();
        imagejpeg($source, null, $this->quality);
        $jpegBytes = ob_get_clean();
        imagedestroy($source);

        if ($jpegBytes === false || $jpegBytes === '') {
            throw new RuntimeException('Gagal mengompres gambar.');
        }

        $relativePath = trim($folder, '/').'/'.Str::random(28).'.jpg';
        Storage::disk($disk)->put($relativePath, $jpegBytes);

        return $relativePath;
    }

    /**
     * Best-effort EXIF rotation. Only meaningful for JPEGs that carry orientation.
     *
     * @param  \GdImage  $image
     * @return \GdImage
     */
    private function autoRotate($image, UploadedFile $file)
    {
        if (! function_exists('exif_read_data') || $file->getMimeType() !== 'image/jpeg') {
            return $image;
        }

        try {
            $exif = @exif_read_data($file->getRealPath());
        } catch (\Throwable) {
            return $image;
        }

        $orientation = (int) ($exif['Orientation'] ?? 0);
        $angle = match ($orientation) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = imagerotate($image, $angle, 0);
        if ($rotated !== false) {
            imagedestroy($image);

            return $rotated;
        }

        return $image;
    }
}

<?php

namespace App\Services\AI;

use RuntimeException;
use Smalot\PdfParser\Parser;
use Throwable;

/**
 * Extracts plain text from a PDF using smalot/pdfparser.
 *
 * Caveat: text extraction works on PDFs with a real text layer.
 * Scanned/image-only PDFs require OCR — we report them empty so the
 * caller can show a helpful error.
 */
class PdfTextExtractor
{
    /**
     * @throws RuntimeException when the PDF cannot be parsed.
     */
    public function extract(string $path): string
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException('File PDF tidak ditemukan atau tidak terbaca.');
        }

        try {
            $parser = new Parser;
            $document = $parser->parseFile($path);
            $text = (string) $document->getText();
        } catch (Throwable $e) {
            throw new RuntimeException(
                'Gagal mem-parse PDF: '.mb_substr($e->getMessage(), 0, 200),
            );
        }

        return $this->normalize($text);
    }

    private function normalize(string $text): string
    {
        $text = preg_replace('/\r\n?/', "\n", $text) ?? $text;
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $text) ?? $text;
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;

        return trim($text);
    }
}

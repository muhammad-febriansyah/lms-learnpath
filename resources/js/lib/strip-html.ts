/**
 * Strip HTML tags and decode common entities. Use when a rich-text field needs
 * to appear in plain-text contexts (card list previews, headers, meta tags).
 */
export function stripHtml(input: string | null | undefined, max?: number): string {
    if (!input) return '';
    const text = input
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<\/(p|div|h[1-6]|li|br)>/gi, ' ')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

    if (max && text.length > max) {
        return text.slice(0, max).trimEnd() + '…';
    }

    return text;
}

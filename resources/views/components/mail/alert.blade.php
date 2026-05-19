@props([
    'variant' => 'info',
    'icon' => null,
])

@php
    $palette = match ($variant) {
        'success' => ['bar' => '#10b981', 'text' => '#0a0a0a', 'icon' => $icon ?? '✓', 'iconColor' => '#10b981'],
        'warning' => ['bar' => '#d97706', 'text' => '#0a0a0a', 'icon' => $icon ?? '!', 'iconColor' => '#d97706'],
        'danger'  => ['bar' => '#dc2626', 'text' => '#0a0a0a', 'icon' => $icon ?? '×', 'iconColor' => '#dc2626'],
        default   => ['bar' => '#12237D', 'text' => '#0a0a0a', 'icon' => $icon ?? 'i', 'iconColor' => '#12237D'],
    };
@endphp

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background:#fafaf9;border:1px solid #e7e5e4;border-left:3px solid {{ $palette['bar'] }};border-radius:8px;">
    <tr>
        <td width="36" valign="top" style="padding:14px 0 14px 16px;">
            <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#ffffff;border:1px solid #e7e5e4;color:{{ $palette['iconColor'] }};border-radius:50%;font-size:12px;font-weight:700;font-family:Arial,sans-serif;">
                {{ $palette['icon'] }}
            </span>
        </td>
        <td style="padding:14px 18px 14px 8px;font-size:13.5px;line-height:1.65;color:{{ $palette['text'] }};">
            {{ $slot }}
        </td>
    </tr>
</table>

@props([
    'eyebrow' => null,
    'eyebrowColor' => '#12237D',
    'eyebrowBg' => '#f5f5f4',
    'eyebrowDot' => '#12237D',
])

@if ($eyebrow)
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
        <tr>
            <td style="display:inline-block;padding:5px 12px 5px 10px;background:{{ $eyebrowBg }};border:1px solid #e7e5e4;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:{{ $eyebrowColor }};">
                <span style="display:inline-block;width:6px;height:6px;background:{{ $eyebrowDot }};border-radius:50%;vertical-align:middle;margin-right:7px;"></span>{{ $eyebrow }}
            </td>
        </tr>
    </table>
@endif
<h1 class="h1" style="margin:0 0 14px;font-size:26px;line-height:1.25;font-weight:700;color:#0a0a0a;letter-spacing:-0.025em;">
    {{ $slot }}
</h1>

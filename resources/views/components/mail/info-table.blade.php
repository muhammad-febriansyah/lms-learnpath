@props(['rows' => []])

@if (! empty($rows))
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;overflow:hidden;">
        @foreach ($rows as $i => $row)
            <tr>
                <td style="padding:13px 18px;font-size:12px;color:#78716c;font-weight:500;letter-spacing:0.005em;{{ $i > 0 ? 'border-top:1px solid #e7e5e4;' : '' }}width:42%;background:#ffffff;">
                    {{ $row['label'] }}
                </td>
                <td style="padding:13px 18px;font-size:13.5px;color:#0a0a0a;text-align:right;font-weight:600;letter-spacing:-0.005em;{{ $i > 0 ? 'border-top:1px solid #e7e5e4;' : '' }}{{ ($row['mono'] ?? false) ? 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;' : '' }}">
                    {!! $row['value'] !!}
                </td>
            </tr>
        @endforeach
    </table>
@endif

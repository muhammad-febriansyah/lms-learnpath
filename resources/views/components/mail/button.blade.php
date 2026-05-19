@props([
    'url' => '#',
    'color' => '#12237D',
    'textColor' => '#ffffff',
    'align' => 'left',
    'variant' => 'primary',
])

@php
    if ($variant === 'secondary') {
        $bg = '#ffffff';
        $fg = '#0a0a0a';
        $border = '#d6d3d1';
    } else {
        $bg = $color;
        $fg = $textColor;
        $border = $color;
    }
@endphp

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 8px;">
    <tr>
        <td align="{{ $align }}">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $url }}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="20%" stroke="f" fillcolor="{{ $bg }}">
                <w:anchorlock/>
                <center style="color:{{ $fg }};font-family:Arial,sans-serif;font-size:14px;font-weight:600;">{{ $slot }}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="{{ $url }}" class="btn"
               style="display:inline-block;padding:13px 26px;background:{{ $bg }};color:{{ $fg }};font-weight:600;text-decoration:none;border-radius:8px;font-size:14px;letter-spacing:-0.005em;border:1px solid {{ $border }};">
                {{ $slot }} →
            </a>
            <!--<![endif]-->
        </td>
    </tr>
</table>

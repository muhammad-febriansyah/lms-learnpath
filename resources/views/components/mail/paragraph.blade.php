@props(['muted' => false])

<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:{{ $muted ? '#78716c' : '#292524' }};">
    {{ $slot }}
</p>

@php
    /**
     * @var array{
     *     name: string,
     *     tagline: string|null,
     *     logo_url: string|null,
     *     primary_color: string,
     *     secondary_color: string,
     *     email: string|null,
     *     phone: string|null,
     *     whatsapp: string|null,
     *     address: string|null,
     *     company_name: string|null,
     *     home_url: string,
     *     social: array<string, string|null>,
     * } $brand
     * @var string|null $preheader   Hidden preview text shown by Gmail/Outlook.
     */
    $brand = $brand ?? \App\Support\MailBrand::snapshot();
    $preheader = $preheader ?? null;
    $brandName = e($brand['name']);
    $year = now()->format('Y');
@endphp
<!doctype html>
<html lang="id" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $brandName }}</title>
    <!--[if mso]>
    <style>
        table, td, div, h1, p { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; }
            .px-40 { padding-left: 24px !important; padding-right: 24px !important; }
            .py-32 { padding-top: 24px !important; padding-bottom: 24px !important; }
            .stack-block { display: block !important; width: 100% !important; }
            .hide-mobile { display: none !important; }
            .h1 { font-size: 22px !important; line-height: 1.3 !important; }
            .btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0a0a0a;">

    @if ($preheader)
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;">
            {{ $preheader }}
        </div>
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;">
            &#847; &zwnj; &nbsp; &#8199; &shy;
        </div>
    @endif

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f5f4;">
        <tr>
            <td align="center" style="padding:40px 16px 32px;">
                <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">

                    {{-- ======== HEADER (clean white, subtle bottom divider) ======== --}}
                    <tr>
                        <td class="px-40" style="background:#ffffff;padding:28px 40px 22px;border-bottom:1px solid #f5f5f4;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align:middle;">
                                        <a href="{{ $brand['home_url'] }}" style="text-decoration:none;color:#0a0a0a;">
                                            @if ($brand['logo_url'])
                                                <img src="{{ $brand['logo_url'] }}" alt="{{ $brandName }}" height="32" style="display:inline-block;height:32px;width:auto;border:0;outline:none;vertical-align:middle;">
                                            @else
                                                <span style="display:inline-block;vertical-align:middle;font-size:18px;font-weight:700;color:#0a0a0a;letter-spacing:-0.02em;">
                                                    {{ $brandName }}
                                                </span>
                                            @endif
                                        </a>
                                    </td>
                                    <td align="right" class="hide-mobile" style="vertical-align:middle;">
                                        <span style="font-size:11px;color:#a8a29e;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;">
                                            {{ now()->translatedFormat('d M Y') }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- ======== BODY ======== --}}
                    <tr>
                        <td class="px-40 py-32" style="padding:36px 40px 32px;">
                            @yield('content')
                        </td>
                    </tr>

                    {{-- ======== FOOTNOTE (optional, soft neutral) ======== --}}
                    @hasSection('footnote')
                        <tr>
                            <td class="px-40" style="padding:0 40px 32px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;">
                                    <tr>
                                        <td style="padding:16px 18px;font-size:12.5px;line-height:1.65;color:#57534e;">
                                            @yield('footnote')
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    @endif

                    {{-- ======== FOOTER (soft cream, no aggressive dark) ======== --}}
                    <tr>
                        <td class="px-40" style="background:#fafaf9;padding:28px 40px;border-top:1px solid #e7e5e4;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align:top;">
                                        <div style="font-size:13.5px;font-weight:700;color:#0a0a0a;margin-bottom:4px;letter-spacing:-0.01em;">
                                            {{ $brand['company_name'] ?? $brandName }}
                                        </div>
                                        @if ($brand['tagline'])
                                            <div style="font-size:12px;color:#78716c;line-height:1.55;margin-bottom:14px;">
                                                {{ $brand['tagline'] }}
                                            </div>
                                        @endif
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:12px;color:#57534e;line-height:1.8;">
                                            @if ($brand['address'])
                                                <tr><td style="padding-right:10px;color:#a8a29e;">Alamat</td><td style="color:#44403c;">{{ $brand['address'] }}</td></tr>
                                            @endif
                                            @if ($brand['email'])
                                                <tr><td style="padding-right:10px;color:#a8a29e;">Email</td><td><a href="mailto:{{ $brand['email'] }}" style="color:#44403c;text-decoration:none;">{{ $brand['email'] }}</a></td></tr>
                                            @endif
                                            @if ($brand['phone'])
                                                <tr><td style="padding-right:10px;color:#a8a29e;">Telepon</td><td style="color:#44403c;">{{ $brand['phone'] }}</td></tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            @php
                                $socials = array_filter($brand['social'] ?? []);
                            @endphp
                            @if (! empty($socials))
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                                    <tr>
                                        @foreach ($socials as $platform => $url)
                                            <td style="padding-right:6px;">
                                                <a href="{{ $url }}" style="display:inline-block;padding:6px 11px;background:#ffffff;border:1px solid #e7e5e4;border-radius:6px;font-size:11px;color:#44403c;text-decoration:none;font-weight:600;text-transform:capitalize;letter-spacing:0.01em;">
                                                    {{ $platform }}
                                                </a>
                                            </td>
                                        @endforeach
                                    </tr>
                                </table>
                            @endif

                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;border-top:1px solid #e7e5e4;padding-top:16px;">
                                <tr>
                                    <td align="left" style="font-size:11px;color:#a8a29e;">
                                        © {{ $year }} {{ $brand['company_name'] ?? $brandName }}. Hak cipta dilindungi.
                                    </td>
                                    <td align="right" class="hide-mobile" style="font-size:11px;color:#a8a29e;">
                                        <a href="{{ $brand['home_url'] }}" style="color:#a8a29e;text-decoration:none;">{{ parse_url($brand['home_url'], PHP_URL_HOST) ?: $brandName }}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;margin-top:16px;">
                    <tr>
                        <td align="center" style="font-size:11px;color:#a8a29e;line-height:1.6;padding:0 16px;">
                            Email otomatis — mohon tidak membalas pesan ini.
                            Butuh bantuan?
                            @if ($brand['email'])
                                Hubungi <a href="mailto:{{ $brand['email'] }}" style="color:#78716c;text-decoration:underline;">{{ $brand['email'] }}</a>.
                            @else
                                Hubungi tim support kami.
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

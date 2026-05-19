<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @php
            $siteName = \App\Support\Setting::get('site_name') ?: config('app.name', 'LearnPath');
            $seoTitle = \App\Support\Setting::get('seo_meta_title') ?: $siteName;
            $siteDescription = \App\Support\Setting::get('seo_meta_description')
                ?: \App\Support\Setting::get('site_description')
                ?: 'Platform LMS, kursus online, sertifikasi, dan corporate training untuk pengembangan kompetensi profesional.';
            $siteKeywords = \App\Support\Setting::get('seo_meta_keywords')
                ?: 'lms indonesia, kursus online, pelatihan karyawan, sertifikasi online, corporate training, learning management system';
            $faviconUrl = \App\Support\Setting::imageUrl('site_favicon') ?: '/favicon.ico';
            $appleTouchIconUrl = \App\Support\Setting::imageUrl('site_logo') ?: '/apple-touch-icon.png';
            $ogImageUrl = \App\Support\Setting::imageUrl('seo_og_image')
                ?: \App\Support\Setting::imageUrl('site_logo')
                ?: $faviconUrl;
            $themeColor = \App\Support\Setting::get('brand_primary_color', '#12237d');
            $canonicalUrl = request()->fullUrl();
        @endphp
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="application-name" content="{{ $siteName }}">
        <meta name="description" content="{{ $siteDescription }}">
        <meta name="keywords" content="{{ $siteKeywords }}">
        <meta name="robots" content="index,follow,max-image-preview:large">
        <meta name="theme-color" content="{{ $themeColor }}">

        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $siteDescription }}">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta property="og:image" content="{{ $ogImageUrl }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $siteDescription }}">
        <meta name="twitter:image" content="{{ $ogImageUrl }}">

        <link rel="canonical" href="{{ $canonicalUrl }}">

        <style>
            html { background-color: #F7F8FD; }
        </style>

        <link rel="icon" href="{{ $faviconUrl }}" sizes="any">
        <link rel="shortcut icon" href="{{ $faviconUrl }}">
        <link rel="apple-touch-icon" href="{{ $appleTouchIconUrl }}">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>

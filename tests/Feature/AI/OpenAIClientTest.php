<?php

use App\Services\AI\OpenAIClient;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config()->set('services.openai.api_key', 'test-key');
    config()->set('services.openai.model', 'gpt-5');
});

it('sends a chat completion request and parses the response', function () {
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [[
                'message' => ['role' => 'assistant', 'content' => 'Halo! Saya AI Tutor.'],
            ]],
            'usage' => [
                'prompt_tokens' => 12,
                'completion_tokens' => 8,
                'total_tokens' => 20,
            ],
        ], 200),
    ]);

    $client = app(OpenAIClient::class);
    $result = $client->chat([
        ['role' => 'system', 'content' => 'You are a tutor.'],
        ['role' => 'user', 'content' => 'Halo'],
    ]);

    expect($result['content'])->toBe('Halo! Saya AI Tutor.');
    expect($result['total_tokens'])->toBe(20);
    expect($result['model'])->toBe('gpt-5');

    Http::assertSent(function ($request) {
        $body = $request->data();
        return $request->method() === 'POST'
            && str_contains($request->url(), 'api.openai.com/v1/chat/completions')
            && $request->hasHeader('Authorization', 'Bearer test-key')
            && $body['model'] === 'gpt-5'
            && count($body['messages']) === 2;
    });
});

it('throws when API returns an error', function () {
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response(['error' => 'rate limited'], 429),
    ]);

    expect(fn () => app(OpenAIClient::class)->chat([
        ['role' => 'user', 'content' => 'hi'],
    ]))->toThrow(RuntimeException::class, 'OpenAI API error');
});

it('throws when the API key is missing', function () {
    config()->set('services.openai.api_key', '');

    expect(fn () => app(OpenAIClient::class)->chat([
        ['role' => 'user', 'content' => 'hi'],
    ]))->toThrow(RuntimeException::class, 'OPENAI_API_KEY');
});

it('throws when response has empty content', function () {
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => '']]],
        ], 200),
    ]);

    expect(fn () => app(OpenAIClient::class)->chat([
        ['role' => 'user', 'content' => 'hi'],
    ]))->toThrow(RuntimeException::class, 'empty content');
});

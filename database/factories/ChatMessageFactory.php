<?php

namespace Database\Factories;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'chat_thread_id' => ChatThread::factory(),
            'role' => 'user',
            'content' => fake()->sentence(),
            'tokens' => null,
            'model' => null,
        ];
    }
}

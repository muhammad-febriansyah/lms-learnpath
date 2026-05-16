<?php

namespace Database\Factories;

use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatThread>
 */
class ChatThreadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => null,
            'lesson_id' => null,
            'title' => null,
            'last_message_at' => null,
        ];
    }
}

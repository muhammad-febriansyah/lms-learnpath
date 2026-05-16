<?php

namespace App\Services\AI;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Enforces per-user daily quota for AI Tutor usage:
 *   - max messages sent per day
 *   - max tokens consumed per day
 *
 * Usage is aggregated on-the-fly from chat_messages, so no extra
 * tracking table is needed.
 */
final class AiQuotaService
{
    /**
     * @return array{messages: int, tokens: int}
     */
    public function usageToday(User $user, ?Carbon $now = null): array
    {
        $start = ($now ?? Carbon::now())->copy()->startOfDay();
        $end = $start->copy()->endOfDay();

        $base = ChatMessage::query()
            ->whereHas('thread', fn ($q) => $q->where('user_id', $user->id))
            ->whereBetween('created_at', [$start, $end]);

        $messages = (clone $base)->where('role', ChatMessage::ROLE_USER)->count();
        $tokens = (int) (clone $base)
            ->where('role', ChatMessage::ROLE_ASSISTANT)
            ->sum('tokens');

        return ['messages' => $messages, 'tokens' => $tokens];
    }

    /**
     * @return array{daily_message_limit: int, daily_token_limit: int}
     */
    public function getLimits(): array
    {
        return [
            'daily_message_limit' => (int) config('services.openai.daily_message_limit', 50),
            'daily_token_limit' => (int) config('services.openai.daily_token_limit', 100000),
        ];
    }

    /**
     * @return array{ok: bool, reason: ?string, usage: array{messages: int, tokens: int}, limits: array{daily_message_limit: int, daily_token_limit: int}}
     */
    public function withinQuota(User $user): array
    {
        $usage = $this->usageToday($user);
        $limits = $this->getLimits();

        $reason = null;
        if ($limits['daily_message_limit'] > 0 && $usage['messages'] >= $limits['daily_message_limit']) {
            $reason = "Batas pesan harian tercapai ({$limits['daily_message_limit']} pesan).";
        } elseif ($limits['daily_token_limit'] > 0 && $usage['tokens'] >= $limits['daily_token_limit']) {
            $tokenK = number_format($limits['daily_token_limit'], 0, ',', '.');
            $reason = "Batas token harian tercapai ({$tokenK} token).";
        }

        return [
            'ok' => $reason === null,
            'reason' => $reason,
            'usage' => $usage,
            'limits' => $limits,
        ];
    }
}

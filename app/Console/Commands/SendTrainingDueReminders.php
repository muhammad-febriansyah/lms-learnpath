<?php

namespace App\Console\Commands;

use App\Services\Business\TrainingReminderService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('training:send-due-reminders')]
#[Description('Dispatch H-7/H-3/H-0 reminder notifications to learners with a due_at training.')]
class SendTrainingDueReminders extends Command
{
    public function handle(TrainingReminderService $service): int
    {
        $result = $service->dispatch();

        $this->info("Reminder cron selesai. Processed: {$result['processed']}, Sent: {$result['sent']}.");
        foreach ($result['by_milestone'] as $days => $count) {
            $label = $days === 0 ? 'Hari ini' : "H-{$days}";
            $this->line("  {$label}: {$count} dikirim");
        }

        return self::SUCCESS;
    }
}

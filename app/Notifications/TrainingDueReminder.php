<?php

namespace App\Notifications;

use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TrainingDueReminder extends Notification
{
    use Queueable;

    public function __construct(
        public int $courseId,
        public string $courseTitle,
        public string $courseSlug,
        public CarbonInterface $dueAt,
        public int $daysUntilDue,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        $title = match (true) {
            $this->daysUntilDue <= 0 => "Jatuh tempo hari ini: {$this->courseTitle}",
            $this->daysUntilDue === 3 => "3 hari lagi: {$this->courseTitle}",
            default => "{$this->daysUntilDue} hari lagi: {$this->courseTitle}",
        };

        $description = $this->daysUntilDue <= 0
            ? 'Deadline training ini hari ini. Selesaikan sekarang agar tidak terlewat.'
            : "Deadline {$this->dueAt->isoFormat('D MMM YYYY')}. Yuk lanjut belajar!";

        return [
            'type' => 'training_due_reminder',
            'title' => $title,
            'description' => $description,
            'href' => '/learn/'.$this->courseSlug,
            'course_id' => $this->courseId,
            'due_at' => $this->dueAt->toIso8601String(),
            'days_until_due' => $this->daysUntilDue,
        ];
    }
}

<?php

namespace App\Notifications;

use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TrainingAssigned extends Notification
{
    use Queueable;

    public function __construct(
        public int $courseId,
        public string $courseTitle,
        public string $courseSlug,
        public ?CarbonInterface $dueAt = null,
        public ?string $assignedByName = null,
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
        $description = $this->assignedByName
            ? "Anda ditugaskan oleh {$this->assignedByName}"
            : 'Anda mendapat penugasan training baru';

        if ($this->dueAt) {
            $description .= '. Deadline '.$this->dueAt->isoFormat('D MMM YYYY');
        }

        return [
            'type' => 'training_assigned',
            'title' => "Training baru: {$this->courseTitle}",
            'description' => $description,
            'href' => '/learn/'.$this->courseSlug,
            'course_id' => $this->courseId,
            'due_at' => $this->dueAt?->toIso8601String(),
        ];
    }
}

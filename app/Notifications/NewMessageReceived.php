<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageReceived extends Notification
{
    use Queueable;

    public function __construct(public Message $message) {}

    /**
     * @return array<string>
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
        return [
            'type' => 'message',
            'title' => 'Pesan baru dari '.($this->message->sender?->name ?? 'pengguna'),
            'description' => str($this->message->subject)->limit(80)->toString(),
            'href' => '/messages/'.$this->message->id,
            'message_id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender?->name,
        ];
    }
}

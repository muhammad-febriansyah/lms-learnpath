<?php

namespace App\Mail;

use App\Models\SubscriptionLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewSubscriptionLeadMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SubscriptionLead $lead) {}

    public function envelope(): Envelope
    {
        $company = $this->lead->company_name;
        $plan = $this->lead->plan?->name ?? 'tidak spesifik';

        return new Envelope(
            subject: "[Lead Baru] {$company} — paket {$plan}",
            replyTo: [
                new Address(
                    $this->lead->email,
                    $this->lead->contact_name,
                ),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.subscription-lead',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

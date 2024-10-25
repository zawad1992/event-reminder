<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExternalEventReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $event;
    public $recipientName;

    public function __construct($event, $recipientName)
    {
        $this->event = $event;
        $this->recipientName = $recipientName;
    }

    public function build()
    {
        return $this->markdown('emails.external-event-reminder')
                    ->subject('Event Invitation: ' . $this->event->title);
    }
}
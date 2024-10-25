<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class EventReminder extends Notification
{
    use Queueable;

    protected $event;
    
    public function __construct($event)
    {
        $this->event = $event;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $startDate = \Carbon\Carbon::parse($this->event->start_date)->format('M d, Y');
        $startTime = $this->event->is_all_day ? 'All Day' : 
            \Carbon\Carbon::parse($this->event->start_time)->format('g:i A');

        return (new MailMessage)
            ->subject('Event Reminder: ' . $this->event->title)
            ->line('This is a reminder for your upcoming event:')
            ->line('Title: ' . $this->event->title)
            ->line('Date: ' . $startDate)
            ->line('Time: ' . $startTime)
            ->line('Description: ' . $this->event->description)
            ->action('View Event', url('/events/' . $this->event->id));
    }
}
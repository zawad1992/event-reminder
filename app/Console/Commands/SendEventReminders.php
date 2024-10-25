<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use Carbon\Carbon;
use Mail;
use App\Mail\ExternalEventReminder;

class SendEventReminders extends Command
{
    protected $signature = 'events:send-reminders';
    protected $description = 'Send reminders for upcoming events';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Starting to send event reminders...');

        // Get events that are happening in the next 24 hours
        $upcomingEvents = Event::where('start_date', '>=', Carbon::now())
            ->where('start_date', '<=', Carbon::now()->addDay())
            ->where('is_reminder', true)
            ->where('is_completed', false)
            ->get();

        $this->info("Found {$upcomingEvents->count()} upcoming events");

        foreach ($upcomingEvents as $event) {
            // Send to event owner
            if ($event->user) {
                $this->info("Sending reminder to event owner: {$event->user->email}");
                $event->user->notify(new \App\Notifications\EventReminder($event));
            }

            // Send to external participants
            if ($event->external_participants) {
                // $participants = json_decode($event->external_participants, true);
                $participants = explode(',', $event->external_participants);
                foreach ($participants as $participant) {
                    $this->info("Sending reminder to external participant: {$participant['email']}");
                    Mail::to($participant['email'])
                        ->send(new ExternalEventReminder($event, $participant['name']));
                }
            }
        }

        $this->info('Event reminders sent successfully!');
    }
}
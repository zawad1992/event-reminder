<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

use App\Models\Event;
use Carbon\Carbon;
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

        $now = Carbon::now();
        $tomorrow = Carbon::now()->addDay();

        // Query builder for upcoming events
        $upcomingEvents = Event::where('is_reminder', true)
            ->where('is_completed', false)
            ->where(function ($query) use ($now, $tomorrow) {
                // Handle all-day events
                $query->where(function ($q) use ($now, $tomorrow) {
                    $q->where('is_all_day', true)
                        ->where('start_date', '>=', $now->format('Y-m-d'))
                        ->where('start_date', '<=', $tomorrow->format('Y-m-d'));
                })
                // Handle time-specific events
                ->orWhere(function ($q) use ($now, $tomorrow) {
                    $q->where('is_all_day', false)
                        ->where(function ($timeQuery) use ($now, $tomorrow) {
                            // Events currently in progress
                            $timeQuery->where(function ($inProgress) use ($now) {
                                $inProgress->where('start_date', '<=', $now->format('Y-m-d'))
                                        ->where('end_date', '>=', $now->format('Y-m-d'))
                                        ->where(function ($timeRange) use ($now) {
                                            $timeRange->where(function ($sameDay) use ($now) {
                                                $sameDay->where('start_date', '=', $now->format('Y-m-d'))
                                                        ->where('end_date', '=', $now->format('Y-m-d'))
                                                        ->where('start_time', '<=', $now->format('H:i:s'))
                                                        ->where('end_time', '>=', $now->format('H:i:s'));
                                            })
                                            ->orWhere(function ($multiDay) use ($now) {
                                                $multiDay->where('start_date', '<', $now->format('Y-m-d'))
                                                        ->where('end_date', '>', $now->format('Y-m-d'));
                                            })
                                            ->orWhere(function ($startDay) use ($now) {
                                                $startDay->where('start_date', '=', $now->format('Y-m-d'))
                                                        ->where('end_date', '>', $now->format('Y-m-d'))
                                                        ->where('start_time', '<=', $now->format('H:i:s'));
                                            })
                                            ->orWhere(function ($endDay) use ($now) {
                                                $endDay->where('start_date', '<', $now->format('Y-m-d'))
                                                    ->where('end_date', '=', $now->format('Y-m-d'))
                                                    ->where('end_time', '>=', $now->format('H:i:s'));
                                            });
                                        });
                            })
                            // Upcoming events starting within next 24 hours
                            ->orWhere(function ($upcoming) use ($now, $tomorrow) {
                                $upcoming->where(function ($todayStart) use ($now) {
                                    $todayStart->where('start_date', '=', $now->format('Y-m-d'))
                                            ->where('start_time', '>', $now->format('H:i:s'));
                                })
                                ->orWhere(function ($tomorrowStart) use ($now, $tomorrow) {
                                    $tomorrowStart->where('start_date', '=', $tomorrow->format('Y-m-d'))
                                                ->where('start_time', '<=', $now->format('H:i:s'));
                                });
                            });
                        });
                });
            })
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
                $participants = explode(',', $event->external_participants);
                foreach ($participants as $participant) {
                    $participant = trim($participant);
                    if (!filter_var($participant, FILTER_VALIDATE_EMAIL)) {
                        continue;
                    }

                    $this->info("Sending reminder to external participant: {$participant}");
                    Mail::to($participant)
                        ->send(new ExternalEventReminder($event, 'Concerns'));
                }
            }
        }

        $this->info('Event reminders sent successfully!');
    }
}
<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Env;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


// Every 30 minutes
Schedule::command('events:send-reminders')
    ->name('Send Event Reminders')
    ->description('Sends reminder emails for upcoming events')
    ->onFailure(function () {
        Log::error('Event reminder failed to send');
    })    
    ->everyThirtyMinutes()
    ->emailOutputOnFailure(Env::get('MAIL_FROM_ADDRESS'));

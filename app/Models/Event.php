<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;

    protected $table = 'events';
    protected $fillable = [
        'reminder_id',
        'user_id',
        'title',
        'description',
        'event_type_id',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'color',
        'is_all_day',
        'is_reminder',
        'is_recurring',
        'recurring_type',
        'recurring_count',
        'external_participants',
        'is_completed'
    ];

}

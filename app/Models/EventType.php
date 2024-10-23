<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventType extends Model
{
    protected $table = 'event_types';
    
    protected $fillable = [
        'title',
        'color',        
        'is_user_defined',
        'user_id',
    ];
}

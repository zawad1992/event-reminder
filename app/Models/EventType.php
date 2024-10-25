<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventType extends Model
{
    use SoftDeletes;
    protected $table = 'event_types';
    
    protected $fillable = [
        'title',
        'color',        
        'is_user_defined',
        'user_id',
    ];
}

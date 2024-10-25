<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReminderCounter extends Model
{
    protected $fillable = ['user_id', 'prefix', 'current_count'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

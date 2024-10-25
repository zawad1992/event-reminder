<?php
namespace App\Services;

use App\Models\User;
use App\Models\ReminderCounter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReminderIdGenerator
{
    private function generatePrefix(User $user): string
    {
        // Get first letters of each word in name
        $names = explode(' ', $user->name);
        $initials = array_map(function($name) {
            return Str::upper(Str::substr($name, 0, 1));
        }, $names);
        
        return implode('', $initials) . $user->id;
    }

    public function generateReminderId(User $user): string
    {
        $prefix = $this->generatePrefix($user);
        
        // Use database transaction to ensure atomicity
        return DB::transaction(function() use ($user, $prefix) {
            $counter = ReminderCounter::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'prefix' => $prefix,
                ],
                [
                    'current_count' => 0,
                ]
            );
            
            // Increment the counter atomically
            $counter->increment('current_count');
            
            // Format: PREFIX-XXXXX (5 digits with leading zeros)
            return sprintf(
                '%s-%05d',
                $prefix,
                $counter->current_count
            );
        });
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        DB::table('event_types')->insert([
            // System-defined events (Professional & Important)
            [
                'title' => 'Meeting',
                'is_user_defined' => false,
                'user_id' => null,
                'color' => '#3788d8', // Professional blue
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Birthday',
                'is_user_defined' => false,
                'user_id' => null,
                'color' => '#ff69b4', // Festive pink
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Anniversary',
                'is_user_defined' => false,
                'user_id' => null,
                'color' => '#9c27b0', // Celebratory purple
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Holiday',
                'is_user_defined' => false,
                'user_id' => null,
                'color' => '#e74c3c', // Festive red
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
        
        DB::table('event_types')->insert([
            // User-defined events
            [
                'title' => 'Vacation',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#2ecc71', // Relaxing green
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Doctor Appointment',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#e67e22', // Medical orange
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Party',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#8e44ad', // Fun violet
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Deadline',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#c0392b', // Urgent red
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Review',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#16a085', // Calm teal
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Bill Payment',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#f39c12', // Financial yellow
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Maintenance',
                'is_user_defined' => true,
                'user_id' => 1,
                'color' => '#7f8c8d', // Neutral gray
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

    }
}

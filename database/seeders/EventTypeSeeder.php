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
            [
                'title' => 'Meeting',
                'is_user_defined' => false,
                'user_id' => null, // System-defined event
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Birthday',
                'is_user_defined' => false,
                'user_id' => null, // System-defined event
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Anniversery',
                'is_user_defined' => false,
                'user_id' => null, // System-defined event
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Holiday',
                'is_user_defined' => false,
                'user_id' => null, // System-defined event
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
        DB::table('event_types')->insert([
            
            [
                'title' => 'Vacation',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Doctor Appointment',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Party',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Deadline',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Review',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Bill Payment',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Maintenance',
                'is_user_defined' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('offline_id')->nullable()->after('id');
            $table->enum('sync_status', ['synced', 'pending', 'failed'])
                  ->default('synced')
                  ->after('is_completed');
            $table->timestamp('last_synced_at')->nullable()->after('sync_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['offline_id', 'sync_status', 'last_synced_at']);
        });
    }
};

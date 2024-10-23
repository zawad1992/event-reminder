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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('reminder_id')->unique()->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('event_type_id')->nullable();
            $table->date('event_date')->nullable();
            $table->time('event_time')->nullable();
            $table->boolean('is_reminder')->default(true)->nullable()->comment('0=No, 1=Yes');
            $table->boolean('is_recurring')->default(false)->nullable()->comment('0=No, 1=Yes');
            $table->enum('recurring_type', [1, 2, 3, 4])->nullable()->comment('1=Daily, 2=Weekly, 3=Monthly, 4=Yearly');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('event_type_id')->references('id')->on('event_types')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

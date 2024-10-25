<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventsController;
use App\Http\Controllers\OfflineSyncController;
use App\Http\Controllers\PWAController;
use Illuminate\Support\Facades\Auth;


// Public routes (accessible to everyone)
Route::get('/', function () {

    if(Auth::check()){
        $title = 'Events';
        $title_for_layout = 'Events List';
        return view('events.index', compact('title', 'title_for_layout'));
    } else {
        return redirect('/login');
    }
});

// Authentication Routes
Auth::routes();

Route::get('/manifest.json', [PWAController::class, 'manifest'])->name('manifest');

// Protected routes (only for authenticated users)
Route::middleware(['auth'])->group(function () {
    // Calendar Routes
    Route::get('/events', [EventsController::class, 'calendar'])->name('events.calendar');
    Route::get('/get_events', [EventsController::class, 'get_events'])->name('events.get_events');

    // Event CRUD Routes
    Route::get('/events/list', [EventsController::class, 'index'])->name('events.index');
    Route::get('/event/add', [EventsController::class, 'event_add'])->name('events.add');
    Route::post('/event/add', [EventsController::class, 'event_submit'])->name('events.add');
    Route::put('/event/update/{id}', [EventsController::class, 'event_update'])->name('events.update');
    Route::put('/event/complete/{id}', [EventsController::class, 'event_complete'])->name('events.complete');
    Route::delete('/event/delete/{id}', [EventsController::class, 'event_delete'])->name('events.delete');

    // Event Upload Routes
    Route::post('/event/upload', [EventsController::class, 'event_upload'])->name('events.upload');
    Route::get('/event/sample-csv', [EventsController::class, 'downloadSampleCsv'])
        ->name('events.sample-csv');

    // Event Types Routes
    Route::get('/event_types', [EventsController::class, 'types'])->name('event_types.index');
    Route::post('/event_type/add', [EventsController::class, 'type_add'])->name('event_types.add');
    Route::put('/event_type/update/{id}', [EventsController::class, 'type_update'])->name('event_types.update');
    Route::delete('/event_type/delete/{id}', [EventsController::class, 'type_delete'])->name('event_types.delete');
});


// Add new route group for offline functionality
Route::middleware(['auth'])->prefix('offline')->group(function () {
    Route::get('/status', [OfflineSyncController::class, 'getStatus'])
         ->name('offline.status');
    Route::post('/sync', [OfflineSyncController::class, 'syncEvents'])
         ->name('offline.sync');
    Route::post('/validate', [OfflineSyncController::class, 'validateEvent'])
         ->name('offline.validate');
});
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventsController;

Route::get('/', function () {
    return view('welcome');
});


// Event Routes

Route::get('/', [EventsController::class, 'index'])->name('events.index');
Route::get('/events', [EventsController::class, 'index'])->name('events.index');
Route::get('/get-events', [EventsController::class, 'get_events'])->name('events.get_events');
Route::get('/event_types', [EventsController::class, 'types'])->name('event_types.index');
Route::post('/event_type/add', [EventsController::class, 'type_add'])->name('event_types.add');
Route::put('/event_type/update/{id}', [EventsController::class, 'type_update'])->name('event_types.update');
Route::delete('/event_type/delete/{id}', [EventsController::class, 'type_delete'])->name('event_types.delete');
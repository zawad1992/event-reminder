<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\Event;
use App\Models\EventType;
use App\Models\User;
use App\Services\ReminderIdGenerator;

use Carbon\Carbon;

class EventsController extends Controller
{
    private $reminderIdGenerator;
    
    public function __construct(ReminderIdGenerator $reminderIdGenerator)
    {
        $this->reminderIdGenerator = $reminderIdGenerator;
    }

    public function index()
    {
        $title = 'Events';
        $title_for_layout = 'Events List';
        return view('events.index', compact('title', 'title_for_layout'));
    }
    
    public function calendar()
    {
        $title = 'Calendar';
        $title_for_layout = 'Calendar';
        return view('events.calendar', compact('title', 'title_for_layout'));
    }

    public function get_events()
    {
        $user_id = 1; // Will change later
        if(Auth::check()){
            $user_id = Auth::user()->id;
        }
        $events['events'] = Event::where('user_id', $user_id)->get();
        return response()->json($events);
    }

    public function event_add()
    {
        $title = 'Add Event';
        $title_for_layout = 'Add Event';
        return view('events.add', compact('title', 'title_for_layout'));
    }

    public function event_submit(Request $request)
    {
        try {
            // Extract start_date and end_date from the request
            $start = $request->start_date;
            $end = $request->end_date;

            // Use Carbon to correctly extract date and time parts
            $startDateTime = Carbon::parse($start);
            $endDateTime = Carbon::parse($end);

            // Format the start and end date/time as required
            $start_date = $startDateTime->format('Y-m-d');
            $start_time = $startDateTime->format('H:i:0');
            $end_date = $endDateTime->format('Y-m-d');
            $end_time = $endDateTime->format('H:i:0');
            
            $user_id = 1; // Will change later
            if(Auth::check()){
                $user_id = Auth::user()->id;
            } else {
                // Force login user with ID 1
                Auth::loginUsingId(1);
            }               
    
            $reminderId = $this->reminderIdGenerator->generateReminderId(Auth::user());


            $event = new Event();
            $event->reminder_id = $reminderId;
            $event->title = $request->title;
            $event->description = $request->description;
            $event->event_type_id = $request->event_type_id;
            $event->start_date = $start_date;
            $event->end_date = $end_date;
            $event->start_time = $start_time;
            $event->end_time = $end_time;
            $event->color = $request->color;
            $event->is_all_day = $request->is_all_day;
            $event->is_reminder = $request->is_reminder;
            $event->is_recurring = $request->is_recurring;
            $event->recurring_type = $request->recurring_type;
            $event->recurring_count = $request->recurring_count;
            $event->user_id = $user_id;
            
            $event->save();
            
            // Hide the user_id field from the JSON response
            $event->makeHidden('user_id');

            $data['success'] = true;
            $data['event'] = $event;

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to insert event '.$e
            ], 500);
        }    
    }

    public function event_update(Request $request, $id)
    {
        try {
            // Extract start_date and end_date from the request
            $start = $request->start_date;
            $end = $request->end_date;

            // Use Carbon to correctly extract date and time parts
            $startDateTime = Carbon::parse($start);
            $endDateTime = Carbon::parse($end);

            // Format the start and end date/time as required
            $start_date = $startDateTime->format('Y-m-d');
            $start_time = $startDateTime->format('H:i:0');
            $end_date = $endDateTime->format('Y-m-d');
            $end_time = $endDateTime->format('H:i:0');

            $user_id = 1; // Will change later
            if(Auth::check()){
                $user_id = Auth::user()->id;
            }

            $event = Event::where('id', $id)->where('user_id', $user_id)->firstOrFail();
            $event->title = $request->title;
            $event->description = $request->description;
            $event->event_type_id = $request->event_type_id;
            $event->start_date = $start_date;
            $event->end_date = $end_date;
            $event->start_time = $start_time;
            $event->end_time = $end_time;
            $event->color = $request->color;
            $event->is_all_day = $request->is_all_day;
            $event->is_reminder = $request->is_reminder;
            $event->is_recurring = $request->is_recurring;
            $event->recurring_type = $request->recurring_type;
            $event->recurring_count = $request->recurring_count;
            $event->save();

            // Hide the user_id field from the JSON response
            $event->makeHidden('user_id');

            $data['success'] = true;
            $data['event'] = $event;
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event '.$e->getMessage()
            ], 500);
        }
    }

    public function event_complete($id)
    {
        try {
            $user_id = 1; // Will change later
            if(Auth::check()){
                $user_id = Auth::user()->id;
            }

            $event = Event::where('id', $id)->where('user_id', $user_id)->firstOrFail();
            $event->is_completed = 1;
            $event->save();

            // Hide the user_id field from the JSON response
            $event->makeHidden('user_id');

            $data['success'] = true;
            $data['event'] = $event;
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event '.$e->getMessage()
            ], 500);
        }
    }

    public function event_delete($id)
    {
        try {

            $user_id = 1; // Will change later
            if(Auth::check()){
                $user_id = Auth::user()->id;
            }

            $event = Event::where('id', $id)->where('user_id', $user_id)->firstOrFail();
            $event->delete();
            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event'
            ], 500);
        }
    }

    public function types()
    {
        $user_id = 1; // Will change later
        if(Auth::check()){
            $user_id = Auth::user()->id;
        }
    
        $events['event_types'] = EventType::select('id', 'title', 'color', 'is_user_defined')->where(function($query) use ($user_id){
            $query->where('is_user_defined', 0);
            if($user_id){
                $query->orWhere('user_id', $user_id);
            }
        })->get();

        return response()->json($events);
        
    }

    public function type_add(Request $request)
    {
        $title = $request->title;
        $color = $request->color;
        $is_user_defined = $request->is_user_defined;

        $user_id = 1; // Will change later
        if(Auth::check()){
            $user_id = Auth::user()->id;
        }
        if($title == null || $color == null){
            return response()->json(['error' => 'Title and Color are required.']);
        }

        $event_type = new EventType();
        $event_type->title = $title;
        $event_type->color = $color;
        $event_type->user_id = $user_id;
        $event_type->is_user_defined = $is_user_defined;
        $event_type->save();
        $event['event_type'] = $event_type;
        return response()->json($event);
    }

    public function type_update(Request $request, $id)
    {
        try {
            $eventType = EventType::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'color' => 'required|string'
            ]);

            $eventType->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event'
            ], 500);
        }
    }

    public function type_delete($id)
    {
        try {
            $eventType = EventType::findOrFail($id);
            $eventType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event'
            ], 500);
        }
    }
}

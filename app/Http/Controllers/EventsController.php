<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Event;
use App\Models\EventType;
use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;

class EventsController extends Controller
{

    public function index()
    {
        $title = 'Events';
        $title_for_layout = 'Events List';
        return view('events.index', compact('title', 'title_for_layout'));
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

    public function event_add(Request $request)
    {
        /* 
          "title" => "Deadline"
            "description" => "Test Bud"
            "start_date" => "2024-10-14"
            "end_date" => "2024-10-14"
            "is_all_day" => "true"
            "is_recurring" => "false"
            "recurring_type" => null
            "recurring_count" => null
            "event_type_id" => "8"
            ]
        
        */
        try {
            dd($request->all());
            // Extract start_date and end_date from the request
            $start = $request->start_date; // assuming 'start_date' contains both date and time like '2024-10-22T00:00'
            $end = $request->end_date; // assuming 'end_date' contains both date and time like '2024-10-23T00:00'

            // Use Carbon to correctly extract date and time parts
            $startDateTime = Carbon::parse($start);
            $endDateTime = Carbon::parse($end);

            // Format the start and end date/time as required
            $start_date = $startDateTime->format('Y-m-d');
            $start_time = $startDateTime->format('H:i:s');
            $end_date = $endDateTime->format('Y-m-d');
            $end_time = $endDateTime->format('H:i:s');

            $event = new Event();
            $event->title = $request->title;
            $event->description = $request->description;
            $event->start_date = $start_date;
            $event->end_date = $end_date;
            $event->start_time = $start_time;
            $event->end_time = $end_time;
            $event->is_all_day = $request->is_all_day;
            $event->is_recurring = $request->is_recurring;
            $event->recurring_type = $request->recurring_type;
            $event->recurring_count = $request->recurring_count;
            $event->event_type_id = $request->event_type_id;
            $event->is_reminder = $request->is_reminder;
            $event->user_id = 1; // Will change later
            if(Auth::check()){
                $event->user_id = Auth::user()->id;
            }
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
            $start = $request->start;
            $end = $request->end;
            $start_date = date('Y-m-d', strtotime($start));
            $end_date = date('Y-m-d', strtotime($end));
            $start_time = date('H:i:0', strtotime($start));
            $end_time = date('H:i:0', strtotime($end));

            $event = Event::findOrFail($id);
            $event->title = $request->title;
            $event->start_date = $start_date;
            $event->end_date = $end_date;
            $event->start_time = $start_time;
            $event->end_time = $end_time;
            $event->user_id = 1; // Will change later
            if(Auth::check()){
                $event->user_id = Auth::user()->id;
            }
            $event->save();

            // Hide the user_id field from the JSON response
            $event->makeHidden('user_id');

            $data['success'] = true;
            $data['event'] = $event;
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event'
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

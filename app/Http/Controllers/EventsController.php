<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Event;
use App\Models\EventType;
use Illuminate\Support\Facades\Auth;

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

    public function types()
    {
        $user_id = 1; // Will change later
        if(Auth::check()){
            $user_id = Auth::user()->id;
        }
    
        $events['event_types'] = EventType::select('id', 'title', 'color')->where(function($query) use ($user_id){
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

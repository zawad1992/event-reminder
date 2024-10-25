<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OfflineSyncController extends Controller
{
    public function getStatus()
    {
        $user_id = Auth::id();
        
        $pendingEvents = Event::where('user_id', $user_id)
            ->where('sync_status', 'pending')
            ->count();
            
        return response()->json([
            'status' => 'success',
            'pending_changes' => $pendingEvents,
            'last_sync' => session('last_sync_time', null),
            'is_online' => true
        ]);
    }

    public function syncEvents(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $changes = $request->input('changes', []);
            $responses = [];
            $user_id = Auth::id();
            
            foreach ($changes as $change) {
                $eventData = $change['data'];
                $offline_id = $change['offline_id'];
                
                switch ($change['type']) {
                    case 'create':
                        $event = new Event($eventData);
                        $event->user_id = $user_id;
                        $event->offline_id = $offline_id;
                        $event->sync_status = 'synced';
                        $event->last_synced_at = now();
                        $event->save();
                        
                        $responses[] = [
                            'offline_id' => $offline_id,
                            'server_id' => $event->id,
                            'status' => 'success',
                            'type' => 'create'
                        ];
                        break;

                    case 'update':
                        $event = Event::where('id', $eventData['id'])
                            ->where('user_id', $user_id)
                            ->first();
                            
                        if ($event) {
                            $event->update(array_merge($eventData, [
                                'sync_status' => 'synced',
                                'last_synced_at' => now()
                            ]));
                            
                            $responses[] = [
                                'offline_id' => $offline_id,
                                'server_id' => $event->id,
                                'status' => 'success',
                                'type' => 'update'
                            ];
                        }
                        break;

                    case 'delete':
                        Event::where('id', $eventData['id'])
                            ->where('user_id', $user_id)
                            ->delete();
                            
                        $responses[] = [
                            'offline_id' => $offline_id,
                            'server_id' => $eventData['id'],
                            'status' => 'success',
                            'type' => 'delete'
                        ];
                        break;
                }
            }
            
            DB::commit();
            
            session(['last_sync_time' => now()]);
            
            return response()->json([
                'status' => 'success',
                'responses' => $responses
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function validateEvent(Request $request)
    {
        $validator = validator($request->all(), [
            'title' => 'required|string|max:255',
            'event_type_id' => 'required|exists:event_types,id',
            'start_date' => 'required|date',
            'start_time' => 'required',
            'end_date' => 'required|date',
            'end_time' => 'required',
            'is_all_day' => 'boolean',
            'is_reminder' => 'boolean',
            'is_recurring' => 'boolean',
            'recurring_type' => 'nullable|in:1,2,3,4',
            'recurring_count' => 'nullable|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Validation passed'
        ]);
    }
}

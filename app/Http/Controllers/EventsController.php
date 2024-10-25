<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\EventUploadRequest;


use App\Models\Event;
use App\Models\EventType;
use App\Services\ReminderIdGenerator;

use Illuminate\Support\Facades\DB;
use League\Csv\Reader;
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

    public function event_upload(EventUploadRequest $request)
    {
        try {
            $user_id = 1; // Will change later
            if(Auth::check()){
                $user_id = Auth::user()->id;
            } else {
                // Force login user with ID 1
                Auth::loginUsingId(1);
            }  
            $eventTypes = EventType::select('id', 'color')->where(function($query) use ($user_id){
                $query->where('is_user_defined', 0);
                if($user_id){
                    $query->orWhere('user_id', $user_id);
                }
            })->pluck('color','id')->toArray();



            DB::beginTransaction();
            
            $file = $request->file('event_file');
            
            // Create CSV reader
            $csv = Reader::createFromPath($file->getPathname(), 'r');
            $csv->setHeaderOffset(0); // Set the CSV header offset
            
            $records = $csv->getRecords(); // Get all records except the header
            $imported = 0;
            $errors = [];           
            
            foreach ($records as $offset => $record) {
                try {
                    // Validate required fields
                    if (empty($record['title']) || empty($record['event_type_id']) || 
                        empty($record['start_date']) || empty($record['end_date'])) {
                        $errors[] = "Row " . ($offset + 2) . ": Missing required fields";
                        continue;
                    }

                    // Parse dates
                    try {
                        $startDateTime = Carbon::parse($record['start_date']);
                        $endDateTime = Carbon::parse($record['end_date']);
                    } catch (\Exception $e) {
                        $errors[] = "Row " . ($offset + 2) . ": Invalid date format";
                        continue;
                    }                     

                    $reminderId = app(ReminderIdGenerator::class)->generateReminderId(Auth::user());

                    // Create new event
                    $event = new Event();
                    $event->reminder_id = $reminderId;
                    $event->title = $record['title'];
                    $event->description = $record['description'] ?? null;
                    $event->event_type_id = $record['event_type_id'];
                    $event->start_date = $startDateTime->format('Y-m-d');
                    $event->start_time = $startDateTime->format('H:i:s');
                    $event->end_date = $endDateTime->format('Y-m-d');
                    $event->end_time = $endDateTime->format('H:i:s');
                    $event->color = $eventTypes[$record['event_type_id']] ?? '#007bff';
                    $event->is_all_day = $record['is_all_day'] ?? 0;
                    $event->is_reminder = $record['is_reminder'] ?? 0;
                    $event->is_recurring = $record['is_recurring'] ?? 0;
                    $event->recurring_type = $record['recurring_type'] ?? null;
                    $event->recurring_count = $record['recurring_count'] ?? null;
                    $event->user_id = $user_id;
                    
                    $event->save();
                    $imported++;

                } catch (\Exception $e) {
                    $errors[] = "Row " . ($offset + 2) . ": " . $e->getMessage();
                }
            }

            DB::commit();

            // Set flash messages for success and errors
            if ($imported > 0) {
                session()->flash('success', "{$imported} events were imported successfully.");
            }
            
            if (!empty($errors)) {
                session()->flash('warning', implode("\n", $errors));
            }

            return redirect()->back();

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to process CSV file: ' . $e->getMessage());
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

    public function downloadSampleCsv()
    {
        try {
            // Get all the event types
            $user_id = 1; // Will change later
            if(Auth::check()){
                $user_id = Auth::user()->id;
            }
        
            $eventTypes = EventType::select('id', 'title', 'color', 'is_user_defined')->where(function($query) use ($user_id){
                                        $query->where('is_user_defined', 0);
                                        if($user_id){
                                            $query->orWhere('user_id', $user_id);
                                        }
                                    })->get()->toArray();

            // Create the sample events content
            $sampleHeaders = [ 'title', 'description', 'event_type_id', 'start_date', 'end_date', 'is_all_day', 'is_reminder', 'is_recurring', 'recurring_type', 'recurring_count' ];

            $sampleData = [
                [ 'Daily Meeting', 'Daily standup meeting', 1, '2024-10-25 09:00:00', '2024-10-25 09:30:00', 0, 1, 1, '1', 5 ],
                [ 'Weekly Review', 'Team weekly status review', 2, '2024-10-28 14:00:00', '2024-10-28 15:00:00', 0, 1, 1, '2', 4 ],
                [ 'Monthly Report', 'Monthly progress report meeting', 3, '2024-11-01 10:00:00', '2024-11-01 11:00:00', 0, 1, 1, '3', 12 ]
            ];

            // Generate events CSV content
            $eventsContent = $this->generateCsvContent([$sampleHeaders, ...$sampleData]);

            // Generate guidelines content
            $guidelinesContent = $this->generateGuidelinesContent($eventTypes);

            // Check if ZipArchive is available and functioning
            if (class_exists('ZipArchive') && $this->isZipWorkable()) {
                return $this->generateZipDownload($eventsContent, $guidelinesContent);
            }

            // Fallback to single CSV
            return $this->generateSingleCsvDownload($eventsContent, $guidelinesContent);

        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error generating sample CSV: ' . $e->getMessage());
            
            // Return a simple error response
            return response()->json([
                'error' => 'Unable to generate sample file. Please contact support.'
            ], 500);
        }
    }

    /**
     * Check if ZIP functionality is working
     */
    private function isZipWorkable(): bool
    {
        try {
            $tempFile = tempnam(sys_get_temp_dir(), 'test_');
            if ($tempFile === false) {
                return false;
            }

            $zip = new \ZipArchive();
            if ($zip->open($tempFile, \ZipArchive::CREATE) !== true) {
                unlink($tempFile);
                return false;
            }

            $zip->addFromString('test.txt', 'test');
            $zip->close();
            unlink($tempFile);
            return true;

        } catch (\Exception $e) {
            if (isset($tempFile) && file_exists($tempFile)) {
                unlink($tempFile);
            }
            return false;
        }
    }

    /**
     * Generate CSV content from array
     */
    private function generateCsvContent(array $data): string
    {
        $output = fopen('php://temp', 'r+');
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);
        return $content;
    }

    /**
     * Generate guidelines content
     */
    private function generateGuidelinesContent(array $eventTypes): string
    {
        $guidelines = [];
        
        // Event Types Section
        $guidelines[] = ['Available Event Types'];
        $guidelines[] = ['ID', 'Title'];
        foreach ($eventTypes as $type) {
            $guidelines[] = [$type['id'], $type['title']];
        }
        
        // Separator
        $guidelines[] = [];
        
        // Recurring Types Section
        $guidelines[] = ['Recurring Types'];
        $guidelines[] = ['Value', 'Description'];
        $guidelines[] = ['1', 'Daily'];
        $guidelines[] = ['2', 'Weekly'];
        $guidelines[] = ['3', 'Monthly'];
        $guidelines[] = ['4', 'Yearly'];
        
        // Separator
        $guidelines[] = [];
        
        // Boolean Fields Section
        $guidelines[] = ['Boolean Fields'];
        $guidelines[] = ['Field', 'Values', 'Description'];
        $guidelines[] = ['is_all_day', '0 or 1', '1 = All day event, 0 = Specific time'];
        $guidelines[] = ['is_reminder', '0 or 1', '1 = Set reminder, 0 = No reminder'];
        $guidelines[] = ['is_recurring', '0 or 1', '1 = Recurring event, 0 = One-time event'];
        
        // Separator
        $guidelines[] = [];
        
        // Date Format Section
        $guidelines[] = ['Date Format'];
        $guidelines[] = ['Format', 'Example'];
        $guidelines[] = ['YYYY-MM-DD HH:mm:ss', '2024-10-25 09:00:00'];

        return $this->generateCsvContent($guidelines);
    }

    /**
     * Generate ZIP download
     */
    private function generateZipDownload(string $eventsContent, string $guidelinesContent)
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'events_');
        $zip = new \ZipArchive();
        
        if ($zip->open($tempFile, \ZipArchive::CREATE) !== true) {
            unlink($tempFile);
            throw new \Exception('Unable to create ZIP file');
        }

        $zip->addFromString('sample_events.csv', $eventsContent);
        $zip->addFromString('guidelines.csv', $guidelinesContent);
        $zip->close();

        return response()->download($tempFile, 'event_samples.zip', [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="event_samples.zip"',
            'Content-Transfer-Encoding' => 'binary',
            'Cache-Control' => 'must-revalidate',
            'Pragma' => 'public',
            'Expires' => '0'
        ])->deleteFileAfterSend(true);
    }

    /**
     * Generate single CSV download
     */
    private function generateSingleCsvDownload(string $eventsContent, string $guidelinesContent)
    {
        $combinedContent = $eventsContent . "\n\nGUIDELINES\n" . $guidelinesContent;

        return response($combinedContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sample_events.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ]);
    }
}

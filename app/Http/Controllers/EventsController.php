<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventRequest;
use App\Http\Requests\EventUploadRequest;
use App\Models\Event;
use App\Models\EventType;
use App\Services\ReminderIdGenerator;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;
use League\Csv\Reader;

class EventsController extends Controller
{
    private ReminderIdGenerator $reminderIdGenerator;
    
    public function __construct(ReminderIdGenerator $reminderIdGenerator)
    {
        $this->reminderIdGenerator = $reminderIdGenerator;
    }

    public function index(): View
    {
        return view('events.index', [
            'title' => 'Events',
            'title_for_layout' => 'Events List'
        ]);
    }
    
    public function calendar(): View
    {
        return view('events.calendar', [
            'title' => 'Calendar',
            'title_for_layout' => 'Calendar'
        ]);
    }

    public function getEvents(): JsonResponse
    {
        $userId = Auth::id();
        
        $events = Event::where('user_id', $userId)
            ->select([
                'id', 'offline_id', 'reminder_id', 'user_id', 'title', 
                'description', 'event_type_id',
                DB::raw("CASE 
                    WHEN is_all_day = 0 THEN CONCAT(start_date, ' ', start_time)
                    ELSE start_date
                END as start_date"),
                DB::raw("CASE 
                    WHEN is_all_day = 0 THEN CONCAT(end_date, ' ', end_time)
                    ELSE end_date
                END as end_date"),
                'color', 'is_all_day', 'is_reminder', 'is_recurring', 
                'recurring_type', 'recurring_count', 'external_participants',
                'is_completed', 'sync_status', 'last_synced_at', 
                'created_at', 'updated_at', 'deleted_at'
            ])
            ->get();

        return response()->json(['events' => $events]);
    }

    public function eventAdd(): View
    {
        return view('events.add', [
            'title' => 'Add Event',
            'title_for_layout' => 'Add Event'
        ]);
    }    

    public function eventSubmit(EventRequest $request): JsonResponse
    {
        try {
            $event = $this->createEventFromRequest($request);
            $event->makeHidden('user_id');

            return response()->json([
                'success' => true,
                'event' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to insert event: ' . $e->getMessage()
            ], 500);
        }    
    }

    public function eventUpload(EventUploadRequest $request)
    {
        try {
            $userId = Auth::id();
            $eventTypes = $this->getEventTypes($userId);

            DB::beginTransaction();
            
            $importResult = $this->processEventUpload($request->file('event_file'), $eventTypes);
            
            DB::commit();

            if ($importResult['imported'] > 0) {
                session()->flash('success', "{$importResult['imported']} events were imported successfully.");
            }
            
            if (!empty($importResult['errors'])) {
                session()->flash('warning', implode("\n", $importResult['errors']));
            }

            return redirect()->back();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CSV Upload Error: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to process CSV file: ' . $e->getMessage());
        }
    }

    public function eventUpdate(EventRequest $request, $id): JsonResponse
    {
        try {
            $event = $this->updateEventFromRequest($request, $id);
            $event->makeHidden('user_id');

            return response()->json([
                'success' => true,
                'event' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function eventComplete($id): JsonResponse
    {
        try {
            $event = Event::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();
                
            $event->is_completed = 1;
            $event->save();
            $event->makeHidden('user_id');

            return response()->json([
                'success' => true,
                'event' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function eventDelete($id): JsonResponse
    {
        try {
            Event::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail()
                ->delete();

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

    public function types(): JsonResponse
    {
        $userId = Auth::id();
    
        $eventTypes = EventType::select('id', 'title', 'color', 'is_user_defined')
            ->where(function($query) use ($userId) {
                $query->where('is_user_defined', 0);
                if ($userId) {
                    $query->orWhere('user_id', $userId);
                }
            })
            ->get();

        return response()->json(['event_types' => $eventTypes]);
    }

    public function typeAdd(Request $request): JsonResponse
    {
        if (!$request->title || !$request->color) {
            return response()->json(['error' => 'Title and Color are required.']);
        }

        $eventType = EventType::create([
            'title' => $request->title,
            'color' => $request->color,
            'user_id' => Auth::id(),
            'is_user_defined' => $request->is_user_defined
        ]);

        return response()->json(['event_type' => $eventType]);
    }

    public function typeUpdate(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'color' => 'required|string'
            ]);

            EventType::findOrFail($id)->update($validated);

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

    public function typeDelete($id): JsonResponse
    {
        try {
            EventType::findOrFail($id)->delete();

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
            $eventTypes = $this->getFullEventTypes(Auth::id());
            $eventsContent = $this->generateCsvContent($this->getSampleEventsData());
            $guidelinesContent = $this->generateGuidelinesContent($eventTypes);

            return class_exists('ZipArchive') && $this->isZipWorkable()
                ? $this->generateZipDownload($eventsContent, $guidelinesContent)
                : $this->generateSingleCsvDownload($eventsContent, $guidelinesContent);

        } catch (\Exception $e) {
            Log::error('Error generating sample CSV: ' . $e->getMessage());
            return response()->json([
                'error' => 'Unable to generate sample file. Please contact support.'
            ], 500);
        }
    }

    private function createEventFromRequest(EventRequest $request): Event
    {
        $dates = $this->parseDatesFromRequest($request);
        
        $event = new Event();
        $this->setEventAttributes($event, $request, $dates);
        $event->reminder_id = $this->reminderIdGenerator->generateReminderId(Auth::user());
        $event->user_id = Auth::id();
        $event->save();
        
        return $event;
    }

    private function updateEventFromRequest(EventRequest $request, $id): Event
    {
        $dates = $this->parseDatesFromRequest($request);
        
        $event = Event::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();
            
        $this->setEventAttributes($event, $request, $dates);
        $event->save();
        
        return $event;
    }

    private function setEventAttributes(Event $event, EventRequest $request, array $dates): void
    {
        $event->title = $request->title;
        $event->description = $request->description;
        $event->external_participants = $request->external_participants;
        $event->event_type_id = $request->event_type_id;
        $event->start_date = $dates['start_date'];
        $event->end_date = $dates['end_date'];
        $event->start_time = $dates['start_time'];
        $event->end_time = $dates['end_time'];
        $event->color = $request->color;
        $event->is_all_day = $request->is_all_day;
        $event->is_reminder = $request->is_reminder;
        $event->is_recurring = $request->is_recurring;
        $event->recurring_type = $request->recurring_type;
        $event->recurring_count = $request->recurring_count;
    }

    private function parseDatesFromRequest(EventRequest $request): array
    {
        $startDateTime = Carbon::parse($request->start_date);
        $endDateTime = Carbon::parse($request->end_date);

        return [
            'start_date' => $startDateTime->format('Y-m-d'),
            'start_time' => $startDateTime->format('H:i:0'),
            'end_date' => $endDateTime->format('Y-m-d'),
            'end_time' => $endDateTime->format('H:i:0')
        ];
    }

    private function getEventTypes($userId): array
    {
        return EventType::select('id', 'color')
            ->where(function($query) use ($userId) {
                $query->where('is_user_defined', 0);
                if ($userId) {
                    $query->orWhere('user_id', $userId);
                }
            })
            ->pluck('color', 'id')
            ->toArray();
    }

    private function getFullEventTypes($userId): array
    {
        return EventType::select('id', 'title', 'color', 'is_user_defined')
            ->where(function($query) use ($userId){
                $query->where('is_user_defined', 0);
                if($userId){
                    $query->orWhere('user_id', $userId);
                }
            })
            ->get()
            ->toArray();
    }

    private function processEventUpload($file, array $eventTypes): array
    {
        $csv = Reader::createFromPath($file->getPathname(), 'r');
        $csv->setHeaderOffset(0);
        
        $imported = 0;
        $errors = [];
        
        foreach ($csv->getRecords() as $offset => $record) {
            try {
                if ($this->validateAndProcessRecord($record, $offset, $eventTypes)) {
                    $imported++;
                } else {
                    $errors[] = "Row " . ($offset + 2) . ": Invalid record";
                }
            } catch (\Exception $e) {
                $errors[] = "Row " . ($offset + 2) . ": " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'errors' => $errors
        ];
    }

    private function validateAndProcessRecord(array $record, int $offset, array $eventTypes): bool
    {
        if (!$this->validateRequiredFields($record)) {
            throw new \Exception("Missing required fields");
        }

        $startDateTime = Carbon::parse($record['start_date']);
        $endDateTime = Carbon::parse($record['end_date']);
        
        $externalParticipants = $this->processExternalParticipants($record['external_participants'] ?? '', $offset);
        
        $event = new Event([
            'reminder_id' => $this->reminderIdGenerator->generateReminderId(Auth::user()),
            'title' => $record['title'],
            'description' => $record['description'] ?? null,
            'event_type_id' => $record['event_type_id'],
            'start_date' => $startDateTime->format('Y-m-d'),
            'start_time' => $startDateTime->format('H:i:s'),
            'end_date' => $endDateTime->format('Y-m-d'),
            'end_time' => $endDateTime->format('H:i:s'),
            'color' => $eventTypes[$record['event_type_id']] ?? '#007bff',
            'is_all_day' => $record['is_all_day'] ?? 0,
            'is_reminder' => $record['is_reminder'] ?? 0,
            'is_recurring' => $record['is_recurring'] ?? 0,
            'recurring_type' => $record['recurring_type'] ?? null,
            'recurring_count' => $record['recurring_count'] ?? null,
            'external_participants' => $externalParticipants,
            'user_id' => Auth::id()
        ]);

        return $event->save();
    }

    private function validateRequiredFields(array $record): bool
    {
        return !empty($record['title']) 
            && !empty($record['event_type_id'])
            && !empty($record['start_date'])
            && !empty($record['end_date']);
    }

    private function processExternalParticipants(?string $participants, int $offset): ?string
    {
        if (empty($participants)) {
            return null;
        }

        $emails = array_map('trim', explode(',', $participants));
        $validEmails = array_filter($emails, function($email) use ($offset) {
            if (empty($email)) {
                return false;
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new \Exception("Invalid email format: {$email}");
            }
            return true;
        });

        return !empty($validEmails) ? implode(', ', $validEmails) : null;
    }

    private function getSampleEventsData(): array
    {
        return [
                [ 'title', 'description', 'event_type_id', 'start_date', 'end_date', 'is_all_day', 'is_reminder', 'is_recurring', 'recurring_type', 'recurring_count', 'external_participants' ],
                [ 'Daily Meeting', 'Daily standup meeting', 1, '2024-10-25 09:00:00', '2024-10-25 09:30:00', 0, 1, 1, '1', 5, 'john@example.com, jane@example.com' ],
                [ 'Weekly Review', 'Team weekly status review', 2, '2024-10-28 14:00:00', '2024-10-28 15:00:00', 0, 1, 1, '2', 4, 'manager@example.com' ],
                [ 'Monthly Report', 'Monthly progress report meeting', 3, '2024-11-01 10:00:00', '2024-11-01 11:00:00', 0, 1, 1, '3', 12, '' ]
            ];
    }

    private function generateGuidelinesContent(array $eventTypes): string
    {
        $guidelines = $this->buildGuidelinesArray($eventTypes);
        return $this->generateCsvContent($guidelines);
    }

    private function buildGuidelinesArray(array $eventTypes): array
    {
        $guidelines = [];
        
        // Event Types Section
        $guidelines[] = ['Available Event Types'];
        $guidelines[] = ['ID', 'Title'];
        foreach ($eventTypes as $type) {
            $guidelines[] = [$type['id'], $type['title']];
        }
        $guidelines[] = [];
        
        // Recurring Types Section
        $guidelines[] = ['Recurring Types'];
        $guidelines[] = ['Value', 'Description'];
        $guidelines[] = ['1', 'Daily'];
        $guidelines[] = ['2', 'Weekly'];
        $guidelines[] = ['3', 'Monthly'];
        $guidelines[] = ['4', 'Yearly'];
        $guidelines[] = [];
        
        // Boolean Fields Section
        $guidelines[] = ['Boolean Fields'];
        $guidelines[] = ['Field', 'Values', 'Description'];
        $guidelines[] = ['is_all_day', '0 or 1', '1 = All day event, 0 = Specific time'];
        $guidelines[] = ['is_reminder', '0 or 1', '1 = Set reminder, 0 = No reminder'];
        $guidelines[] = ['is_recurring', '0 or 1', '1 = Recurring event, 0 = One-time event'];
        $guidelines[] = [];
        
        // Date Format Section
        $guidelines[] = ['Date Format'];
        $guidelines[] = ['Format', 'Example'];
        $guidelines[] = ['YYYY-MM-DD HH:mm:ss', '2024-10-25 09:00:00'];

        return $guidelines;
    }

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
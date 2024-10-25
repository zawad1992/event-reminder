@extends('layouts.admin')

@push('styles')
  <link rel="stylesheet" href="{{ asset('assets/plugins/ekko-lightbox/ekko-lightbox.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/plugins/overlayScrollbars/css/OverlayScrollbars.min.css') }}">

  <style type="text/css">
    .content-wrapper.kanban .card.card-row {
      width: 450px;
    }
    /* Media Query For mobile device */
    @media only screen and (max-width: 600px) {
      .content-wrapper.kanban .card.card-row {
        width: 100%;
      }
    }
  </style>
@endpush

@section('content')
<div class="content-wrapper kanban ml-0" style="background-color: #fff;">
  <section class="content pb-3">
    <div class="container-fluid h-100">
      <div class="card card-row card-info">
        <div class="card-header">
          <h3 class="card-title">Upload Event</h3>
        </div>
        <div class="card-body">
          <div class="card card-success card-outline">
            <div class="card-header">
              <h3 class="card-title"> Upload Event </h3>
            </div>
            <div class="card-body">
              @if(session('success')) <div class="alert alert-success"> {{ session('success') }} </div> @endif
              @if(session('warning')) <div class="alert alert-warning"> <strong>Warnings:</strong> <pre>{{ session('warning') }}</pre> </div> @endif
              @if(session('error')) <div class="alert alert-danger"> {{ session('error') }} </div> @endif
      
              @if($errors->any())
                  <div class="alert alert-danger">
                      <ul class="mb-0">
                          @foreach($errors->all() as $error)
                              <li>{{ $error }}</li>
                          @endforeach
                      </ul>
                  </div>
              @endif
              <form role="form" action="{{ route('events.upload') }}" method="POST" id="uploadEventForm" enctype="multipart/form-data">
                @csrf
                <div class="form-group">
                  <label for="exampleInputFile">File input</label>
                  <div class="input-group">
                    <div class="custom-file">
                      <input type="file" class="custom-file-input" id="exampleInputFile" name="event_file">
                      <label class="custom-file-label" for="exampleInputFile">Choose file</label>
                    </div>
                    <div class="input-group-append">
                      <button type="submit" class="input-group-text">Upload</button>
                    </div>
                  </div>
                  <div class="error"></div>
                </div>
              </form>

              <div class="mt-3">
                <p class="mb-2">CSV Format Requirements:</p>
                <ul class="text-muted">
                    <li>First row must contain these headers: title, description, event_type_id, start_date, end_date, is_all_day, is_reminder, is_recurring, recurring_type, recurring_count</li>
                    <li>Required fields:
                        <ul>
                            <li>title - Event name</li>
                            <li>event_type_id - Must be an existing event type ID
                                <ul class="event-type-list"></ul>
                            </li>
                            <li>start_date - Format: YYYY-MM-DD HH:mm:ss</li>
                            <li>end_date - Format: YYYY-MM-DD HH:mm:ss</li>
                        </ul>
                    </li>
                    <li>Optional fields:
                        <ul>
                            <li>description - Event details</li>
                            <li>is_all_day - Use 1 for yes, 0 for no</li>
                            <li>is_reminder - Use 1 for yes, 0 for no</li>
                            <li>is_recurring - Use 1 for yes, 0 for no</li>
                            <li>recurring_type - Use 1=Daily, 2=Weekly, 3=Monthly, 4=Yearly</li>
                            <li>recurring_count - Number of recurrences</li>
                        </ul>
                    </li>
                </ul>
                
                <div class="mt-3">
                    <a href="{{ route('events.sample-csv') }}" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-download mr-1"></i> Download Sample CSV
                    </a>
                </div>
              </div>
            </div>                
          </div>
        </div>
      </div>

      <div class="card card-row card-secondary">
        <div class="card-header">
          <h3 class="card-title">New Event</h3>
        </div>
        <div class="card-body">
          <div class="card card-info card-outline">
            <div class="card-header">
              <h5 class="card-title">Create Event</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-center align-items-center pred-events-loader" style="min-height: 200px;"> 
                <i class="fas fa-sync fa-spin fa-4x"></i> 
              </div>
              <div id="external-events">
                <form id="eventForm">
                  <!-- Form Content -->
                  <div class="form-group">
                    <label for="eventType">Event Type <span class="text-danger">*</span></label>
                    <select class="form-control form-control-sm" id="eventType"></select>
                  </div>
                  
                  <div class="form-group">
                    <label for="eventTitle">Event Title <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-sm" id="eventTitle">
                  </div>
                  
                  <div class="form-group">
                    <label for="eventDescription">Description</label>
                    <textarea class="form-control form-control-sm" id="eventDescription" rows="3"></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label for="eventStart">Start Time <span class="text-danger">*</span></label>
                    <div class="input-group input-group-sm date" id="startDatePicker" data-target-input="nearest">
                      <input type="text" class="form-control form-control-sm datetimepicker-input" id="eventStart" data-target="#startDatePicker"/>
                      <div class="input-group-append" data-target="#startDatePicker" data-toggle="datetimepicker">
                        <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="eventEnd">End Time <span class="text-danger">*</span></label>
                    <div class="input-group input-group-sm date" id="endDatePicker" data-target-input="nearest">
                      <input type="text" class="form-control form-control-sm datetimepicker-input" id="eventEnd" data-target="#endDatePicker"/>
                      <div class="input-group-append" data-target="#endDatePicker" data-toggle="datetimepicker">
                        <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="row mb-3">
                    <div class="col-6">
                      <div class="custom-control custom-checkbox">
                        <input class="custom-control-input custom-control-input-success" type="checkbox" id="eventAllDay">
                        <label for="eventAllDay" class="custom-control-label" style="cursor: pointer">Is All Day?</label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="custom-control custom-checkbox">
                        <input class="custom-control-input custom-control-input-danger" type="checkbox" id="eventReminder" checked>
                        <label for="eventReminder" class="custom-control-label" style="cursor: pointer">Reminder?</label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="custom-control custom-checkbox mb-3">
                    <input class="custom-control-input custom-control-input-info" type="checkbox" id="eventRecurring">
                    <label for="eventRecurring" class="custom-control-label" style="cursor: pointer">Recurring?</label>
                  </div>
                  
                  <div class="form-group" id="recurringPeriodDiv">
                    <div class="btn-group btn-group-sm btn-group-toggle" data-toggle="buttons">
                      <label class="btn btn-outline-info active">
                        <input type="radio" class="recurring-type" id="recurringType1" name="recurringType" value="1" checked> Daily
                      </label>
                      <label class="btn btn-outline-info">
                        <input type="radio" class="recurring-type" id="recurringType2" name="recurringType" value="2"> Weekly
                      </label>
                      <label class="btn btn-outline-info">
                        <input type="radio" class="recurring-type" id="recurringType3" name="recurringType" value="3"> Monthly
                      </label>
                      <label class="btn btn-outline-info">
                        <input type="radio" class="recurring-type" id="recurringType4" name="recurringType" value="4"> Yearly
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group" id="recurringCountDiv">
                    <label for="recurringCount" class="mb-2">Recurring Count</label>
                    <div class="input-group input-group-sm" style="width: 100px">
                      <div class="input-group-prepend">
                        <button type="button" class="btn btn-danger btn-sm btn-flat decrease" id="decreaseCount">
                          <i class="fas fa-minus fa-sm"></i>
                        </button>
                      </div>
                      <input type="text" class="form-control form-control-sm text-center" id="recurringCount" value="1" min="1" max="100" readonly>
                      <div class="input-group-append">
                        <button type="button" class="btn btn-success btn-sm btn-flat increase" id="increaseCount">
                          <i class="fas fa-plus fa-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Buttons -->
                  <div class="text-right mt-4">
                    <button type="button" class="btn btn-danger btn-sm" id="deleteEvent">Delete</button>
                    <button type="button" class="btn btn-warning btn-sm" id="cancelEdit" style="display:none;">Cancel</button>
                    <button type="button" class="btn btn-success btn-sm" id="updateEvent">Update</button>
                    <button type="button" class="btn btn-primary btn-sm" id="createEvent">Create</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-row card-primary">
        <div class="card-header">
          <h3 class="card-title">
            Upcoming Events
          </h3>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-center align-items-center upcoming-events-loader" style="min-height: 200px;"> 
            <i class="fas fa-sync fa-spin fa-4x"></i> 
          </div>
          <div class="upcomingEvents">
          </div>
         
        </div>
      </div>

      <div class="card card-row card-success">
        <div class="card-header">
          <h3 class="card-title">
            Completed Events
          </h3>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-center align-items-center completed-events-loader" style="min-height: 200px;"> 
            <i class="fas fa-sync fa-spin fa-4x"></i> 
          </div>
          <div class="completedEvents">
          </div>         
        </div>       
      </div>

    </div>
  </section>
</div>

@endsection

@push('scripts')
<script src="{{ asset('assets/plugins/moment/moment.min.js') }}"></script>
<script src="{{ asset('assets/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}"></script>
<script src="{{ asset('assets/plugins/ekko-lightbox/ekko-lightbox.min.js') }}"></script>
<script src="{{ asset('assets/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js') }}"></script>
<script src="{{ asset('assets/plugins/filterizr/jquery.filterizr.min.js') }}"></script>
<script src="{{ asset('assets/js/event_lists.js') }}"></script>
@endpush
@extends('layouts.admin')

@push('styles')
  <link rel="stylesheet" href="{{ url('public/assets/plugins/ekko-lightbox/ekko-lightbox.css') }}">
  <link rel="stylesheet" href="{{ url('public/assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
  <link rel="stylesheet" href="{{ url('public/assets/plugins/overlayScrollbars/css/OverlayScrollbars.min.css') }}">
@endpush

@section('content')
<div class="content-wrapper kanban ml-0" style="background-color: #fff;">
  <section class="content pb-3">
    <div class="container-fluid h-100">

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
<script src="{{ url('public/assets/plugins/moment/moment.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/ekko-lightbox/ekko-lightbox.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/filterizr/jquery.filterizr.min.js') }}"></script>
<script src="{{ url('public/assets/js/event_lists.js') }}"></script>
@endpush
@extends('layouts.admin')

@push('styles')
{{-- <link rel="stylesheet" href="../plugins/fullcalendar/main.css"> --}}
<link rel="stylesheet" href="{{ asset('assets/plugins/fullcalendar/main.css') }}">
<link rel="stylesheet" href="{{ asset('assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
@endpush
@section('content')
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-3">
        <div class="sticky-top mb-3">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Predefined Events</h4>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-center align-items-center pred-events-loader" style="min-height: 200px;"> 
                <i class="fas fa-sync fa-spin fa-4x"></i> 
              </div>
              <!-- the events -->
              <div id="external-events"></div>
            </div>
            <!-- /.card-body -->
          </div>
          <!-- /.card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Create Event</h3>
            </div>
            <div class="card-body">
              <div class="btn-group" style="width: 100%; margin-bottom: 10px;">
                <ul class="fc-color-picker" id="color-chooser">
                  <li><a style="color: #3c8dbc" href="#"><i class="fas fa-square"></i></a></li>
                  <li><a style="color: #f39c12" href="#"><i class="fas fa-square"></i></a></li>
                  <li><a style="color: #00a65a" href="#"><i class="fas fa-square"></i></a></li>
                  <li><a style="color: #dd4b39" href="#"><i class="fas fa-square"></i></a></li>
                  <li><a style="color: #6c757d" href="#"><i class="fas fa-square"></i></a></li>
                </ul>
              </div>
              <!-- /btn-group -->
              <div class="input-group">
                <input id="new-event" type="text" class="form-control" placeholder="Event Title">
                <div class="input-group-append">
                  <button id="add-new-event" type="button" class="btn btn-primary">Add</button>
                </div>
                <!-- /btn-group -->
              </div>
              <!-- /input-group -->
            </div>
          </div>
        </div>
      </div>
      <!-- /.col -->
      <div class="col-md-9">
        <div class="card card-primary">
          <div class="card-body p-0">
            <!-- THE CALENDAR -->
            <div id="calendar"></div>
          </div>
          <!-- /.card-body -->
        </div>
        <!-- /.card -->
      </div>
      <!-- /.col -->
    </div>
    <!-- /.row -->
  </div><!-- /.container-fluid -->
@endsection
@push('scripts')
  <!-- fullCalendar -->
  <script src="{{ asset('assets/plugins/moment/moment.min.js') }}"></script>
  <script src="{{ asset('assets/plugins/fullcalendar/main.js') }}"></script>
  <script src="{{ asset('assets/js/calendar_events.js') }}"></script>
  <script src="{{ asset('assets/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}"></script>
  <script>

    $(document).ready(function () {
      /* $.ajax({ url: "{{url('/event_types')}}", type: "GET", dataType: "json", beforeSend: function (data) { event_loader('show'); }, success: function (data) { event_loader('hide'); if(data.event_types.length > 0){ (data.event_types).forEach(element => { const textColor = getContrastColor(element.color); // Add style for text color along with background color $('#external-events').prepend( `<div class="external-event" style="background-color: ${element.color}; color: ${textColor}"> ${element.title} </div>` ); }) console.log(data.event_types); } else { $('#external-events').html( `<div class="alert alert-danger" role="alert"> No Event Types Found </div>` ); } }, error: function (data) { event_loader('hide'); console.log(data); } }); */

      /* $("#add-new-event").click(function (e) { var new_event = $("#new-event").val(); if (new_event != "") { $.ajax({ url: "{{url('/event_types')}}", type: "POST", data: { 'title': new_event }, dataType: "json", success: function (data) { event_loader('hide'); if(data.status){ $('#external-events').append( `<div class="external-event" style="background-color: ${data.color}; color: ${getContrastColor(data.color)}"> ${new_event} </div>` ); $("#new-event").val(''); } else { alert(data.message); } }}}) }); */
    })

    
  </script>

@endpush
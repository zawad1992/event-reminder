$(function () {

  /* initialize the external events
  -----------------------------------------------------------------*/
  function ini_events(ele) {
    ele.each(function () {
      // create an Event Object (https://fullcalendar.io/docs/event-object)
      // it doesn't need to have a start or end
      var eventObject = {
        title: $.trim($(this).text()) // use the element's text as the event title
      }

      // store the Event Object in the DOM element so we can get to it later
      $(this).data('eventObject', eventObject)

      // make the event draggable using jQuery UI
      $(this).draggable({
        zIndex        : 1070,
        revert        : true, // will cause the event to go back to its
        revertDuration: 0  //  original position after the drag
      })
    })
  }

  ini_events($('#external-events div.external-event'))

  function event_loader(status) {
    $('.pred-events-loader').removeClass('d-flex');
    $('.pred-events-loader').addClass('d-none');
    $("#external-events").removeClass("d-none");

    if(status == 'show'){
      $('.pred-events-loader').addClass('d-flex');
      $('.pred-events-loader').removeClass('d-none');
      $("#external-events").addClass("d-none");
    }
  }


  // Modify the event creation code in both AJAX calls
  function createEventElement(title, currColor, textColor, eventId) {
    var event = $('<div />')
    event.css({ 'background-color': currColor, 'border-color': currColor, 'color': textColor, 'position': 'relative', 'padding-right': '60px' }).addClass('external-event')
    .attr('data-event-id', eventId)
    
    // Add title span
    event.append($('<span />').addClass('event-title').text(title))
    
    // Add edit/delete icons container
    var icons = $('<div />').css({ 'position': 'absolute', 'right': '5px', 'top': '50%', 'transform': 'translateY(-50%)', 'display': 'none' }).addClass('event-actions')
    
    // Add edit icon
    icons.append($('<i />').addClass('fas fa-edit mr-2').css({ 'cursor': 'pointer', 'margin-right': '8px' }))
    
    // Add delete icon
    icons.append($('<i />').addClass('fas fa-trash-alt').css({ 'cursor': 'pointer' }))
    
    event.append(icons)
    
    // Show/hide icons on hover
    event.hover(
        function() { $(this).find('.event-actions').show(); },
        function() { $(this).find('.event-actions').hide(); }
    )
    
    return event;
  }

  /*  Load Predefined Event
  ------------------------- */
  $.ajax({
    url: base_url+ "/event_types/",
    type: "GET",
    dataType: "json",
    beforeSend: function (data) {
      event_loader('show');
    },
    success: function (data) {
      event_loader('hide');
      if(data.event_types.length > 0){
        (data.event_types).forEach(element => {
          const textColor = getContrastColor(element.color);
          var currColor = element.color;
          var title = element.title;
          // Create events
          var event = createEventElement(
            title, 
            currColor, 
            textColor,
            element.id
          );
          $('#external-events').prepend(event);
          ini_events(event);
        });
        
      } else {
        $('#external-events').html(
          `<div class="alert alert-danger" role="alert">
              No Event Types Found
          </div>`
        );
      }
    },
    error: function (data) {
      event_loader('hide');
    }
  });

  /* initialize the calendar
  -----------------------------------------------------------------*/
  //Date for the calendar events (dummy data)
  var date = new Date()
  var d    = date.getDate(),
      m    = date.getMonth(),
      y    = date.getFullYear()

  var Calendar = FullCalendar.Calendar;
  var Draggable = FullCalendar.Draggable;

  var containerEl = document.getElementById('external-events');
  // var checkbox = document.getElementById('drop-remove');
  var calendarEl = document.getElementById('calendar');

  // initialize the external events
  // -----------------------------------------------------------------

  new Draggable(containerEl, {
    itemSelector: '.external-event',
    eventData: function(eventEl) {
      return {
        title: eventEl.innerText,
        backgroundColor: window.getComputedStyle( eventEl ,null).getPropertyValue('background-color'),
        borderColor: window.getComputedStyle( eventEl ,null).getPropertyValue('background-color'),
        textColor: window.getComputedStyle( eventEl ,null).getPropertyValue('color'),
      };
    }
  });


  var eventdata = [];
  /* var eventdata = [
    {
      title: 'All Day Event',
      start: new Date(y, m, 1),
      backgroundColor: '#f56954',
      borderColor: '#f56954',
      allDay: true
    },
    {
      title: 'ZAWAD Event',
      start: new Date(y, m, 2),
      backgroundColor: '#f56954',
      borderColor: '#f56954',
      allDay: true
    },
    {
      title: 'Long Event',
      start: new Date(y, m, d - 5),
      end: new Date(y, m, d - 2),
      backgroundColor: '#f39c12',
      borderColor: '#f39c12',
      allDay: true,

      editable: true,
      durationEditable: true
    },
    {
      title: 'Long Event',
      start: new Date(y, m, d - 6),
      end: new Date(y, m, d - 3),
      backgroundColor: '#f39c12',
      borderColor: '#f39c12'
    },
    {
      title: 'Meeting',
      start: new Date(y, m, d, 10, 30),
      end: new Date(y, m, d, 12, 30),
      backgroundColor: '#f39c12',
      borderColor: '#f39c12',
      allDay: true
    },
    {
      title: 'Lunch',
      start: new Date(y, m, d, 12, 0),
      end: new Date(y, m, d, 14, 0),
      allDay: false,
      backgroundColor: '#00c0ef',
      borderColor: '#00c0ef'
    },
    {
      title: 'Birthday Party',
      start: new Date(y, m, d + 1, 19, 0),
      end: new Date(y, m, d + 1, 22, 30),
      allDay: false,
      backgroundColor: '#00a65a',
      borderColor: '#00a65a'
    },
    {
      title: 'Click for Google',
      start: new Date(y, m, 28),
      end: new Date(y, m, 29),
      url: 'https://www.google.com/',
      backgroundColor: '#3c8dbc',
      borderColor: '#3c8dbc'
    }
  ]; */

  $.ajax({
    url: base_url + "/get-events/",  // Your events endpoint
    type: "GET",
    dataType: "json",
    beforeSend: function() {
        // Show loader if needed
    },
    success: function(response) {
        if (response.events && response.events.length > 0) {
            // Transform your events data into the format FullCalendar expects
            eventdata = response.events.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start_date,
                end: event.end_date,
                backgroundColor: event.color || '#3c8dbc',
                borderColor: event.color || '#3c8dbc',
                allDay: event.is_all_day || false
            }));
            
            // After loading events, initialize the calendar
            initializeCalendar();
        }
    },
    error: function(xhr) {
        console.error('Error loading events:', xhr);
        // Initialize calendar even if events failed to load
        initializeCalendar();
    }
  });
  console.log(eventdata);
  initializeCalendar();
  function initializeCalendar() {
    var calendar = new Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev,next today',
        center: 'title', // Added yearDropdown here
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      themeSystem: 'bootstrap',
      
    
      //Random default events
      events: eventdata,
      // Enable event dragging and resizing
      editable  : true,
      droppable : true,
      selectable: true,
      eventResizableFromStart: true, // Allow resize from both ends
      
      // Handle event click to show modal
      eventClick: function(info) {
        var event = info.event;
        $('#eventTitle').val(event.title);
        $('#eventStart').val(moment(event.start).format('YYYY-MM-DDTHH:mm'));
        if(event.end) {
          $('#eventEnd').val(moment(event.end).format('YYYY-MM-DDTHH:mm'));
        }
        
        // Store the clicked event for later use
        $('#eventModal').data('event', event);
        $('#eventModal').modal('show');
      },
      
      // Handle event resizing
      eventResize: function(info) {
        // Optional: Add notification
        alert('Event resized: ' + info.event.title);
      },

    
      select: function(info) {
        // Clear previous modal data
        $('#eventTitle').val('');
        $('#eventStart').val(moment(info.start).format('YYYY-MM-DDTHH:mm'));
        $('#eventEnd').val(moment(info.end).format('YYYY-MM-DDTHH:mm'));
        
        // Hide regular buttons and show create button
        $('#saveEvent, #deleteEvent').hide();
        $('#createEvent').show();
        
        // Store the selection info for later use
        $('#eventModal').data('selectInfo', info);
        
        // Show the modal
        $('#eventModal').modal('show');
      },

      // Add custom year dropdown renderer
      viewDidMount: function(view) {
        if(!document.getElementById('yearSelect')) {
          var currentYear = calendar.getDate().getFullYear();
          var select = document.createElement('select');
          select.id = 'yearSelect';
          select.className = 'form-control d-inline-block ml-2';
          select.style.width = 'auto';
          
          // Add options for ±10 years
          for(let i = currentYear - 5; i <= currentYear + 10; i++) {
            let option = document.createElement('option');
            option.value = i;
            option.text = i;
            if(i === currentYear) option.selected = true;
            select.appendChild(option);
          }
          
          // Insert after the title
          var titleElement = document.querySelector('.fc-toolbar-title');
          titleElement.insertAdjacentElement('afterend', select);
          
          // Handle year change
          select.onchange = function() {
            var newDate = calendar.getDate();
            newDate.setFullYear(this.value);
            calendar.gotoDate(newDate);
          };
        }
      }
    });

    calendar.render();
  }
  // $('#calendar').fullCalendar()

  /* ADDING EVENTS */
  var currColor = '#3c8dbc' //Red by default
  // Color chooser button
  $('#color-chooser > li > a').click(function (e) {
    e.preventDefault()
    // Save color
    currColor = $(this).css('color')
    // Add color effect to button
    $('#add-new-event').css({
      'background-color': currColor,
      'border-color'    : currColor
    })
  })
  $('#add-new-event').click(function (e) {
    e.preventDefault()
    // Get value and make sure it is not null
    var val = $('#new-event').val()
    if (val.length == 0) {
      return
    }
    $.ajax({
      url: base_url+ "/event_type/add",
      type: "POST",
      data: {
        'title': val,
        'color': currColor,
        'is_user_defined': 1        
      },
      dataType: "json",
      success: function(data) {
        event_loader('hide');
        if(data.event_type) {
            var event = createEventElement(
                val, 
                currColor, 
                getContrastColor(currColor),
                data.event_type.id
            );
            $('#external-events').prepend(event);
            ini_events(event);
            $('#new-event').val('');
        }
      },
      error: function (data) {
        customAlert('Error',data.responseJSON.message,'red');
        event_loader('hide');
      }
    })
  })
})
$(document).ready(function() {
  // Save event changes
  $('#saveEvent').click(function() {
    var event = $('#eventModal').data('event');
    if(event) {
      event.setProp('title', $('#eventTitle').val());
      event.setStart($('#eventStart').val());
      event.setEnd($('#eventEnd').val());
    }
    $('#eventModal').modal('hide');
  });

  // Delete event
  $('#deleteEvent').click(function() {
    var event = $('#eventModal').data('event');
    if(event) {
      event.remove();
    }
    $('#eventModal').modal('hide');
  });

  // Handle event creation
  $('#createEvent').click(function() {
    var selectInfo = $('#eventModal').data('selectInfo');
    var title = $('#eventTitle').val();
    
    if (title) {
      calendar.addEvent({
        title: title,
        start: $('#eventStart').val(),
        end: $('#eventEnd').val(),
        allDay: selectInfo.allDay,
        backgroundColor: currColor,
        borderColor: currColor
      });
    }
    
    $('#eventModal').modal('hide');
    calendar.unselect();
  });

  // Clear modal state when hidden
  $('#eventModal').on('hidden.bs.modal', function () {
    $(this).removeData('selectInfo');
    $(this).removeData('event');
    $('#createEvent').hide();
    $('#saveEvent, #deleteEvent').show();
  });

  // Variables for editing
  var editEventId = null;
  var editColor = null;

  // Handle edit icon click
  $(document).on('click', '.external-event .fa-edit', function(e) {
      e.stopPropagation();
      var eventDiv = $(this).closest('.external-event');
      var eventId = eventDiv.data('event-id');
      var title = eventDiv.find('.event-title').text();
      var color = eventDiv.css('background-color');
      
      // Populate modal
      $('#edit-event-id').val(eventId);
      $('#edit-event-title').val(title);
      editColor = color;
      
      // Show modal
      $('#editEventModal').modal('show');
  });

  // Handle delete icon click
  $(document).on('click', '.external-event .fa-trash-alt', function(e) {
      e.stopPropagation();
      var eventDiv = $(this).closest('.external-event');
      var eventId = eventDiv.data('event-id');

      // customConfirm

      $.confirm({
        title: 'Delete Event',
        content: 'Are you sure you want to delete this event?',
        type: 'red',
        typeAnimated: true,
        backgroundDismiss: false,
        backgroundDismissAnimation: 'glow',
        buttons: {
            Yes: {
                text: 'Yes',
                btnClass: 'btn-red',
                action: function() {
                  deleteEvent();
                }
            },
            No: {
                text: 'No'
            }
        }
      });
      function deleteEvent() {
        $.ajax({
          url: base_url + "/event_type/delete/" + eventId,
          type: "DELETE",
          dataType: "json",
          success: function(response) {
              if (response.success) {
                  eventDiv.remove();
                  // customAlert('Success', 'Event deleted successfully', 'green');
              }
          },
          error: function(xhr) {
              customAlert('Error', xhr.responseJSON?.message || 'Failed to delete event', 'red');
          }
        });
      }
  });

  // Handle color picker in edit modal
  $('#edit-color-chooser > li > a').click(function(e) {
      e.preventDefault();
      editColor = $(this).data('color');
      console.log(editColor);
  });

  // Handle save changes button
  $('#save-edit-event').click(function() {
      var eventId = $('#edit-event-id').val();
      var newTitle = $('#edit-event-title').val();

      if (newTitle.length === 0) {
          customAlert('Error', 'Event title cannot be empty', 'red');
          return;
      }

      $.ajax({
        url: base_url + "/event_type/update/" + eventId,
        type: "PUT",
        data: {
            'title': newTitle,
            'color': editColor
        },
        dataType: "json",
        success: function(response) {
            if (response.success) {
                // Update the event in the UI
                var eventDiv = $(`.external-event[data-event-id="${eventId}"]`);
                eventDiv.find('.event-title').text(newTitle);
                eventDiv.css({
                    'background-color': editColor,
                    'border-color': editColor,
                    'color': getContrastColor(editColor)
                });
                
                $('#editEventModal').modal('hide');
                // customAlert('Success', 'Event updated successfully', 'green');
            }
        },
        error: function(xhr) {
            customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
        }
      });
  });

  
});
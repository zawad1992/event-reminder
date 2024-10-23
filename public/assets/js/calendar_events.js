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
  var checkbox = document.getElementById('drop-remove');
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

  var eventdata = [
    {
      title: 'All Day Event',
      start: new Date(y, m, 1),
      backgroundColor: '#f56954',
      borderColor: '#f56954',
      allDay: true
    },
    {
      title: 'Long Event',
      start: new Date(y, m, d - 5),
      end: new Date(y, m, d - 2),
      backgroundColor: '#f39c12',
      borderColor: '#f39c12'
    },
    {
      title: 'Meeting',
      start: new Date(y, m, d, 10, 30),
      allDay: false,
      backgroundColor: '#0073b7',
      borderColor: '#0073b7'
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
  ];

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


    /* select: function(info) {
      let eventTitle = prompt('Enter Event Title:');
      if (eventTitle) {
        calendar.addEvent({
          title: eventTitle,
          start: info.start,
          end: info.end,
          allDay: info.allDay,
          backgroundColor: currColor,
          borderColor: currColor
        });
      }
      calendar.unselect();
    }, */
    // this allows things to be dropped onto the calendar !!!
    drop: function(info) {
      // is the "remove after drop" checkbox checked?
      if (checkbox.checked) {
        // if so, remove the element from the "Draggable Events" list
        info.draggedEl.parentNode.removeChild(info.draggedEl);
      }
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
        for(let i = currentYear - 10; i <= currentYear + 10; i++) {
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

    // Create events
    var event = $('<div />')
    event.css({
      'background-color': currColor,
      'border-color'    : currColor,
      'color'           : '#fff'
    }).addClass('external-event')
    event.text(val)
    $('#external-events').prepend(event)

    // Add draggable funtionality
    ini_events(event)

    // Remove event from text input
    $('#new-event').val('')
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
});
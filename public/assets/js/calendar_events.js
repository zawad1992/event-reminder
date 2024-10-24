$(function() {
  // Global variables
  let calendar;
  let currColor = '#3c8dbc';
  let eventdata = [];
  let editEventId = null;
  let editColor = null;
  
  // =====================
  // Utility Functions
  // =====================
  function event_loader(status) {
    $('.pred-events-loader').removeClass('d-flex').addClass('d-none');
    $("#external-events").removeClass("d-none");

    if(status === 'show') {
      $('.pred-events-loader').addClass('d-flex').removeClass('d-none');
      $("#external-events").addClass("d-none");
    }
  }

  function createEventElement(title, currColor, textColor, isUserDefined, eventId) {
    const event = $('<div />')
      .css({
        'background-color': currColor,
        'border-color': currColor,
        'color': textColor,
        'position': 'relative',
        'padding-right': '60px'
      })
      .addClass('external-event')
      .attr('data-event-id', eventId);

    // Add title span
    event.append($('<span />').addClass('event-title').text(title));
    
    if(isUserDefined === 1) {
      // Add edit/delete icons container
      const icons = $('<div />')
        .css({
          'position': 'absolute',
          'right': '5px',
          'top': '50%',
          'transform': 'translateY(-50%)',
          'display': 'none'
        })
        .addClass('event-actions');

      // Add edit and delete icons
      icons.append($('<i />').addClass('fas fa-edit mr-2').css({ 'cursor': 'pointer', 'margin-right': '8px' }));
      icons.append($('<i />').addClass('fas fa-trash-alt').css({ 'cursor': 'pointer' }));
      event.append(icons);

      // Show/hide icons on hover
      event.hover(
        function() { $(this).find('.event-actions').show(); },
        function() { $(this).find('.event-actions').hide(); }
      );
    }

    return event;
  }

  function ini_events(ele) {
    ele.each(function() {
      const eventObject = {
        title: $.trim($(this).text())
      };
      
      $(this).data('eventObject', eventObject);
      
      $(this).draggable({
        zIndex: 1070,
        revert: true,
        revertDuration: 0
      });
    });
  }



  // Initialize the external events
  ini_events($('#external-events div.external-event'));
  
  // =====================
  // Initialize date time pickers
  // =====================
  $('#startDatePicker').datetimepicker({
    format: 'YYYY-MM-DD hh:mm A',    // Changed to AM/PM format
    icons: {
      time: 'fas fa-clock',
      date: 'fas fa-calendar',
      up: 'fas fa-arrow-up',
      down: 'fas fa-arrow-down',
      previous: 'fas fa-chevron-left',
      next: 'fas fa-chevron-right',
      today: 'fas fa-calendar-check',
      clear: 'fas fa-trash',
      close: 'fas fa-times'
    }
  });

  $('#endDatePicker').datetimepicker({
      format: 'YYYY-MM-DD hh:mm A',    // Changed to AM/PM format
      icons: {
          time: 'fas fa-clock',
          date: 'fas fa-calendar',
          up: 'fas fa-arrow-up',
          down: 'fas fa-arrow-down',
          previous: 'fas fa-chevron-left',
          next: 'fas fa-chevron-right',
          today: 'fas fa-calendar-check',
          clear: 'fas fa-trash',
          close: 'fas fa-times'
      },
      useCurrent: false
  });  

  // When start date changes, set it as minimum for end date
  $("#startDatePicker").on("change.datetimepicker", function (e) {
    $('#endDatePicker').datetimepicker('minDate', e.date);
  });

  // =====================
  // Calendar Initialization
  // =====================
  function initializeCalendar() {
    const Calendar = FullCalendar.Calendar;
    const calendarEl = document.getElementById('calendar');

    let receivedEvent = null;
    
    calendar = new Calendar(calendarEl, {
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        themeSystem: 'bootstrap',
        events: eventdata,
        editable: true,
        droppable: true,
        selectable: true,
        eventResizableFromStart: true,

        drop: function(info) {
            const backgroundColor = $(info.draggedEl).css('backgroundColor');
            const eventTitle = $(info.draggedEl).find('.event-title').text();
            const eventTypeId = $(info.draggedEl).data('event-id');
            
            $('#eventModal').data('dropInfo', {
                date: info.date,
                backgroundColor: backgroundColor,
                title: eventTitle,
                eventTypeId: eventTypeId,
                allDay: true
            });
        },

        eventReceive: function(info) {
            receivedEvent = info.event;
            receivedEvent.remove();
        
            // Reset form
            $('#eventTitle').val(receivedEvent.title);
            $('#eventDescription').val('');
            $('#eventAllDay').prop("checked", true).trigger("change");
            $('#eventRecurring').prop("checked", false).trigger("change");
            $('#eventReminder').prop("checked", false);
            
            // Set event type if available
            const dropInfo = $('#eventModal').data('dropInfo');
            if (dropInfo && dropInfo.eventTypeId) {
                $('#eventType').val(dropInfo.eventTypeId);
            }
        
            // Format dates
            $('#startDatePicker').datetimepicker('date', moment(receivedEvent.start));
            $('#endDatePicker').datetimepicker('date', moment(receivedEvent.start).add(1, 'hour'));
            
            // Update modal buttons
            $('#updateEvent, #deleteEvent').hide();
            $('#createEvent').show();
            
            $('#eventModal').modal('show');
        },
        
        eventClick: function(info) {
            const event = info.event;
            
            // Reset and populate form
            $('#eventTitle').val(event.title);
            $('#eventDescription').val(event.extendedProps.description || '');
            $('#eventType').val(event.extendedProps.event_type_id);
            $('#eventReminder').prop('checked', event.extendedProps.is_reminder || false);
            
            // Set All Day first so the picker format updates
            $('#eventAllDay').prop('checked', event.allDay).trigger('change');
            
            // Set dates
            $('#startDatePicker').datetimepicker('date', moment(event.start));
            $('#endDatePicker').datetimepicker('date', event.end ? moment(event.end) : moment(event.start).add(1, 'hour'));
            
            // Handle recurring fields
            const isRecurring = event.extendedProps.is_recurring || false;
            $('#eventRecurring').prop('checked', isRecurring).trigger('change');
            if(isRecurring) {
                $(`input[name="recurringType"][value="${event.extendedProps.recurring_type}"]`).prop('checked', true);
                $('#recurringCount').val(event.extendedProps.recurring_count);
            }
            
            // Update modal state
            $('#eventModal').data('event', event);
            $('#updateEvent, #deleteEvent').show();
            $('#createEvent').hide();
            $('#eventModal').modal('show');
        },
        
        select: function(info) {
            // Reset form
            $('#eventTitle').val('');
            $('#eventDescription').val('');
            $('#eventAllDay').prop("checked", false).trigger('change');
            $('#eventRecurring').prop("checked", false).trigger('change');
            $('#eventReminder').prop("checked", false);
            $('#eventType').val($('#eventType option:first').val());
            
            // Set dates
            $('#startDatePicker').datetimepicker('date', moment(info.start));
            $('#endDatePicker').datetimepicker('date', moment(info.end));
            
            // Update modal state
            $('#eventModal').removeData('dropInfo');
            $('#eventModal').data('selectInfo', info);
            $('#updateEvent, #deleteEvent').hide();
            $('#createEvent').show();
            
            $('#eventModal').modal('show');
        },

        eventResize: function(info) {
            // Consider replacing with proper event update
            const event = info.event;
            const formData = {
                id: event.id,
                start_date: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
                end_date: moment(event.end).format('YYYY-MM-DD HH:mm:ss')
            };

            $.ajax({
                url: base_url + "/event/update/" + event.id,
                type: "PUT",
                data: formData,
                dataType: "json",
                error: function(xhr) {
                    info.revert();
                    customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
                }
            });
        },

        viewDidMount: function(view) {
            if(!document.getElementById('yearSelect')) {
                const currentYear = calendar.getDate().getFullYear();
                const select = document.createElement('select');
                select.id = 'yearSelect';
                select.className = 'form-control d-inline-block ml-2';
                select.style.width = 'auto';
                
                for(let i = currentYear - 5; i <= currentYear + 10; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.text = i;
                    if(i === currentYear) option.selected = true;
                    select.appendChild(option);
                }
                
                const titleElement = document.querySelector('.fc-toolbar-title');
                titleElement.insertAdjacentElement('afterend', select);
                
                select.onchange = function() {
                    const newDate = calendar.getDate();
                    newDate.setFullYear(this.value);
                    calendar.gotoDate(newDate);
                };
            }
        }
    });

    calendar.render();
    
    // Initialize external events
    new FullCalendar.Draggable(document.getElementById('external-events'), {
        itemSelector: '.external-event',
        eventData: function(eventEl) {
            return {
                title: eventEl.innerText,
                backgroundColor: window.getComputedStyle(eventEl, null).getPropertyValue('background-color'),
                borderColor: window.getComputedStyle(eventEl, null).getPropertyValue('background-color'),
                textColor: window.getComputedStyle(eventEl, null).getPropertyValue('color'),
            };
        }
    });
  }

  // =====================
  // Event CRUD Operations
  // =====================

  // Validate event form
  function validateEventForm() {
    let isValid = true;
    const requiredFields = {
        'eventTitle': 'Event Title',
        'eventType': 'Event Type',
        'eventStart': 'Start Time',
        'eventEnd': 'End Time'
    };

    // Date format regex patterns
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$/;  // 2024-10-23 11:46 PM
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;  // 2024-10-23


    // Reset previous validation states
    $('.form-group').removeClass('has-error');
    $('.error-message').remove();

    // Check each required field
    Object.keys(requiredFields).forEach(fieldId => {
        const field = $(`#${fieldId}`);
        const value = field.val().trim();
        
        if (!value) {
            isValid = false;
            const formGroup = field.closest('.form-group');
            formGroup.addClass('has-error');
            
            // Add error message
            if (formGroup.find('.error-message').length === 0) {
              formGroup.append(`<div class="error-message text-danger mt-1"><small>${requiredFields[fieldId]} is required</small></div>`);
            }
            
            // Add red border to input
            field.css('border-color', '#dc3545');
        } else if (fieldId === 'eventStart' || fieldId === 'eventEnd') {
          const isAllDay = $('#eventAllDay').is(':checked');
          const isValidFormat = isAllDay ? 
              dateOnlyRegex.test(value) : 
              dateTimeRegex.test(value);

          if (!isValidFormat) {
              isValid = false;
              formGroup.addClass('has-error');
              const expectedFormat = isAllDay ? 
                  'YYYY-MM-DD' : 
                  'YYYY-MM-DD HH:MM AM/PM';
              formGroup.append(`<div class="error-message text-danger mt-1"><small>Invalid date format. Expected format: ${expectedFormat}</small></div>`);
              field.css('border-color', '#dc3545');
          }
      } else {
            // Reset styling if field is valid
            field.css('border-color', '');
        }
    });

    return isValid;
  }
  
  // Create Event
  $('#createEvent').click(function(e){
    e.preventDefault();
    
    if (!validateEventForm()) {
        return false;
    }

    const isAllDay = $('#eventAllDay').is(':checked');
    const isReminder = $('#eventReminder').is(':checked');
    const isRecurring = $('#eventRecurring').is(':checked');
    const startDate = $('#startDatePicker').datetimepicker('date');
    const endDate = $('#endDatePicker').datetimepicker('date');
    const color = $('#eventType :selected').data('color');

    const formData = {
        title: $('#eventTitle').val(),
        description: $('#eventDescription').val(),
        event_type_id: $('#eventType').val(),
        start_date: startDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
        end_date: endDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
        color: color,
        is_all_day: isAllDay,
        is_reminder: isReminder,
        is_recurring: isRecurring,
        recurring_type: isRecurring ? $('input[name="recurringType"]:checked').val() : null,
        recurring_count: isRecurring ? $('#recurringCount').val() : null
    };

    // Add the dropped event's type if it exists
    const dropInfo = $('#eventModal').data('dropInfo');
    if (dropInfo) {
        formData.event_type_id = dropInfo.eventTypeId;
    }

    $.ajax({
      url: base_url + "/event/add",
      type: "POST",
      data: formData,
      dataType: "json",
      success: function(response) {
        if (response.success) {
            calendar.addEvent({
                id: response.event.id,
                title: formData.title,
                description: formData.description,
                eventTypeId: formData.event_type_id,
                start: formData.start_date,
                end: formData.end_date,
                color: formData.color,
                isAllDay: formData.is_all_day,
                isReminder: formData.is_reminder,
                isRecurring: formData.is_recurring,
                recurringType: formData.recurring_type,
                recurringCount: formData.recurring_count,
                backgroundColor: dropInfo ? dropInfo.backgroundColor : $('#eventType option:selected').data('color'),
                borderColor: dropInfo ? dropInfo.backgroundColor : $('#eventType option:selected').data('color')
            });
            
            $('#eventModal').modal('hide');
            $('#eventModal').removeData('dropInfo');
            calendar.unselect();
        }
      },
      error: function(xhr) {
          customAlert('Error', xhr.responseJSON?.message || 'Failed to create event', 'red');
      }
    });
  });

  // Update the event creation handler
  $('#updateEvent').click(function(e) {
    e.preventDefault();
    
    if (!validateEventForm()) {
        return false;
    }

    const event = $('#eventModal').data('event');
    if (!event) return;

    const isAllDay = $('#eventAllDay').is(':checked');
    const isReminder = $('#eventReminder').is(':checked');
    const isRecurring = $('#eventRecurring').is(':checked');
    const startDate = $('#startDatePicker').datetimepicker('date');
    const endDate = $('#endDatePicker').datetimepicker('date');
    const color = $('#eventType :selected').data('color');


    // Create formData object with values from form elements, not from formData itself
    const formData = {
      id: event.id,
      title: $('#eventTitle').val(),
      description: $('#eventDescription').val(),
      event_type_id: $('#eventType').val(),
      start_date: startDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
      end_date: endDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
      color: color,
      is_all_day: isAllDay,
      is_reminder: isReminder,
      is_recurring: isRecurring,
      recurring_type: isRecurring ? $('input[name="recurringType"]:checked').val() : null,
      recurring_count: isRecurring ? $('#recurringCount').val() : null
    };

    // Add the dropped event's type if it exists
    const dropInfo = $('#eventModal').data('dropInfo');
    if (dropInfo) {
      formData.event_type_id = dropInfo.eventTypeId;
    }

    $.ajax({
      url: base_url + "/event/update/" + event.id,
      type: "PUT",
      data: formData,
      dataType: "json",
      success: function(response) {
          if (response.success) {
              // Update the calendar event with the new data
              const updatedEvent = calendar.getEventById(event.id);
              if (updatedEvent) {
                  updatedEvent.setProp('title', formData.title);
                  updatedEvent.setStart(formData.start_date);
                  updatedEvent.setEnd(formData.end_date);
                  updatedEvent.setAllDay(formData.is_all_day);
                  
                  // Update extended properties
                  updatedEvent.setExtendedProp('description', formData.description);
                  updatedEvent.setExtendedProp('eventTypeId', formData.event_type_id);
                  updatedEvent.setExtendedProp('isReminder', formData.is_reminder);
                  updatedEvent.setExtendedProp('isRecurring', formData.is_recurring);
                  updatedEvent.setExtendedProp('recurringType', formData.recurring_type);
                  updatedEvent.setExtendedProp('recurringCount', formData.recurring_count);

                  // Update colors
                  const backgroundColor = dropInfo ? 
                      dropInfo.backgroundColor : 
                      $('#eventType option:selected').data('color');
                  updatedEvent.setProp('backgroundColor', backgroundColor);
                  updatedEvent.setProp('borderColor', backgroundColor);
              }
              
              $('#eventModal').modal('hide');
              $('#eventModal').removeData('dropInfo');
          }
      },
      error: function(xhr) {
          customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
      }
    });
  });

  // Delete Event
  $('#deleteEvent').click(function() {
    const event = $('#eventModal').data('event');
    if(event) {
      event.remove();
    }
    $('#eventModal').modal('hide');
  });

  // Add input event listeners to clear error styling when user starts typing
  $('#eventTitle, #eventType, #eventStart, #eventEnd').on('input change', function() {
    const formGroup = $(this).closest('.form-group');
    formGroup.removeClass('has-error');
    formGroup.find('.error-message').remove();
    $(this).css('border-color', '');
  });

  // Clear validation states when modal is hidden
  $('#eventModal').on('hidden.bs.modal', function() {
    $('.form-group').removeClass('has-error');
    $('.error-message').remove();
    $('input, select').css('border-color', '');
  });

  // =====================
  // Event Type CRUD Operations
  // =====================

  // Color chooser button
  $('#color-chooser > li > a').click(function(e) {
    e.preventDefault();
    currColor = $(this).css('color');
    $('#add-new-event').css({
      'background-color': currColor,
      'border-color': currColor
    });
  });

  // Add Event Type
  $('#add-new-event').click(function(e) {
    e.preventDefault();
    const val = $('#new-event').val();
    if (val.length == 0) {
      return;
    }

    $.ajax({
      url: base_url + "/event_type/add",
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
          const event = createEventElement(
            val,
            currColor,
            getContrastColor(currColor),
            1,
            data.event_type.id
          );
          $('#external-events').prepend(event);
          ini_events(event);
          $('#new-event').val('');
        }
      },
      error: function(data) {
        customAlert('Error', data.responseJSON.message, 'red');
        event_loader('hide');
      }
    });
  });

  // Edit Event Type
  $(document).on('click', '.external-event .fa-edit', function(e) {
    e.stopPropagation();
    const eventDiv = $(this).closest('.external-event');
    editEventId = eventDiv.data('event-id');
    const title = eventDiv.find('.event-title').text();
    editColor = eventDiv.css('background-color');
    
    $('#edit-event-id').val(editEventId);
    $('#edit-event-title').val(title);
    $('#editEventTypeModal').modal('show');
  });

  // Delete Event Type
  $(document).on('click', '.external-event .fa-trash-alt', function(e) {
    e.stopPropagation();
    const eventDiv = $(this).closest('.external-event');
    const eventId = eventDiv.data('event-id');

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
            deleteEventType(eventId, eventDiv);
          }
        },
        No: {
          text: 'No'
        }
      }
    });
  });

  function deleteEventType(eventId, eventDiv) {
    $.ajax({
      url: base_url + "/event_type/delete/" + eventId,
      type: "DELETE",
      dataType: "json",
      success: function(response) {
        if (response.success) {
          eventDiv.remove();
        }
      },
      error: function(xhr) {
        customAlert('Error', xhr.responseJSON?.message || 'Failed to delete event', 'red');
      }
    });
  }

  // Update Event Type color
  $('#edit-color-chooser > li > a').click(function(e) {
    e.preventDefault();
    editColor = $(this).data('color');
  });

  $('#update-event-type').click(function() {
    const eventId = $('#edit-event-id').val();
    const newTitle = $('#edit-event-title').val();

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
          const eventDiv = $(`.external-event[data-event-id="${eventId}"]`);
          eventDiv.find('.event-title').text(newTitle);
          eventDiv.css({
            'background-color': editColor,
            'border-color': editColor,
            'color': getContrastColor(editColor)
          });
          
          $('#editEventTypeModal').modal('hide');
        }
      },
      error: function(xhr) {
        customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
      }
    });
  });

  // =====================
  // Modal Handling
  // =====================
  $('#eventModal').on('hidden.bs.modal', function() {
    $(this).removeData('selectInfo');
    $(this).removeData('event');
    $('#createEvent').hide();
    $('#updateEvent, #deleteEvent').show();
  });

  // =====================
  // Form Controls
  // =====================
  
  // Handle All Day checkbox
  $('#eventAllDay').change(function() {
    const isChecked = this.checked;
    
    if(isChecked) {
        // Configure for date-only
        $('#startDatePicker').datetimepicker('format', 'YYYY-MM-DD');
        $('#endDatePicker').datetimepicker('format', 'YYYY-MM-DD');
        
        // Set times to start and end of day
        const startDate = $('#startDatePicker').datetimepicker('date');
        const endDate = $('#endDatePicker').datetimepicker('date');
        
        if(startDate) {
            startDate.set({hour:0,minute:0,second:0});
            $('#startDatePicker').datetimepicker('date', startDate);
        }
        if(endDate) {
            endDate.set({hour:23,minute:59,second:59});
            $('#endDatePicker').datetimepicker('date', endDate);
        }
    } else {
        // Configure back to datetime with AM/PM
        $('#startDatePicker').datetimepicker('format', 'YYYY-MM-DD hh:mm A');
        $('#endDatePicker').datetimepicker('format', 'YYYY-MM-DD hh:mm A');
    }
  });  
  

  
  // Handle Recurring checkbox
  function initializeRecurringEventHandlers() {
    $('#recurringPeriodDiv, #recurringCountDiv').hide();
    $('#recurringPeriodDiv').removeClass('d-flex');
    
    $('#eventRecurring').change(function() {
      const isChecked = this.checked;
      $('#recurringPeriodDiv, #recurringCountDiv').toggle(isChecked);
      $('#recurringPeriodDiv').toggleClass('d-flex', isChecked);
      $(".recurring-type, #recurringCount, .decrease, .increase").prop("disabled", !isChecked);
    });
  }

  // Counter Controls
  function initializeCounterInputs() {
    const $input = $('#recurringCount');
    const min = parseInt($input.attr('min'));
    const max = parseInt($input.attr('max'));

    $('#decreaseCount').click(function() {
        let currentValue = parseInt($input.val());
        if (currentValue > min) {
            $input.val(currentValue--);
        }
    });

    $('#increaseCount').click(function() {
        let currentValue = parseInt($input.val());
        if (currentValue < max) {
            $input.val(currentValue++);
        }
    });
  }

  // Initialize Event Handlers
  initializeRecurringEventHandlers();

  // Initialize Counter Inputs
  initializeCounterInputs();
  

  // =====================
  // Initial Data Loading
  // =====================
  
  // Load event types
  $.ajax({
    url: base_url + "/event_types/",
    type: "GET",
    dataType: "json",
    beforeSend: () => event_loader('show'),
    success: function(data) {
      event_loader('hide');
      if(data.event_types.length > 0) {
        data.event_types.forEach(element => {
          const textColor = getContrastColor(element.color);
          const event = createEventElement(
            element.title,
            element.color,
            textColor,
            element.is_user_defined,
            element.id
          );
          $('#external-events').prepend(event);
          ini_events(event);

          $('#eventType').append(
            `<option value="${element.id}" 
             data-color="${element.color}" 
             style="font-weight: bold; color: ${element.color}">
             ${element.title}
             </option>`
          );
        });
      } else {
        $('#external-events').html(
          '<div class="alert alert-danger" role="alert">No Event Types Found</div>'
        );
      }
    },
    error: () => event_loader('hide')
  });

  // Load calendar events
  $.ajax({
    url: base_url + "/get-events/",
    type: "GET",
    dataType: "json",
    success: function(response) {
      if (response.events && response.events.length > 0) {
        eventdata = response.events.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          event_type_id: event.event_type_id,
          start: event.start_date,
          end: event.end_date,
          is_all_day: event.is_all_day,
          is_reminder: event.is_reminder,
          is_recurring: event.is_recurring,
          recurring_type: event.recurring_type,
          recurring_count: event.recurring_count,
          backgroundColor: event.color || '#3c8dbc',
          borderColor: event.color || '#3c8dbc',
          allDay: event.is_all_day || false
        }));
      }
      initializeCalendar();
    },
    error: function(xhr) {
      console.error('Error loading events:', xhr);
      initializeCalendar();
    }
  });

  // Recurring event handling
  $('#recurringPeriodDiv, #recurringCountDiv').hide();
  $('#recurringPeriodDiv').removeClass('d-flex');
  
  $('#eventRecurring').change(function() {
    const isChecked = this.checked;
    $('#recurringPeriodDiv, #recurringCountDiv').toggle(isChecked);
    $('#recurringPeriodDiv').toggleClass('d-flex', isChecked);
    $(".recurring-type, #recurringCount, .decrease, .increase").prop("disabled", !isChecked);
  });

  // Counter input groups
  $('.input-group').each(function() {
    const $input = $(this).find('input');
    const $decreaseBtn = $(this).find('.decrease');
    const $increaseBtn = $(this).find('.increase');
    
    $decreaseBtn.click(function() {
      const currentValue = parseInt($input.val());
      if (currentValue > parseInt($input.attr('min'))) {
        $input.val(currentValue - 1);
      }
    });

    $increaseBtn.click(function() {
      const currentValue = parseInt($input.val());
      if (currentValue < parseInt($input.attr('max'))) {
        $input.val(currentValue + 1);
      }
    });

    $input.change(function() {
      const value = parseInt($input.val());
      const min = parseInt($input.attr('min'));
      const max = parseInt($input.attr('max'));
      if (value < min) $input.val(min);
      if (value > max) $input.val(max);
    });
  });
});
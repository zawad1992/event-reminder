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

        select: function(info) {
          // Reset form
          $('#eventTitle').val('');
          $('#eventDescription').val('');
          $('#eventAllDay').prop("checked", false).trigger('change');
          $('#eventRecurring').prop("checked", false).trigger('change');
          $('#eventReminder').prop("checked", false);
          $('#eventType').val($('#eventType option:first').val());
          
          // Set dates with proper end time
          const startDate = moment(info.start);
          const endDate = moment(info.start).endOf('day');
    
          $('#startDatePicker').datetimepicker('date', startDate);
          $('#endDatePicker').datetimepicker('date', endDate);
          
          // Update modal state
          $('#eventModal').removeData('dropInfo');
          $('#eventModal').data('selectInfo', info);
          $('#updateEvent, #deleteEvent').hide();
          $('#createEvent').show();
          
          $('#eventModal').modal('show');
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
            $('#eventType').val(event.extendedProps.eventTypeId);  // Use consistent property name
            $('#eventReminder').prop('checked', event.extendedProps.isReminder === 1);  // Match 0/1 format
            
            // Set All Day first so the picker format updates
            $('#eventAllDay').prop('checked', event.allDay).trigger('change');
            
            // Set dates
            const startDate = moment(event.start);
            let endDate;
            
            if (event.end) {
                if (event.allDay) {
                    // For all-day events, set end date to 11:59 PM of the previous day
                    endDate = moment(event.end).subtract(1, 'days').endOf('day');
                } else {
                    // For regular events, use the actual end time
                    endDate = moment(event.end);
                }
            } else {
                // If no end date, set to end of the start date
                endDate = moment(event.start).endOf('day');
            }
            
            $('#startDatePicker').datetimepicker('date', startDate);
            $('#endDatePicker').datetimepicker('date', endDate);
            
            // Handle recurring fields
            const isRecurring = event.extendedProps.isRecurring === 1;  // Match 0/1 format
            $('#eventRecurring').prop('checked', isRecurring).trigger('change');
            if(isRecurring) {
                $(`input[name="recurringType"][value="${event.extendedProps.recurringType}"]`).prop('checked', true);
                $('#recurringCount').val(event.extendedProps.recurringCount);
            }

            $('#externalParticipants').val(event.extendedProps.externalParticipants || '');
            
            // Update modal state
            $('#eventModal').data('event', event);
            $('#updateEvent, #deleteEvent').show();
            $('#createEvent').hide();
            $('#eventModal').modal('show');
        },

        eventResize: function(info) {
          const event = info.event;
          const isAllDay = event.allDay ? 1 : 0;

          // Get the start date
          const startDate = moment(event.start);
          
          // Calculate the end date based on event type
          let endDate;
          if (event.end) {
              endDate = moment(event.end);
              if (isAllDay) {
                  // For all-day events, subtract 1 day from end date to match server format
                  endDate.subtract(1, 'days');
              }
          } else {
              // If no end date, use start date
              endDate = moment(event.start);
          }
          
          // Get all required data from the event object
          const formData = {
            id: event.id,
            title: event.title,
            description: event.extendedProps.description,
            event_type_id: event.extendedProps.eventTypeId,
            start_date: startDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
            end_date: endDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
            color: event.extendedProps.color,
            is_all_day: isAllDay,
            is_reminder: event.extendedProps.isReminder,
            is_recurring: event.extendedProps.isRecurring,
            recurring_type: event.extendedProps.recurringType,
            recurring_count: event.extendedProps.recurringCount,
            external_participants: event.extendedProps.externalParticipants
          };

          $.ajax({
            url: base_url + "/event/update/" + event.id,
            type: "PUT",
            data: formData,
            dataType: "json",
            success: function(response) {
                if (!response.success) {
                    info.revert();
                }
            },
            error: function(xhr) {
                info.revert();
                customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
            }
          });
        },
        
        eventDrop: function(info) {
          const event = info.event;
          const isAllDay = event.allDay ? 1 : 0;


          // Get the start date
          const startDate = moment(event.start);
          
          // Calculate the end date based on event type
          let endDate;
          if (event.end) {
              endDate = moment(event.end);
              if (isAllDay) {
                  // For all-day events, subtract 1 day from end date to match server format
                  endDate.subtract(1, 'days');
              }
          } else {
              // If no end date, use start date
              endDate = moment(event.start);
          }
          
          // Get all required data from the event object
          const formData = {
            id: event.id,
            title: event.title,
            description: event.extendedProps.description,
            event_type_id: event.extendedProps.eventTypeId,
            start_date: startDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
            end_date: endDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
            color: event.extendedProps.color,
            is_all_day: isAllDay,
            is_reminder: event.extendedProps.isReminder,
            is_recurring: event.extendedProps.isRecurring,
            recurring_type: event.extendedProps.recurringType,
            recurring_count: event.extendedProps.recurringCount,
            external_participants: event.extendedProps.externalParticipants
          };

          $.ajax({
            url: base_url + "/event/update/" + event.id,
            type: "PUT",
            data: formData,
            dataType: "json",
            success: function(response) {
                if (!response.success) {
                    info.revert();
                }
            },
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

    
  // Create Event
  $('#createEvent').click(function(e){
    e.preventDefault();
    
    if (!validateEventForm()) {
        return false;
    }

    const isAllDay = $('#eventAllDay').is(':checked') ? 1 : 0;
    const isReminder = $('#eventReminder').is(':checked') ? 1 : 0;
    const isRecurring = $('#eventRecurring').is(':checked') ? 1 : 0;
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
        recurring_count: isRecurring ? $('#recurringCount').val() : null,
        external_participants: $('#externalParticipants').val()
    };

    // Add the dropped event's type if it exists
    const dropInfo = $('#eventModal').data('dropInfo');
    if (dropInfo) {
      formData.event_type_id = dropInfo.eventTypeId;
      formData.color = dropInfo.backgroundColor;
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
            start: formData.start_date,
            end: isAllDay ? 
                moment(formData.end_date).add(1, 'days').format('YYYY-MM-DD') : 
                formData.end_date,
            allDay: formData.is_all_day,
            backgroundColor: dropInfo ? dropInfo.backgroundColor : $('#eventType option:selected').data('color'),
            borderColor: dropInfo ? dropInfo.backgroundColor : $('#eventType option:selected').data('color'),
            extendedProps: {
              description: formData.description,
              eventTypeId: formData.event_type_id,
              color: dropInfo ? dropInfo.backgroundColor : $('#eventType option:selected').data('color'),
              isReminder: formData.is_reminder,
              isAllDay: formData.is_all_day,
              isRecurring: formData.is_recurring,
              recurringType: formData.recurring_type,
              recurringCount: formData.recurring_count,
              externalParticipants: formData.external_participants
            }
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

    const isAllDay = $('#eventAllDay').is(':checked') ? 1 : 0;
    const isReminder = $('#eventReminder').is(':checked') ? 1 : 0;
    const isRecurring = $('#eventRecurring').is(':checked') ? 1 : 0;
    const startDate = $('#startDatePicker').datetimepicker('date');
    const endDate = $('#endDatePicker').datetimepicker('date');
    const color = $('#eventType :selected').data('color');


    // Create formData object with values from form elements
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
        recurring_count: isRecurring ? $('#recurringCount').val() : null,
        external_participants: $('#externalParticipants').val()
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
                const updatedEvent = calendar.getEventById(event.id);
                if (updatedEvent) {
                    // Remove the existing event
                    updatedEvent.remove();
                    
                    // Add the updated event as a new event
                    calendar.addEvent({
                        id: event.id,
                        title: formData.title,
                        start: formData.start_date,
                        end: isAllDay ? 
                            moment(formData.end_date).add(1, 'days').format('YYYY-MM-DD') : 
                            formData.end_date,
                        allDay: isAllDay === 1,
                        backgroundColor: color,
                        borderColor: color,
                        extendedProps: {
                            description: formData.description,
                            eventTypeId: formData.event_type_id,
                            color: color,
                            isReminder: formData.is_reminder,
                            isAllDay: formData.is_all_day,
                            isRecurring: formData.is_recurring,
                            recurringType: formData.recurring_type,
                            recurringCount: formData.recurring_count,
                            externalParticipants: formData.external_participants
                        }
                    });

                    // Force calendar to refresh the view
                    calendar.refetchEvents();
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
      $.ajax({
        url: base_url + "/event/delete/" + event.id,
        type: "DELETE",
        dataType: "json",
        success: function(response) {
          if (response.success) {
            $('#eventModal').modal('hide');           
          }
        },
        error: function(xhr) {
          customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
        }
      });
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
    $('.form-group').removeClass('has-error');
    $('.error-message').remove();
    $('input, select').css('border-color', '');
  });

  // When loading event for editing
  $('#eventModal').on('show.bs.modal', function() {
    const event = $('#eventModal').data('event');
    if (event) {
      // If it's an all-day event, subtract one day from the displayed end date
      if (event.allDay) {
          const endDate = moment(event.end).subtract(1, 'days');
          $('#endDatePicker').datetimepicker('date', endDate);
      }
    }
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
            startDate.startOf('day'); // Set to beginning of day (00:00)
            $('#startDatePicker').datetimepicker('date', startDate);
        }
        if(endDate) {
            endDate.endOf('day'); // Set to end of day (23:59)
            $('#endDatePicker').datetimepicker('date', endDate);
        }
    } else {
        // Configure back to datetime with AM/PM
        $('#startDatePicker').datetimepicker('format', 'YYYY-MM-DD hh:mm A');
        $('#endDatePicker').datetimepicker('format', 'YYYY-MM-DD hh:mm A');
        
        // When switching from all-day to timed, set reasonable default times
        const startDate = $('#startDatePicker').datetimepicker('date');
        const endDate = $('#endDatePicker').datetimepicker('date');
        
        if(startDate) {
            startDate.set({ hour: 0, minute: 0 }); // Set to 12:00 AM
            $('#startDatePicker').datetimepicker('date', startDate);
        }
        if(endDate) {
            endDate.set({ hour: 23, minute: 59 }); // Set to 11:59 PM
            $('#endDatePicker').datetimepicker('date', endDate);
        }
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
    url: base_url + "/get_events/",
    type: "GET",
    dataType: "json",
    success: function(response) {
      if (response.events && response.events.length > 0) {
        eventdata = response.events.map(event => {
          // For all-day events, add a day to end_date
          let endDate = event.is_all_day === 1 ? 
              moment(event.end_date).add(1, 'days').format('YYYY-MM-DD') : 
              event.end_date;
          
          // For same-day events, ensure end date is after start date
          if (event.start_date === event.end_date && event.is_all_day === 0) {
              endDate = moment(event.end_date)
                  .add(event.end_time === '00:00:00' ? 1 : 0, 'days')
                  .format('YYYY-MM-DD HH:mm:ss');
          }

          return {
            id: event.id,
            title: event.title,
            start: event.start_date,
            end: endDate,
            allDay: event.is_all_day === 1,
            backgroundColor: event.color,
            borderColor: event.color,
            extendedProps: {
              description: event.description,
              eventTypeId: event.event_type_id,
              color: event.color,
              isReminder: event.is_reminder,
              isAllDay: event.is_all_day,
              isRecurring: event.is_recurring,
              recurringType: event.recurring_type,
              recurringCount: event.recurring_count,
              externalParticipants: event.external_participants
            }
          };
        });
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
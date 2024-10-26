// Initialize handlers
$(function() {
  // Global events array
  let globalEvents = [];
  let globalEventTypes = [];

  initializeRecurringEventHandlers();
  initializeCounterInputs();
  // Initial binding of event handlers
  rebindEventHandlers();
  initializeValidationClearHandlers

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
  function upcoming_event_loader(status) {
    $('.upcoming-events-loader').removeClass('d-flex').addClass('d-none');
    $('.completed-events-loader').removeClass('d-flex').addClass('d-none');

    $(".upcomingEvents").removeClass("d-none");
    $(".completedEvents").removeClass("d-none");

    if(status === 'show') {
      $('.upcoming-events-loader').addClass('d-flex').removeClass('d-none');
      $('.completed-events-loader').addClass('d-flex').removeClass('d-none');
      $(".upcomingEvents").addClass("d-none");
      $(".completedEvents").addClass("d-none");
    }
  }

  // Date picker initialization
  $('#startDatePicker').datetimepicker({
      format: 'YYYY-MM-DD hh:mm A',
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
      format: 'YYYY-MM-DD hh:mm A',
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

  // Link start and end date pickers
  $("#startDatePicker").on("change.datetimepicker", function (e) {
      $('#endDatePicker').datetimepicker('minDate', e.date);
  });

  // Clear validation errors on input
  $('#eventTitle, #eventType, #eventStart, #eventEnd').on('input change', function() {
      const formGroup = $(this).closest('.form-group');
      formGroup.removeClass('has-error');
      formGroup.find('.error-message').remove();
      $(this).css('border-color', '');
  });

  // All Day checkbox handler
  $('#eventAllDay').change(function() {
      const isChecked = this.checked;
      
      if(isChecked) {
          $('#startDatePicker').datetimepicker('format', 'YYYY-MM-DD');
          $('#endDatePicker').datetimepicker('format', 'YYYY-MM-DD');
          
          const startDate = $('#startDatePicker').datetimepicker('date');
          const endDate = $('#endDatePicker').datetimepicker('date');
          
          if(startDate) {
              startDate.startOf('day');
              $('#startDatePicker').datetimepicker('date', startDate);
          }
          if(endDate) {
              endDate.endOf('day');
              $('#endDatePicker').datetimepicker('date', endDate);
          }
      } else {
          $('#startDatePicker').datetimepicker('format', 'YYYY-MM-DD hh:mm A');
          $('#endDatePicker').datetimepicker('format', 'YYYY-MM-DD hh:mm A');
          
          const startDate = $('#startDatePicker').datetimepicker('date');
          const endDate = $('#endDatePicker').datetimepicker('date');
          
          if(startDate) {
              startDate.set({ hour: 0, minute: 0 });
              $('#startDatePicker').datetimepicker('date', startDate);
          }
          if(endDate) {
              endDate.set({ hour: 23, minute: 59 });
              $('#endDatePicker').datetimepicker('date', endDate);
          }
      }
  });

  // Recurring event handlers
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

  // Counter controls
  function initializeCounterInputs() {
      const $input = $('#recurringCount');
      const min = parseInt($input.attr('min'));
      const max = parseInt($input.attr('max'));

      $('#decreaseCount').click(function() {
          let currentValue = parseInt($input.val());
          if (currentValue > min) {
              $input.val(--currentValue);
          }
      });

      $('#increaseCount').click(function() {
          let currentValue = parseInt($input.val());
          if (currentValue < max) {
              $input.val(++currentValue);
          }
      });
  }

  function createEventCards(events) {
    const upcomingEventsContainer = $('.upcomingEvents');
    const completedEventsContainer = $('.completedEvents');
    
    upcomingEventsContainer.empty();
    completedEventsContainer.empty();
    
    events.forEach(event => {
        const formattedStartDate = moment(event.start_date).format('MMM DD, YYYY hh:mm A');
        const formattedEndDate = moment(event.end_date).format('MMM DD, YYYY hh:mm A');
        const textColor = getContrastColor(event.color);
        
        const cardHtml = `
            <div class="card card-outline" style="border-color: ${event.color}">
                <div class="card-header" style="border-color: ${event.color};background-color: ${event.color}; color: ${textColor};">
                    <h5 class="card-title" style="font-weight: 500px;">${event.title}</h5>
                    <div class="card-tools">
                        <span class="badge" style="background-color: ${event.color}">#${event.reminder_id}</span>
                        ${!event.is_completed ? `
                            <button type="button" class="btn btn-tool complete-event" data-event-id="${event.id}" title="Mark as Complete">
                                <i class="fas fa-check"></i>
                            </button>
                            <button type="button" class="btn btn-tool edit-event" data-event-id="${event.id}">
                                <i class="fas fa-pen"></i>
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-tool delete-event" data-event-id="${event.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    ${event.description ? `<p class="mb-1">${event.description}</p>` : ''}
                    <div class="text-muted">
                        <small>
                            <i class="far fa-clock mr-1"></i>
                            ${event.is_all_day ? 
                                (moment(event.start_date).isSame(event.end_date, 'day') ?
                                    `All Day • ${moment(event.start_date).format('MMM D, YYYY')}`
                                    : 
                                    `All Day • ${moment(event.start_date).format('MMM D, YYYY')} - ${moment(event.end_date).format('MMM D, YYYY')}`)
                                : 
                                `${formattedStartDate} - ${formattedEndDate}`
                            }
                        </small>
                        ${event.is_reminder ? '<span class="ml-2"><i class="fas fa-bell text-warning"></i></span>' : ''}
                        ${event.is_recurring ? '<span class="ml-2"><i class="fas fa-sync-alt text-info"></i></span>' : ''}
                        <div class="mt-1">
                            <small>
                                <i class="fas fa-tag mr-1"></i>
                                ${getEventTypeName(event.event_type_id)}
                            </small>
                        </div>
                    </div>
                    ${event.external_participants ? `
                        <div class="mt-2">
                            <small class="text-muted">
                                <i class="fas fa-users mr-1"></i>
                                External Participants: ${event.external_participants}
                            </small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        if (event.is_completed) {
            completedEventsContainer.prepend(cardHtml);
        } else {
            upcomingEventsContainer.prepend(cardHtml);
        }
    });

    // Handle empty states
    if (upcomingEventsContainer.children().length === 0) {
        upcomingEventsContainer.html('<div class="text-center text-muted">No upcoming events</div>');
    }
    if (completedEventsContainer.children().length === 0) {
        completedEventsContainer.html('<div class="text-center text-muted">No completed events</div>');
    }

    // Rebind event handlers after creating cards
    rebindEventHandlers();
  }

  // Add event handler for edit icon
  $(document).on('click', '.event-card .edit-event', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const eventId = $(this).closest('.event-card').data('event-id');
    const event = globalEvents.find(e => e.id === eventId);
    
    if (event) {
        loadEventForEdit(event);
        // Scroll to form
        $('html, body').animate({
            scrollTop: $("#eventForm").offset().top - 100
        }, 500);
    }
  });

  // Get events from server and initialize
  function loadEvents() {
    $.ajax({
      url: base_url + "/get_events/",
      type: "GET",
      dataType: "json",
      beforeSend: () => upcoming_event_loader('show'),
      success: function(response) {
        upcoming_event_loader('hide');
        if (response.events && response.events.length > 0) {
            globalEvents = response.events;
            createEventCards(globalEvents);
        } else {
          $('.upcomingEvents').html('<div class="text-center text-muted">No upcoming events</div>');
          $('.completedEvents').html('<div class="text-center text-muted">No completed events</div>');
        }
      },
      error: function(xhr) {
        upcoming_event_loader('hide');
        $('.upcomingEvents, .completedEvents').html(
          '<div class="text-center text-danger">Error loading events</div>'
        );
        }
    });
  }
  
  // Modify loadEventForEdit function
  function loadEventForEdit(event) {
    // Add hidden input for event ID if not exists
    if (!$('#event_id').length) {
        $('#eventForm').append('<input type="hidden" id="event_id">');
    }
    
    // Set hidden event ID
    $('#event_id').val(event.id);
    
    // Populate form fields
    $('#eventTitle').val(event.title);
    $('#eventDescription').val(event.description || '');
    $('#externalParticipants').val(event.external_participants || '');
    $('#eventType').val(event.event_type_id);
    $('#eventReminder').prop('checked', event.is_reminder === 1);
    
    // Handle All Day checkbox and dates
    $('#eventAllDay').prop('checked', event.is_all_day === 1).trigger('change');
    
    // Set dates
    const startDate = moment(event.start_date);
    let endDate = moment(event.end_date);
    
    if (event.is_all_day === 1) {
        endDate = endDate.subtract(1, 'days');
    }
    
    $('#startDatePicker').datetimepicker('date', startDate);
    $('#endDatePicker').datetimepicker('date', endDate);
    
    // Handle recurring fields
    const isRecurring = event.is_recurring === 1;
    $('#eventRecurring').prop('checked', isRecurring).trigger('change');
    if(isRecurring) {
        $(`input[name="recurringType"][value="${event.recurring_type}"]`).prop('checked', true);
        $('#recurringCount').val(event.recurring_count);
    }
    
    // Switch to edit mode
    switchToEditMode();
  }

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

      // Adjust end date based on whether it's an all-day event
      let adjustedEndDate;
      if (isAllDay) {
          adjustedEndDate = moment(endDate).add(1, 'days');
      } else {
          adjustedEndDate = moment(endDate);
      }

      const formData = {
          title: $('#eventTitle').val(),
          description: $('#eventDescription').val(),
          external_participants: $('#externalParticipants').val(),
          event_type_id: $('#eventType').val(),
          start_date: startDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
          end_date: adjustedEndDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
          color: color,
          is_all_day: isAllDay,
          is_reminder: isReminder,
          is_recurring: isRecurring,
          recurring_type: isRecurring ? $('input[name="recurringType"]:checked').val() : null,
          recurring_count: isRecurring ? $('#recurringCount').val() : null
      };

      $.ajax({
          url: base_url + "/event/add",
          type: "POST",
          data: formData,
          dataType: "json",
          success: function(response) {
              if (response.success) {
                  const newEvent = {
                      id: response.event.id,
                      reminder_id: response.event.reminder_id,
                      ...formData
                  };
                  
                  // Add to global events array
                  globalEvents.push(newEvent);

                  createEventCards(globalEvents);


                  // Reset form
                  resetForm();
                  customAlert('Success', 'Event created successfully', 'green');
              }
          },
          error: handleAjaxError
      });
  });

  // Update Event
  $('#updateEvent').click(function(e) {
    e.preventDefault();
    
    if (!validateEventForm()) {
        return false;
    }

    const eventId = $('#event_id').val();
    const isAllDay = $('#eventAllDay').is(':checked') ? 1 : 0;
    const isReminder = $('#eventReminder').is(':checked') ? 1 : 0;
    const isRecurring = $('#eventRecurring').is(':checked') ? 1 : 0;
    const startDate = $('#startDatePicker').datetimepicker('date');
    const endDate = $('#endDatePicker').datetimepicker('date');
    const color = $('#eventType :selected').data('color');

    let adjustedEndDate;
    if (isAllDay) {
        adjustedEndDate = moment(endDate).add(1, 'days');
    } else {
        adjustedEndDate = moment(endDate);
    }

    const formData = {
        id: eventId,
        title: $('#eventTitle').val(),
        description: $('#eventDescription').val(),
        external_participants: $('#externalParticipants').val(),
        event_type_id: $('#eventType').val(),
        start_date: startDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
        end_date: adjustedEndDate.format(isAllDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
        color: color,
        is_all_day: isAllDay,
        is_reminder: isReminder,
        is_recurring: isRecurring,
        recurring_type: isRecurring ? $('input[name="recurringType"]:checked').val() : null,
        recurring_count: isRecurring ? $('#recurringCount').val() : null
    };

    $.ajax({
        url: base_url + "/event/update/" + eventId,
        type: "PUT",
        data: formData,
        dataType: "json",
        success: function(response) {
            if (response.success) {
                // Update the global events array properly
                const index = globalEvents.findIndex(event => event.id === parseInt(eventId));
                if (index !== -1) {
                    // Preserve the existing event object structure
                    globalEvents[index] = {
                        ...globalEvents[index],  // Keep existing properties
                        ...formData,            // Update with new data
                        id: parseInt(eventId)    // Ensure ID is an integer
                    };
                }
                
                // Refresh event cards
                createEventCards(globalEvents);
                
                // Reset form and switch to create mode
                resetForm();
                switchToCreateMode();
                customAlert('Success', 'Event updated successfully', 'green');
                
                // Force reload of event handlers
                rebindEventHandlers();
            }
        },
        error: handleAjaxError
    });
  });

  
  // Add this new function to rebind event handlers
  function rebindEventHandlers() {
    // Remove existing handlers
    $(document).off('click', '.edit-event');
    $(document).off('click', '.complete-event');
    $(document).off('click', '.delete-event');
    
    
    // Rebind edit event handler
    $(document).on('click', '.edit-event', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const eventId = $(this).data('event-id');
        
        const event = globalEvents.find(e => e.id === parseInt(eventId));
        
        if (event) {
            loadEventForEdit(event);
            // Scroll to form
            $('html, body').animate({
                scrollTop: $("#eventForm").offset().top - 100
            }, 500);
        }
    });
    // Rebind complete event handler
    $(document).on('click', '.complete-event', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const eventId = $(this).data('event-id');
        completeConfirm(eventId);
    });

    // Rebind delete event handler
    $(document).on('click', '.delete-event', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const eventId = $(this).data('event-id');
        deleteConfirm(eventId);
    });
  }

  // Add cancel button handler
  $('#cancelEdit').click(function() {
    resetForm();
    switchToCreateMode();
  });

  // Delete Event
  $('#deleteEvent').click(function() {
    const eventId = $('#event_id').val();
    deleteConfirm(eventId);
  });

  function deleteConfirm(eventId) {
    if(eventId) {
      $.confirm({
          title: 'Delete Event',
          content: 'Are you sure you want to delete this event?',
          type: 'red',
          typeAnimated: true,
          buttons: {
              yes: {
                  text: 'Yes',
                  btnClass: 'btn-danger',
                  action: function() {
                      deleteEvent(eventId);
                  }
              },
              no: {
                  text: 'No',
                  btnClass: 'btn-secondary'
              }
          }
      });
    }
  }

  function deleteEvent(eventId) {
      $.ajax({
          url: base_url + "/event/delete/" + eventId,
          type: "DELETE",
          dataType: "json",
          success: function(response) {
              if (response.success) {
                // Remove from global events array
                globalEvents = globalEvents.filter(event => event.id !== parseInt(eventId));
                
                // Always refresh the event cards
                if(globalEvents.length > 0) {
                  createEventCards(globalEvents);
                } else {
                  $('.upcomingEvents').html('<div class="text-center text-muted">No upcoming events</div>');
                }

                resetForm();
                switchToCreateMode();
                customAlert('Success', 'Event deleted successfully', 'green');                  
              }
          },
          error: function(xhr) {
              customAlert('Error', xhr.responseJSON?.message || 'Failed to delete event', 'red');
          }
      });
  }


  // Add confirmation dialog for completion
  function completeConfirm(eventId) {
    if(eventId) {
        $.confirm({
            title: 'Complete Event',
            content: 'Are you sure you want to mark this event as completed?',
            type: 'blue',
            typeAnimated: true,
            buttons: {
                yes: {
                    text: 'Yes',
                    btnClass: 'btn-blue',
                    action: function() {
                        markEventAsComplete(eventId);
                    }
                },
                no: {
                    text: 'No',
                    btnClass: 'btn-secondary'
                }
            }
        });
    }
  }

  // Function to handle the completion AJAX request
  function markEventAsComplete(eventId) {
    $.ajax({
        url: base_url + "/event/complete/" + eventId,
        type: "PUT",
        dataType: "json",
        success: function(response) {
            if (response.success) {
                // Update the event in global events array
                const eventIndex = globalEvents.findIndex(event => event.id === parseInt(eventId));
                if (eventIndex !== -1) {
                    globalEvents[eventIndex] = {
                        ...globalEvents[eventIndex],
                        is_completed: 1
                    };
                }
                
                // Refresh all cards
                createEventCards(globalEvents);
                customAlert('Success', 'Event marked as completed', 'green');
            }
        },
        error: function(xhr) {
            customAlert('Error', xhr.responseJSON?.message || 'Failed to complete event', 'red');
        }
    });
  }



  function resetForm() {
      // Clear form fields
      $('#event_id').val('');
      $('#eventTitle').val('');
      $('#eventDescription').val('');
      $('#externalParticipants').val('');
      $('#eventAllDay').prop("checked", false).trigger('change');
      $('#eventRecurring').prop("checked", false).trigger('change');
      $('#eventReminder').prop("checked", false);
      $('#eventType').val($('#eventType option:first').val());
      
      // Reset dates
      const now = moment();
      $('#startDatePicker').datetimepicker('date', now);
      $('#endDatePicker').datetimepicker('date', now.add(1, 'hour'));
      
      // Clear validation states
      $('.form-group').removeClass('has-error');
      $('.error-message').remove();
      $('input, select').css('border-color', '');
  }

  function switchToCreateMode() {
    $('#createEvent').show();
    $('#updateEvent, #deleteEvent, #cancelEdit').hide();
  }

  function switchToEditMode() {
    $('#createEvent').hide();
    $('#updateEvent, #deleteEvent, #cancelEdit').show();
  }


  // Initialize
  loadEvents();
  switchToCreateMode();

  $.ajax({
      url: base_url + "/event_types/",
      type: "GET",
      dataType: "json",
      beforeSend: () => event_loader('show'),
      success: function(data) {
        event_loader('hide');
        if(data.event_types.length > 0) {
          globalEventTypes = data.event_types;
          data.event_types.forEach(element => {

            $('.event-type-list').append(
              `<li> ${element.id} - ${element.title} </li>`
            );
            
            $('#eventType').append(
              `<option value="${element.id}" 
              data-color="${element.color}" 
              style="font-weight: bold; color: ${element.color}">
              ${element.title}
              </option>`
            );
          });

          createEventCards(globalEvents);
        } else {
          $('#external-events').html(
            '<div class="alert alert-danger" role="alert">No Event Types Found</div>'
          );
        }
      },
      error: () => event_loader('hide')
  });
  function getEventTypeName(eventTypeId) {
    // First try to get from globalEventTypes array
    const eventType = globalEventTypes.find(type => type.id === eventTypeId);
    if (eventType) {
        return eventType.title;
    }
    
    // If not found in array, try to get from select dropdown
    const optionText = $(`#eventType option[value="${eventTypeId}"]`).text();
    if (optionText) {
        return optionText;
    }
    
    // If nothing found, return Unknown Type
    return 'Unknown Type';
  }


});
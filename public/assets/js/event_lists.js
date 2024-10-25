// Initialize handlers
$(function() {
  // Global events array
  let globalEvents = [];

  initializeRecurringEventHandlers();
  initializeCounterInputs();

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

  // Form validation
  function validateEventForm() {
      let isValid = true;
      const requiredFields = {
          'eventTitle': 'Event Title',
          'eventType': 'Event Type',
          'eventStart': 'Start Time',
          'eventEnd': 'End Time'
      };

      const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$/;
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

      // Reset previous validation states
      $('.form-group').removeClass('has-error');
      $('.error-message').remove();

      Object.keys(requiredFields).forEach(fieldId => {
          const field = $(`#${fieldId}`);
          const value = field.val().trim();
          
          if (!value) {
              isValid = false;
              const formGroup = field.closest('.form-group');
              formGroup.addClass('has-error');
              
              if (formGroup.find('.error-message').length === 0) {
                  formGroup.append(`<div class="error-message text-danger mt-1"><small>${requiredFields[fieldId]} is required</small></div>`);
              }
              
              field.css('border-color', '#dc3545');
          } else if (fieldId === 'eventStart' || fieldId === 'eventEnd') {
              const isAllDay = $('#eventAllDay').is(':checked');
              const isValidFormat = isAllDay ? 
                  dateOnlyRegex.test(value) : 
                  dateTimeRegex.test(value);

              if (!isValidFormat) {
                  isValid = false;
                  const formGroup = field.closest('.form-group');
                  formGroup.addClass('has-error');
                  const expectedFormat = isAllDay ? 
                      'YYYY-MM-DD' : 
                      'YYYY-MM-DD HH:MM AM/PM';
                  formGroup.append(`<div class="error-message text-danger mt-1"><small>Invalid date format. Expected format: ${expectedFormat}</small></div>`);
                  field.css('border-color', '#dc3545');
              }
          } else {
              field.css('border-color', '');
          }
      });

      return isValid;
  }

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
    upcomingEventsContainer.empty(); // Clear existing cards

    
    events.forEach(event => {
        const formattedStartDate = moment(event.start_date).format('MMM DD, YYYY hh:mm A');
        const formattedEndDate = moment(event.end_date).format('MMM DD, YYYY hh:mm A');

        const textColor = getContrastColor(event.color);
        
        
        const cardHtml = `
            <div class="card card-outline" style="border-color: ${event.color}">
                <div class="card-header" style="border-color: ${event.color};background-color: ${event.color}; color: ${textColor};">
                    <h5 class="card-title" style="font-weight: 500px;">${event.title}</h5>
                    <div class="card-tools">
                        <span class="badge" style="background-color: ${event.color}">#${event.id}</span>
                        <a href="#" class="btn btn-tool">
                            <i class="fas fa-pen"></i>
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    ${event.description ? `<p class="mb-1">${event.description}</p>` : ''}
                    <div class="text-muted">
                        <small>
                            <i class="far fa-clock mr-1"></i>
                            ${event.is_all_day ? 'All Day' : `${formattedStartDate} - ${formattedEndDate}`}
                        </small>
                        ${event.is_reminder ? '<span class="ml-2"><i class="fas fa-bell text-warning"></i></span>' : ''}
                        ${event.is_recurring ? '<span class="ml-2"><i class="fas fa-sync-alt text-info"></i></span>' : ''}
                    </div>
                </div>
            </div>
        `;
        upcomingEventsContainer.prepend(cardHtml);
    });
}


  // Get events from server and initialize
  function loadEvents() {
    $.ajax({
        url: base_url + "/get_events/",
        type: "GET",
        dataType: "json",
        success: function(response) {
          if (response.events && response.events.length > 0) {
              globalEvents = response.events;
              createEventCards(globalEvents);
          } else {
            $('.upcomingEvents').html('<div class="text-center text-muted">No upcoming events</div>');
          }
        },
        error: function(xhr) {
            // customAlert('Error', 'Failed to load events', 'red');
            $('.upcomingEvents').html('<div class="text-center text-danger">Error loading events</div>');
        }
    });
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
          error: function(xhr) {
              customAlert('Error', xhr.responseJSON?.message || 'Failed to create event', 'red');
          }
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

      // Adjust end date based on whether it's an all-day event
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
                  // Update in global events array
                  const index = globalEvents.findIndex(event => event.id === eventId);
                  if (index !== -1) {
                      globalEvents[index] = formData;
                  }

                  console.log(globalEvents);
                  
                  // Reset form and switch to create mode
                  resetForm();
                  switchToCreateMode();
                  customAlert('Success', 'Event updated successfully', 'green');
              }
          },
          error: function(xhr) {
              customAlert('Error', xhr.responseJSON?.message || 'Failed to update event', 'red');
          }
      });
  });

  // Delete Event
  $('#deleteEvent').click(function() {
      const eventId = $('#event_id').val();
      
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
  });

  function deleteEvent(eventId) {
      $.ajax({
          url: base_url + "/event/delete/" + eventId,
          type: "DELETE",
          dataType: "json",
          success: function(response) {
              if (response.success) {
                  // Remove from global events array
                  globalEvents = globalEvents.filter(event => event.id !== eventId);
                  
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


  function resetForm() {
      // Clear form fields
      $('#event_id').val('');
      $('#eventTitle').val('');
      $('#eventDescription').val('');
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
      $('#updateEvent, #deleteEvent').hide();
  }

  function switchToEditMode() {
      $('#createEvent').hide();
      $('#updateEvent, #deleteEvent').show();
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
          data.event_types.forEach(element => {
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

});
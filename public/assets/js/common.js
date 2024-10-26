function overlay(o){"show"==o?$(".overlay").show():$(".overlay").hide()}

$(document).off("input keypress paste",".alphaNum"),$(document).on("input keypress paste",".alphaNum",function(a){var e=$(this).val();e=(e=e.replace(/\s+/g,"")).replace(/[^a-zA-Z0-9 ]/g,""),$(this).val(e)});


function __wordConv(r,e){if("uc"==e)return r.toUpperCase();if("lc"==e)return r.toLowerCase();if("ucf"==e){for(var t=r.toLowerCase().split(" "),o=0;o<t.length;o++)t[o]=t[o].charAt(0).toUpperCase()+t[o].substring(1);return t.join(" ")}if("lcf"==e){for(t=r.toLowerCase().split(" "),o=0;o<t.length;o++)t[o]=t[o].charAt(0).toLowerCase()+t[o].substring(1);return t.join(" ")}return"ucfl"==e?r.charAt(0).toUpperCase()+r.slice(1):r}

$(document).off("input keypress paste", ".capital-form");
$(document).on("input keypress paste", ".capital-form", function(event) {var inputVal = $(this).val(); var convertedWord = __wordConv(inputVal,'uc'); $(this).val(convertedWord); });

$(document).off("input keypress paste", ".uccapital-form");
$(document).on("input keypress paste", ".uccapital-form", function(event) {var inputVal = $(this).val(); var convertedWord = __wordConv(inputVal,'ucf'); $(this).val(convertedWord); });

$(document).off("input keypress paste", ".lowercase-form");
$(document).on("input keypress paste", ".lowercase-form", function(event) {var inputVal = $(this).val(); var convertedWord = __wordConv(inputVal,'lc'); $(this).val(convertedWord);
});

$(document).off("input keypress paste", ".lclowercase-form");
$(document).on("input keypress paste", ".lclowercase-form", function(event) {var inputVal = $(this).val(); var convertedWord = __wordConv(inputVal,'lcf'); $(this).val(convertedWord); });

$(document).off("input keypress paste", ".uccapitalfirst-form");
$(document).on("input keypress paste", ".uccapitalfirst-form", function(event) {var inputVal = $(this).val(); var convertedWord = __wordConv(inputVal,'ucfl'); $(this).val(convertedWord); });

$(document).off("keypress",".intNumber"),$(document).on("keypress",".intNumber",function(e){var n=e.keyCode||e.which;(n<48||n>58)&&(n<2534||n>2543)&&8!=n&&37!=n&&39!=n&&9!=n&&e.preventDefault()});

function customAlert(title,msg,type) {$.alert({buttons: {Ok: {text: 'Ok'} }, title:title, content:msg, closeIcon:true, type:type, typeAnimated: true, backgroundDismiss: false, backgroundDismissAnimation: 'glow' }); }

function cancel(controller) {var msg = "Do you want to cancel ? "; var msgContent = "If cancelled then all modified data will be lost. "; /* var r = confirm(msg); if (r == true) {//history.back(); window.open(base_url+controller, '_self'); }*/ $.confirm({title: msg, content: msgContent, type : 'red', buttons: {Yes: function () {window.open(base_url+controller, '_self'); }, No: function () {} } }); }

function back(backModuleUrl) {var msg = "Do you want to back ? "; var msgContent = "If you go back then all modified data will be lost. "; $.confirm({title: msg, content: msgContent, type: 'red', typeAnimated: true, backgroundDismiss: false, backgroundDismissAnimation: 'glow', buttons: {Yes: {text: 'Yes', btnClass: 'btn-red', action: function(){$(location).attr('href', backModuleUrl); } }, No: {text: 'No'} } }); }

function customConfirm(title,msg,type,url) {$.confirm({title:title, content:msg, type:type, typeAnimated: true, backgroundDismiss: false, backgroundDismissAnimation: 'glow', buttons: {Yes: {text: 'Yes', btnClass: 'btn-red', action: function(){$(location).attr('href', url); } }, No: {text: 'No'} } }); }

$('.datePicker').datepicker({dateFormat: 'dd-mm-yy', changeYear: true, changeMonth: true });
// add multiple correction input field dynamically


// Function to determine if text should be white or black based on background color
function getContrastColor(color) {
  // Check if color is null, undefined or empty
  if (!color) {
      console.warn('Invalid color value provided:', color);
      return 'black'; // Default return value
  }

  // Function to convert RGB to array of values
  function getRGBFromString(rgb) {
      const matches = rgb.match(/\d+/g);
      return matches ? matches.map(Number) : [0, 0, 0];
  }

  // Function to convert Hex to RGB array
  function hexToRGB(hex) {
      hex = hex.replace('#', '');
      
      // Handle shorthand hex (#fff)
      if (hex.length === 3) {
          hex = hex.split('').map(char => char + char).join('');
      }
      
      // Verify if hex is valid
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
          console.warn('Invalid hex color:', hex);
          return [0, 0, 0];
      }
      
      return [
          parseInt(hex.substr(0, 2), 16),
          parseInt(hex.substr(2, 2), 16),
          parseInt(hex.substr(4, 2), 16)
      ];
  }

  try {
      let r, g, b;

      // Check if color is RGB/RGBA
      if (color.startsWith('rgb')) {
          [r, g, b] = getRGBFromString(color);
      }
      // Check if color is Hex
      else if (color.startsWith('#')) {
          [r, g, b] = hexToRGB(color);
      }
      // Handle named colors by creating a temporary element
      else {
          const tempElement = document.createElement('div');
          tempElement.style.color = color;
          document.body.appendChild(tempElement);
          const computedColor = window.getComputedStyle(tempElement).color;
          document.body.removeChild(tempElement);
          [r, g, b] = getRGBFromString(computedColor);
      }

      // Calculate relative luminance using YIQ formula
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      // Return black or white based on luminance threshold
      return (yiq >= 128) ? 'black' : 'white';
  } catch (error) {
      console.warn('Error processing color:', color, error);
      return 'black'; // Default return value
  }
}

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
      if (!field.length) {
          console.error(`Field with id '${fieldId}' not found`);
          isValid = false;
          return;
      }

      // Safely get the value and handle null/undefined cases
      const value = field.val();
      const trimmedValue = (value || '').trim();
      
      if (!trimmedValue) {
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
              dateOnlyRegex.test(trimmedValue) : 
              dateTimeRegex.test(trimmedValue);

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
          // Reset styling if field is valid
          field.css('border-color', '');
      }
  });

  // Additional validation for event type select
  const eventTypeSelect = $('#eventType');
  if (!eventTypeSelect.val()) {
      isValid = false;
      const formGroup = eventTypeSelect.closest('.form-group');
      formGroup.addClass('has-error');
      if (formGroup.find('.error-message').length === 0) {
          formGroup.append('<div class="error-message text-danger mt-1"><small>Please select an event type</small></div>');
      }
      eventTypeSelect.css('border-color', '#dc3545');
  }

  return isValid;
}

// Map backend field names to frontend field IDs
const fieldMapping = {
  'title': 'eventTitle',
  'description': 'eventDescription',
  'start_date': 'eventStart',
  'start_time': 'eventStart',
  'end_date': 'eventEnd',
  'end_time': 'eventEnd',
  'event_type_id': 'eventType',
  'is_all_day': 'eventAllDay',
  'is_reminder': 'eventReminder',
  'is_recurring': 'eventRecurring',
  'recurring_type': 'recurringType',
  'recurring_count': 'recurringCount',
  'external_participants': 'externalParticipants'
};

// Display validation errors function
function displayValidationErrors(errors) {
  // Clear previous validation states
  $('.form-group').removeClass('has-error');
  $('.error-message').remove();
  $('input, select, textarea').css('border-color', '');

  // Display each error
  Object.entries(errors).forEach(([field, messages]) => {
      const frontendFieldId = fieldMapping[field] || field;
      let element = $(`#${frontendFieldId}`);

      // Special handling for radio buttons
      if (field === 'recurring_type') {
          element = $('input[name="recurringType"]');
      }
      
      if (element.length) {
          const formGroup = element.closest('.form-group');
          formGroup.addClass('has-error');
          
          // Add red border to the input/select
          if (field === 'recurring_type') {
              // For radio buttons, add border to the container
              $('.btn-group-toggle').css('border', '1px solid #dc3545');
          } else {
              element.css('border-color', '#dc3545');
          }

          // Add error messages
          messages.forEach(message => {
              if (formGroup.find('.error-message').length === 0) {
                  // Special handling for date/time fields
                  if ((field === 'start_time' || field === 'end_time') && 
                      formGroup.find('.error-message').length === 0) {
                      formGroup.append(`<div class="error-message text-danger mt-1"><small>${message}</small></div>`);
                  }
                  // Normal error message display
                  else if (field !== 'start_time' && field !== 'end_time') {
                      formGroup.append(`<div class="error-message text-danger mt-1"><small>${message}</small></div>`);
                  }
              }
          });
      }
  });
}

// Clear validation errors when input changes
function initializeValidationClearHandlers() {
  // Clear validation for regular inputs, selects, and textareas
  $('input:not([type="radio"]), select, textarea').on('input change', function() {
      const formGroup = $(this).closest('.form-group');
      formGroup.removeClass('has-error');
      formGroup.find('.error-message').remove();
      $(this).css('border-color', '');
  });

  // Clear validation for radio buttons
  $('input[type="radio"]').on('change', function() {
      const formGroup = $(this).closest('.form-group');
      formGroup.removeClass('has-error');
      formGroup.find('.error-message').remove();
      $('.btn-group-toggle').css('border', '');
  });

  // Clear validation for date/time pickers
  $('#startDatePicker, #endDatePicker').on('change.datetimepicker', function() {
      const formGroup = $(this).closest('.form-group');
      formGroup.removeClass('has-error');
      formGroup.find('.error-message').remove();
      $(this).find('input').css('border-color', '');
  });

  // Clear validation for checkboxes
  $('input[type="checkbox"]').on('change', function() {
      const formGroup = $(this).closest('.form-group');
      formGroup.removeClass('has-error');
      formGroup.find('.error-message').remove();
  });
}

// Modified AJAX error handling
function handleAjaxError(xhr) {
  if (xhr.status === 422 && xhr.responseJSON) {
      // Handle validation errors
      displayValidationErrors(xhr.responseJSON.errors);
      
      // Show general error message if provided
      if (xhr.responseJSON.message) {
          customAlert('Validation Error', xhr.responseJSON.message, 'red');
      }
  } else {
      // Handle other errors
      customAlert('Error', xhr.responseJSON?.message || 'An error occurred while processing your request', 'red');
  }
}
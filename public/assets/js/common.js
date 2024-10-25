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
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
function getContrastColor(hexcolor) {
    // Remove the # if present
    hexcolor = hexcolor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    
    // Calculate brightness (using relative luminance)
    // Using YIQ formula: https://24ways.org/2010/calculating-color-contrast/
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return black or white based on brightness
    return (yiq >= 128) ? 'black' : 'white';
}
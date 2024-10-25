@component('mail::message')
# Hello {{ $recipientName }},

You have been invited to the following event:

**{{ $event->title }}**

**Date:** {{ \Carbon\Carbon::parse($event->start_date)->format('M d, Y') }}  
**Time:** {{ $event->is_all_day ? 'All Day' : \Carbon\Carbon::parse($event->start_time)->format('g:i A') }}

@if($event->description)
**Description:**  
{{ $event->description }}
@endif

Thank you,  
{{ config('app.name') }}
@endcomponent
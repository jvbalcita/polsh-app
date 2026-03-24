@component('mail::message')
# Your request has been updated — {{ $ticket->reference() }}

**Subject:** {{ $ticket->subject }}
**New Status:** {{ $ticket->status->label() }}

@if($ticket->user_id)
@component('mail::button', ['url' => url('/support/tickets/' . $ticket->id)])
View Your Request
@endcomponent
@endif

Thanks,
**Polsh Support**
@endcomponent

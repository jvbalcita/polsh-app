@component('mail::message')
# We received your request — {{ $ticket->reference() }}

**Type:** {{ $ticket->type->label() }}
**Subject:** {{ $ticket->subject }}

{{ $ticket->description }}

@if(!$isAdmin && $ticket->user_id)
@component('mail::button', ['url' => url('/support/tickets/' . $ticket->id)])
View Your Request
@endcomponent
@endif

We'll get back to you as soon as possible.

Thanks,
**Polsh Support**
@endcomponent

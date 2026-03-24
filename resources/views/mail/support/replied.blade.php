@component('mail::message')
# New reply on your request — {{ $ticket->reference() }}

**Subject:** {{ $ticket->subject }}

---

{{ $reply->message }}

---

@if($ticket->user_id)
@component('mail::button', ['url' => url('/support/tickets/' . $ticket->id)])
View & Reply
@endcomponent
@endif

Thanks,
**Polsh Support**
@endcomponent

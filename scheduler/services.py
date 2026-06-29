import logging
from django.core.cache import cache
from .models import Interviewer, AvailabilitySlot, InterviewRequest, ScheduledInterview

logger = logging.getLogger(__name__)
QUEUE_KEY = 'interview_waiting_queue'


def add_to_queue(request_id):
    queue = cache.get(QUEUE_KEY, [])
    if str(request_id) not in queue:
        queue.append(str(request_id))
        cache.set(QUEUE_KEY, queue, timeout=None)


def get_queue():
    return cache.get(QUEUE_KEY, [])


def remove_from_queue(request_id):
    queue = cache.get(QUEUE_KEY, [])
    queue = [r for r in queue if r != str(request_id)]
    cache.set(QUEUE_KEY, queue, timeout=None)


def has_conflict(interviewer, start_time, end_time, exclude_slot_id=None):
    slots = AvailabilitySlot.objects.filter(
        interviewer=interviewer,
        is_booked=True,
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    if exclude_slot_id:
        slots = slots.exclude(id=exclude_slot_id)
    return slots.exists()


def find_available_interviewer(request):
    required = set(request.required_skills) if request.required_skills else set()
    all_interviewers = list(Interviewer.objects.filter(is_active=True))
    logger.info("Total active interviewers: %d", len(all_interviewers))

    if not all_interviewers:
        logger.info("No active interviewers found.")
        return None, None

    if required:
        candidates = [
            iv for iv in all_interviewers
            if required.intersection(set(iv.expertise or []))
        ]
        if not candidates:
            candidates = all_interviewers
    else:
        candidates = all_interviewers

    logger.info("Candidates count: %d", len(candidates))

    for interviewer in candidates:
        all_slots = AvailabilitySlot.objects.filter(
            interviewer=interviewer,
            is_booked=False,
        )
        logger.info(
            "Interviewer %s has %d free slots",
            interviewer.name,
            all_slots.count()
        )

        for slot in all_slots:
            logger.info(
                "Checking slot %d: %s to %s",
                slot.id,
                slot.start_time,
                slot.end_time
            )
            in_window = (
                slot.start_time >= request.preferred_start
                and slot.end_time <= request.preferred_end
            )
            if in_window:
                if not has_conflict(interviewer, slot.start_time, slot.end_time):
                    logger.info("Matched slot %d for %s", slot.id, interviewer.name)
                    return interviewer, slot
                else:
                    logger.info("Conflict on slot %d", slot.id)
            else:
                logger.info("Slot %d outside window", slot.id)

    logger.info("No available interviewer found.")
    return None, None


def schedule_interview(request):
    from .notifications import send_scheduling_notification

    logger.info("Scheduling request %s | status: %s", request.id, request.status)

    if request.status == 'SCHEDULED':
        logger.info("Already scheduled, skipping.")
        return None

    interviewer, slot = find_available_interviewer(request)

    if not interviewer:
        request.status = 'QUEUED'
        request.save()
        add_to_queue(str(request.id))
        logger.info("No interviewer — request %s queued.", request.id)
        return None

    slot.is_booked = True
    slot.save()

    interview = ScheduledInterview.objects.create(
        request=request,
        interviewer=interviewer,
        slot=slot,
        google_event_id='',
        google_calendar_link='',
    )

    request.status = 'SCHEDULED'
    request.save()

    try:
        send_scheduling_notification(interview)
    except Exception as e:
        logger.error("Notification error: %s", e)

    logger.info(
        "Interview scheduled! ID: %s | Interviewer: %s",
        interview.id,
        interviewer.name
    )
    return interview


def reschedule_interview(request, new_start, new_end):
    from .notifications import send_reschedule_notification

    try:
        existing = request.scheduled
    except ScheduledInterview.DoesNotExist:
        return schedule_interview(request)

    old_slot = existing.slot

    new_slot = AvailabilitySlot.objects.filter(
        interviewer=existing.interviewer,
        is_booked=False,
        start_time=new_start,
        end_time=new_end,
    ).first()

    if not new_slot:
        raise ValueError("No available slot at the requested time.")

    if has_conflict(
        existing.interviewer,
        new_start,
        new_end,
        exclude_slot_id=old_slot.id
    ):
        raise ValueError("Conflict detected for the new time slot.")

    old_slot.is_booked = False
    old_slot.save()
    new_slot.is_booked = True
    new_slot.save()

    existing.rescheduled_from = old_slot.start_time
    existing.slot = new_slot
    existing.save()

    request.status = 'RESCHEDULED'
    request.preferred_start = new_start
    request.preferred_end = new_end
    request.save()

    try:
        send_reschedule_notification(existing)
    except Exception as e:
        logger.error("Reschedule notification error: %s", e)

    return existing
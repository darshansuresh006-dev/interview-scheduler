import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def schedule_interview_task(self, request_id):
    from .models import InterviewRequest
    from .services import schedule_interview
    try:
        req = InterviewRequest.objects.get(id=request_id)
        result = schedule_interview(req)
        if result:
            logger.info("Task scheduled successfully: %s", request_id)
        else:
            logger.info("Task queued or skipped: %s", request_id)
    except InterviewRequest.DoesNotExist:
        logger.error("InterviewRequest not found: %s", request_id)
    except Exception as exc:
        logger.error("Error scheduling %s: %s", request_id, exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task
def process_waiting_queue():
    from .models import InterviewRequest
    from .services import get_queue, remove_from_queue, schedule_interview
    queue = get_queue()
    logger.info("Processing queue: %d items", len(queue))
    for request_id in list(queue):
        try:
            req = InterviewRequest.objects.get(id=request_id, status='QUEUED')
            result = schedule_interview(req)
            if result:
                remove_from_queue(request_id)
                logger.info("Queued request %s scheduled.", request_id)
        except InterviewRequest.DoesNotExist:
            remove_from_queue(request_id)
        except Exception as e:
            logger.error("Queue error for %s: %s", request_id, e)


@shared_task
def send_interview_reminders():
    from .models import ScheduledInterview
    from .notifications import send_reminder_notification
    tomorrow = timezone.now() + timedelta(hours=24)
    interviews = ScheduledInterview.objects.filter(
        slot__start_time__lte=tomorrow,
        slot__start_time__gte=timezone.now(),
        request__status__in=['SCHEDULED', 'RESCHEDULED'],
    )
    for interview in interviews:
        try:
            send_reminder_notification(interview)
        except Exception as e:
            logger.error("Reminder error: %s", e)
    logger.info("Reminders sent for %d interviews.", interviews.count())
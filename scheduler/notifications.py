import logging
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def _send_email(subject, message, recipient_email, interview_request):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info("Email sent to %s", recipient_email)

        try:
            from .models import Notification
            Notification.objects.create(
                interview_request=interview_request,
                notification_type='EMAIL',
                recipient_email=recipient_email,
                subject=subject,
                message=message,
                status='SENT',
                sent_at=timezone.now(),
            )
        except Exception as e:
            logger.error("Could not save notification record: %s", e)

    except Exception as e:
        logger.error("Email send failed to %s: %s", recipient_email, e)
        try:
            from .models import Notification
            Notification.objects.create(
                interview_request=interview_request,
                notification_type='EMAIL',
                recipient_email=recipient_email,
                subject=subject,
                message=message,
                status='FAILED',
            )
        except Exception as ne:
            logger.error("Could not save failed notification: %s", ne)


def send_scheduling_notification(interview):
    slot = interview.slot
    request = interview.request
    cal_link = interview.google_calendar_link or ''

    # Email to candidate
    _send_email(
        subject=f"Interview Scheduled - {request.position}",
        message=(
            f"Hi {request.candidate_name},\n\n"
            f"Your interview has been scheduled!\n\n"
            f"Position: {request.position}\n"
            f"Date: {slot.start_time.strftime('%B %d, %Y')}\n"
            f"Time: {slot.start_time.strftime('%H:%M')} - "
            f"{slot.end_time.strftime('%H:%M')} UTC\n"
            f"Interviewer: {interview.interviewer.name}\n"
            f"{('Calendar Link: ' + cal_link) if cal_link else ''}\n\n"
            f"Good luck!\n"
            f"Interview Scheduler Team"
        ),
        recipient_email=request.candidate_email,
        interview_request=request,
    )

    # Email to interviewer
    _send_email(
        subject=f"New Interview Assigned - {request.candidate_name}",
        message=(
            f"Hi {interview.interviewer.name},\n\n"
            f"A new interview has been assigned to you.\n\n"
            f"Candidate: {request.candidate_name}\n"
            f"Position: {request.position}\n"
            f"Date: {slot.start_time.strftime('%B %d, %Y')}\n"
            f"Time: {slot.start_time.strftime('%H:%M')} - "
            f"{slot.end_time.strftime('%H:%M')} UTC\n"
            f"{('Calendar Link: ' + cal_link) if cal_link else ''}\n\n"
            f"Interview Scheduler Team"
        ),
        recipient_email=interview.interviewer.email,
        interview_request=request,
    )


def send_reschedule_notification(interview):
    request = interview.request
    slot = interview.slot

    # Email to candidate
    _send_email(
        subject=f"Interview Rescheduled - {request.position}",
        message=(
            f"Hi {request.candidate_name},\n\n"
            f"Your interview has been rescheduled.\n\n"
            f"New Date: {slot.start_time.strftime('%B %d, %Y')}\n"
            f"New Time: {slot.start_time.strftime('%H:%M')} - "
            f"{slot.end_time.strftime('%H:%M')} UTC\n"
            f"Interviewer: {interview.interviewer.name}\n"
            f"Previously scheduled: {interview.rescheduled_from}\n\n"
            f"Interview Scheduler Team"
        ),
        recipient_email=request.candidate_email,
        interview_request=request,
    )

    # Email to interviewer
    _send_email(
        subject=f"Interview Rescheduled - {request.candidate_name}",
        message=(
            f"Hi {interview.interviewer.name},\n\n"
            f"An interview on your schedule has been rescheduled.\n\n"
            f"Candidate: {request.candidate_name}\n"
            f"Position: {request.position}\n"
            f"New Date: {slot.start_time.strftime('%B %d, %Y')}\n"
            f"New Time: {slot.start_time.strftime('%H:%M')} - "
            f"{slot.end_time.strftime('%H:%M')} UTC\n"
            f"Previously scheduled: {interview.rescheduled_from}\n\n"
            f"Interview Scheduler Team"
        ),
        recipient_email=interview.interviewer.email,
        interview_request=request,
    )


def send_reminder_notification(interview):
    request = interview.request
    slot = interview.slot

    # Reminder to candidate
    _send_email(
        subject="Interview Reminder - Tomorrow",
        message=(
            f"Hi {request.candidate_name},\n\n"
            f"This is a reminder that your interview is tomorrow!\n\n"
            f"Position: {request.position}\n"
            f"Time: {slot.start_time.strftime('%H:%M')} UTC\n"
            f"Interviewer: {interview.interviewer.name}\n\n"
            f"Good luck!\n"
            f"Interview Scheduler Team"
        ),
        recipient_email=request.candidate_email,
        interview_request=request,
    )

    # Reminder to interviewer
    _send_email(
        subject="Interview Reminder - Tomorrow",
        message=(
            f"Hi {interview.interviewer.name},\n\n"
            f"This is a reminder that you have an interview scheduled tomorrow.\n\n"
            f"Candidate: {request.candidate_name}\n"
            f"Position: {request.position}\n"
            f"Time: {slot.start_time.strftime('%H:%M')} UTC\n\n"
            f"Interview Scheduler Team"
        ),
        recipient_email=interview.interviewer.email,
        interview_request=request,
    )
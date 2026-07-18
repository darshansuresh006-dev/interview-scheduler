from django.db import models
from django.contrib.auth.models import User
import uuid


class Interviewer(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    expertise = models.JSONField(default=list)
    timezone = models.CharField(max_length=50, default='UTC')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class AvailabilitySlot(models.Model):
    interviewer = models.ForeignKey(
        Interviewer,
        on_delete=models.CASCADE,
        related_name='availability_slots'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.interviewer.name}: {self.start_time} - {self.end_time}"


class InterviewRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('QUEUED', 'Queued'),
        ('SCHEDULED', 'Scheduled'),
        ('RESCHEDULED', 'Rescheduled'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='interview_requests'
    )
    candidate_name = models.CharField(max_length=100)
    candidate_email = models.EmailField()
    position = models.CharField(max_length=100)
    required_skills = models.JSONField(default=list)
    preferred_start = models.DateTimeField()
    preferred_end = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.candidate_name} - {self.position} ({self.status})"


class ScheduledInterview(models.Model):
    request = models.OneToOneField(
        InterviewRequest,
        on_delete=models.CASCADE,
        related_name='scheduled'
    )
    interviewer = models.ForeignKey(
        Interviewer,
        on_delete=models.CASCADE,
        related_name='interviews'
    )
    slot = models.OneToOneField(
        AvailabilitySlot,
        on_delete=models.CASCADE,
        related_name='interview'
    )
    meeting_link = models.URLField(blank=True)
    google_event_id = models.CharField(max_length=255, blank=True)
    google_calendar_link = models.URLField(blank=True)
    scheduled_at = models.DateTimeField(auto_now_add=True)
    rescheduled_from = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.request.candidate_name} with {self.interviewer.name}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]

    interview_request = models.ForeignKey(
        InterviewRequest,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type} to {self.recipient_email}"
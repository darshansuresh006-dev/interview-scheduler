from django.contrib import admin
from .models import (
    Interviewer, AvailabilitySlot,
    InterviewRequest, ScheduledInterview, Notification
)

@admin.register(Interviewer)
class InterviewerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'timezone', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'email']

@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ['interviewer', 'start_time', 'end_time', 'is_booked']
    list_filter = ['is_booked']

@admin.register(InterviewRequest)
class InterviewRequestAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'position', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['candidate_name', 'candidate_email']

@admin.register(ScheduledInterview)
class ScheduledInterviewAdmin(admin.ModelAdmin):
    list_display = ['request', 'interviewer', 'scheduled_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient_email', 'notification_type', 'status', 'sent_at']
    list_filter = ['status', 'notification_type']

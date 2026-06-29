from rest_framework import serializers
from .models import (
    Interviewer, AvailabilitySlot,
    InterviewRequest, ScheduledInterview, Notification
)


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = '__all__'
        read_only_fields = ['is_booked', 'interviewer']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError(
                "start_time must be before end_time."
            )
        return data


class InterviewerSerializer(serializers.ModelSerializer):
    availability_slots = AvailabilitySlotSerializer(
        many=True, read_only=True
    )
    total_slots = serializers.SerializerMethodField()
    booked_slots = serializers.SerializerMethodField()

    class Meta:
        model = Interviewer
        fields = '__all__'

    def get_total_slots(self, obj):
        return obj.availability_slots.count()

    def get_booked_slots(self, obj):
        return obj.availability_slots.filter(is_booked=True).count()


class InterviewRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewRequest
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'updated_at']


class RescheduleSerializer(serializers.Serializer):
    new_start = serializers.DateTimeField()
    new_end = serializers.DateTimeField()


class ScheduledInterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(
        source='request.candidate_name', read_only=True
    )
    candidate_email = serializers.CharField(
        source='request.candidate_email', read_only=True
    )
    position = serializers.CharField(
        source='request.position', read_only=True
    )
    interviewer_name = serializers.CharField(
        source='interviewer.name', read_only=True
    )
    slot_start = serializers.DateTimeField(
        source='slot.start_time', read_only=True
    )
    slot_end = serializers.DateTimeField(
        source='slot.end_time', read_only=True
    )

    class Meta:
        model = ScheduledInterview
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class DashboardStatsSerializer(serializers.Serializer):
    total_requests = serializers.IntegerField()
    scheduled = serializers.IntegerField()
    pending = serializers.IntegerField()
    queued = serializers.IntegerField()
    total_interviewers = serializers.IntegerField()
    queue_length = serializers.IntegerField()
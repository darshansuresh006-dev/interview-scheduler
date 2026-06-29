from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Interviewer, AvailabilitySlot,
    InterviewRequest, ScheduledInterview,
)
from .serializers import (
    InterviewerSerializer, AvailabilitySlotSerializer,
    InterviewRequestSerializer, ScheduledInterviewSerializer,
    RescheduleSerializer,
)
from .services import schedule_interview, reschedule_interview, get_queue
from .tasks import schedule_interview_task


class InterviewerViewSet(viewsets.ModelViewSet):
    queryset = Interviewer.objects.filter(is_active=True)
    serializer_class = InterviewerSerializer

    @action(detail=True, methods=['post'], url_path='add-slot')
    def add_slot(self, request, pk=None):
        interviewer = self.get_object()
        serializer = AvailabilitySlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(interviewer=interviewer)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['get'], url_path='availability')
    def availability(self, request, pk=None):
        interviewer = self.get_object()
        slots = interviewer.availability_slots.filter(is_booked=False)
        return Response(
            AvailabilitySlotSerializer(slots, many=True).data
        )


class InterviewRequestViewSet(viewsets.ModelViewSet):
    queryset = InterviewRequest.objects.all().order_by('-created_at')
    serializer_class = InterviewRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        interview_request = serializer.save()
        schedule_interview_task.delay(str(interview_request.id))
        return Response(
            {
                'message': 'Interview request created.',
                'request_id': str(interview_request.id),
                'status': interview_request.status,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='reschedule')
    def reschedule(self, request, pk=None):
        interview_request = self.get_object()
        serializer = RescheduleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            interview = reschedule_interview(
                interview_request,
                serializer.validated_data['new_start'],
                serializer.validated_data['new_end'],
            )
            return Response(
                ScheduledInterviewSerializer(interview).data
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'], url_path='status')
    def get_status(self, request, pk=None):
        obj = self.get_object()
        data = self.get_serializer(obj).data
        if obj.status == 'SCHEDULED':
            try:
                data['scheduled_interview'] = \
                    ScheduledInterviewSerializer(obj.scheduled).data
            except Exception:
                pass
        return Response(data)

    @action(detail=False, methods=['get'], url_path='queue')
    def queue_status(self, request):
        queue = get_queue()
        return Response({
            'queue_length': len(queue),
            'queued_ids': queue,
        })

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        try:
            queue = get_queue()
            recent = ScheduledInterview.objects.select_related(
                'request', 'interviewer', 'slot'
            ).order_by('-scheduled_at')[:5]

            stats = {
                'total_requests': InterviewRequest.objects.count(),
                'scheduled': InterviewRequest.objects.filter(
                    status='SCHEDULED'
                ).count(),
                'pending': InterviewRequest.objects.filter(
                    status='PENDING'
                ).count(),
                'queued': InterviewRequest.objects.filter(
                    status='QUEUED'
                ).count(),
                'rescheduled': InterviewRequest.objects.filter(
                    status='RESCHEDULED'
                ).count(),
                'total_interviewers': Interviewer.objects.filter(
                    is_active=True
                ).count(),
                'queue_length': len(queue),
                'recent_scheduled': ScheduledInterviewSerializer(
                    recent, many=True
                ).data,
            }
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 

class ScheduledInterviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScheduledInterview.objects.all().select_related(
        'request', 'interviewer', 'slot'
    ).order_by('-scheduled_at')
    serializer_class = ScheduledInterviewSerializer
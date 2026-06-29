from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewerViewSet,
    InterviewRequestViewSet,
    ScheduledInterviewViewSet,
)

router = DefaultRouter()
router.register('interviewers', InterviewerViewSet)
router.register('interview-requests', InterviewRequestViewSet)
router.register('scheduled-interviews', ScheduledInterviewViewSet)

urlpatterns = [path('', include(router.urls))]
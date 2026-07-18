from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewerViewSet,
    InterviewRequestViewSet,
    ScheduledInterviewViewSet,
)

router = DefaultRouter()
router.register('interviewers', InterviewerViewSet)
router.register('interview-requests', InterviewRequestViewSet, basename='interview-request')
router.register('scheduled-interviews', ScheduledInterviewViewSet, basename='scheduled-interview')

urlpatterns = [path('', include(router.urls))]
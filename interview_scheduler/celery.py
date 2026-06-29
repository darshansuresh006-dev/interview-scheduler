import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interview_scheduler.settings')

app = Celery('interview_scheduler')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
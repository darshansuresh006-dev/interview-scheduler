#!/usr/bin/env bash

# Start Celery worker in the background (low concurrency to fit free tier memory)
celery -A interview_scheduler worker --loglevel=info --concurrency=2 --pool=solo &

# Start Celery beat in the background
celery -A interview_scheduler beat --loglevel=info &

# Start Django with gunicorn in the foreground (keeps the service alive)
gunicorn interview_scheduler.wsgi --workers=1 --log-file -
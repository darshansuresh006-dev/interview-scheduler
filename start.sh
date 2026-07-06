#!/usr/bin/env bash

# Start Celery worker in the background
celery -A interview_scheduler worker --loglevel=info &

# Start Celery beat in the background
celery -A interview_scheduler beat --loglevel=info &

# Start Django with gunicorn in the foreground (keeps the service alive)
gunicorn interview_scheduler.wsgi --log-file -
import logging
logger = logging.getLogger(__name__)

def create_calendar_event(request, interviewer, slot):
    # Placeholder — returns empty strings until Google credentials are set up
    logger.info("Google Calendar not configured — skipping event creation.")
    return '', ''
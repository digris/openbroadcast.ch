from django.conf import settings
from django.db.models import get_model

SETTINGS = getattr(settings, 'PUSHY_SETTINGS', {})

def get_channel():
    return '%s' % SETTINGS.get('CHANNEL_PREFIX', 'pushy_')

def get_redis_host():
    return '%s' % SETTINGS.get('REDIS_HOST', '127.0.0.1')


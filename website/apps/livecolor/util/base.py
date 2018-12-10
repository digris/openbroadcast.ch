#-*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
import logging
import redis
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

log = logging.getLogger(__name__)


REDIS_HOST = getattr(settings, 'PUSHY_REDIS_HOST', None)
REDIS_SITE_ID = getattr(settings, 'PUSHY_REDIS_SITE_ID', None)

if not (REDIS_HOST and REDIS_SITE_ID):
    raise ImproperlyConfigured('PUSHY_REDIS_HOST and PUSHY_REDIS_SITE_ID in settings is required!')

class Livecolor(object):

    def set_color(self, *args, **kwargs):

        bg_color = kwargs.get('bg_color')
        fg_color = kwargs.get('fg_color')
        duration = kwargs.get('duration')

        log.debug('Setting colors to bg: {:} fg: {:} transition: {:}'.format(
                bg_color,
                fg_color,
                duration
        ))

        rs = redis.StrictRedis(host=REDIS_HOST)

        message = {
            'bg_color': '#{:}'.format(bg_color) if bg_color else False,
            'fg_color': '#{:}'.format(fg_color) if fg_color else False,
            'duration': duration if duration else 0,
        }

        try:
            log.debug('routing to: %s%s' % (REDIS_SITE_ID, 'livecolor'))
            rs.publish('%s%s' % (REDIS_SITE_ID, 'livecolor'), json.dumps(message))
        except redis.ConnectionError as e:
            log.warning('unable to route message %s' % e)



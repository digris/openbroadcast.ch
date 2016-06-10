# -*- coding: utf-8 -*-
import hashlib
import datetime
import json
import requests
import logging
from sendfile import sendfile
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponse
from django.views.generic import View
from braces.views import LoginRequiredMixin
from models import CachedMedia, CachedEvent
from tasks import create_cached_event

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

log = logging.getLogger(__name__)

class MediaResourceView(LoginRequiredMixin, View):


    def get(self, *args, **kwargs):

        uuid = kwargs.get('uuid', None)
        log.debug(u'media request for %s by %s' % (self.request.user, uuid))

        requested_range = self.request.META.get('HTTP_RANGE', None)
        cached_media, created = CachedMedia.objects.get_or_create(uuid=uuid)

        sf_response = sendfile(self.request, cached_media.path)
        sf_response['X-Accel-Buffering'] = 'no'

        if requested_range:
            requested_range = requested_range.split('=')[1].split('-')

            log.debug(u'requested range %s' % (requested_range))
            if requested_range and requested_range[0] == '0':
                log.info(u'initial play')

                create_cached_event.delay(
                    ct = 'alibrary.media',
                    ct_uuid = uuid,
                    user = self.request.user,
                    action = 'stream'
                )

            else:
                log.debug(u'seek play')

        return sf_response


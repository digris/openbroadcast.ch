# -*- coding: utf-8 -*-
import hashlib
import datetime
import json
import requests
from requests.exceptions import ConnectionError
import urllib
from cStringIO import StringIO
from wsgiref.util import FileWrapper
import logging
from sendfile import sendfile
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponse, StreamingHttpResponse
from django.views.generic import View
from braces.views import LoginRequiredMixin
from models import CachedMedia, CachedEvent
from tasks import create_cached_event

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
STATIC_BASE_URL = getattr(settings, 'STATIC_BASE_URL', None)

STATIC_CACHE_DURATION = getattr(settings, 'CONTENTPROXY_STATIC_CACHE_DURATION', 60 * 60)



if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

if not STATIC_BASE_URL:
    raise ImproperlyConfigured('STATIC_BASE_URL in settings is required!')

log = logging.getLogger(__name__)

class MediaResourceView(LoginRequiredMixin, View):


    def get(self, *args, **kwargs):

        uuid = kwargs.get('uuid', None)
        log.debug(u'media request for %s by %s' % (self.request.user, uuid))

        requested_range = self.request.META.get('HTTP_RANGE', None)
        cached_media, created = CachedMedia.objects.get_or_create(uuid=uuid)

        sf_response = sendfile(self.request, cached_media.path)
        sf_response['X-Accel-Buffering'] = 'yes'

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




class StaticResourceView(View):

    def get(self, *args, **kwargs):

        path = kwargs.get('path', None)
        cache_key = 'static-proxy-{0}'.format(hashlib.md5(path.encode('utf-8')).hexdigest())

        r = cache.get(cache_key)

        if not r:

            url = '{0}/{1}'.format(STATIC_BASE_URL, path)
            log.debug('remote request: {}'.format(url))

            try:
                r = requests.get(url, verify=False)
            except ConnectionError as e:
                return HttpResponse('{}'.format(e), status=503)

            if not r.status_code == 200:
                return HttpResponse('', status=r.status_code)

            cache.set(cache_key, r, STATIC_CACHE_DURATION)

        wrapper = FileWrapper(StringIO(r.content))
        response = StreamingHttpResponse(wrapper, content_type=r.headers.get('Content-Type'))
        response['Content-Length'] = r.headers.get('Content-Length')

        return response

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

from models import CachedMedia

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

log = logging.getLogger(__name__)

class MediaResourceView(LoginRequiredMixin, View):

    def get(self, *args, **kwargs):

        uuid = kwargs.get('uuid', None)

        log.debug(u'media request for %s by %s' % (self.request.user, uuid))

        cached_media, created = CachedMedia.objects.get_or_create(uuid=uuid)

        resource_url = API_BASE_URL + 'v1/library/track/%s/' % uuid

        sf_response = sendfile(self.request, cached_media.path)

        #sf_response['X-Accel-Limit-Rate'] = 1024 * 1000
        sf_response['X-Accel-Buffering'] = 'no'

        return sf_response
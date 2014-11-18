# -*- coding: utf-8 -*-
import hashlib
import datetime
import json
import logging
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from django.http import HttpResponse
from django.views.generic import View

import requests


API_BASE_URL = getattr(settings, 'API_BASE_URL', None)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

#from dgsproxy.models import CachedResource

log = logging.getLogger(__name__)

class ResourceView(View):

    def get(self, *args, **kwargs):

        uri = kwargs.get('uri', None)

        try:
            query_string = self.request.META['QUERY_STRING']
            if len(query_string):
                uri = '%s' % (uri)
        except Exception, e:
            query_string = None

        log.debug('Requesting: %s - %s' % (type, uri))

        r = requests.get(API_BASE_URL + uri, verify=False)




        response = HttpResponse(r.text, content_type='application/json', status=r.status_code)

        return response




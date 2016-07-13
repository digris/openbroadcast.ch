# -*- coding: utf-8 -*-
import hashlib
import datetime
import json
import requests
from requests.exceptions import ConnectionError
import logging
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponse
from django.views.generic import View

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
CACHE_DURATION = getattr(settings, 'APIPROXY_CACHE_DURATION', 60)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

log = logging.getLogger(__name__)

class ResourceView(View):

    def get(self, *args, **kwargs):

        path = kwargs.get('path', None)

        try:
            query_string = self.request.META['QUERY_STRING']
            if len(query_string):
                path = '%s?%s' % (path, query_string)
        except Exception as e:
            query_string = None

        cache_key = 'api-proxy-{0}'.format(hashlib.md5(path.encode('utf-8')).hexdigest())

        r = cache.get(cache_key)

        if not r:

            url = '{0}{1}'.format(API_BASE_URL, path)
            log.debug('remote request: {}'.format(url))

            try:
                r = requests.get(url, verify=False)
            except ConnectionError as e:
                return HttpResponse('{}'.format(e), status=503)

            if not r.status_code == 200:
                return HttpResponse('', status=r.status_code)

            cache.set(cache_key, r, CACHE_DURATION)

        else:
            log.debug('serving {0} from cache'.format(path))


        response = HttpResponse(r.text, content_type='application/json', status=r.status_code, charset='utf-8')
        if r.headers and r.headers.get('Content-Length'):
            response['Content-Length'] = r.headers.get('Content-Length')

        return response

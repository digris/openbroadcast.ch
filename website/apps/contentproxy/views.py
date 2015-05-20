# -*- coding: utf-8 -*-
import hashlib
import datetime
import json
import requests
import logging
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponse
from django.views.generic import View

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

log = logging.getLogger(__name__)

class MediaResourceView(View):
    def get(self, *args, **kwargs):
        response = HttpResponse(json.dumps({'status': 'hallo'}), content_type='application/json', status=200)
        return response
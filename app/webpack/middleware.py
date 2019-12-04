# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings

try:
    from django.utils.deprecation import MiddlewareMixin
except ImportError:
    MiddlewareMixin = object

DEVSERVER_HEADER = "HTTP_" + getattr(
    settings, "WEBPACK_DEVSERVER_HEADER", "X-WEBPACK-DEVSERVER"
).replace("-", "_")


class WebpackDevserverMiddleware(MiddlewareMixin):
    def __init__(self, *args, **kwargs):
        super(WebpackDevserverMiddleware, self).__init__(*args, **kwargs)

    def process_request(self, request):

        if request.META.get(DEVSERVER_HEADER, False):
            request.webpack_devserver = True

        return None

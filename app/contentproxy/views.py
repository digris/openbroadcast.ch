# -*- coding: utf-8 -*-
import hashlib
import requests
import logging

try:
    from StringIO import StringIO as BytesIO
except ImportError:
    from io import BytesIO

from requests.exceptions import ConnectionError
from wsgiref.util import FileWrapper
from sendfile import sendfile
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpResponse, StreamingHttpResponse
from django.views.generic import View
from braces.views import LoginRequiredMixin
from .models import CachedMedia
from . import tasks

STATIC_BASE_URL = getattr(settings, "STATIC_BASE_URL", None)
STATIC_CACHE_DURATION = getattr(settings, "CONTENTPROXY_STATIC_CACHE_DURATION", 60 * 60)


if not STATIC_BASE_URL:
    raise ImproperlyConfigured("STATIC_BASE_URL in settings is required!")

log = logging.getLogger(__name__)


class MediaResourceView(LoginRequiredMixin, View):

    raise_exception = True

    def get(self, *args, **kwargs):

        uuid = kwargs.get("uuid", None)

        requested_range = self.request.META.get("HTTP_RANGE", None)

        log.info(
            "media request - uuid: {} user: {} range: {}".format(
                uuid, self.request.user, requested_range
            )
        )

        if requested_range:
            requested_range = requested_range.split("=")[1].split("-")

            log.debug(u"requested range %s" % (requested_range))
            if requested_range and requested_range[0] == "0":
                log.debug("initial play - range from: {}".format(requested_range[0]))

                tasks.create_event.delay(
                    obj_ct="alibrary.media",
                    obj_uuid=uuid,
                    event_type="stream",
                    user_remote_id=self.request.user.remote_id,
                )

            else:
                log.debug("seek play")

        cached_media, created = CachedMedia.objects.get_or_create(uuid=uuid)

        if created:
            log.debug("created media cache version - uuid: {}".format(uuid))

        log.debug("serve cached media from: {}".format(cached_media.path))

        sf_response = sendfile(self.request, cached_media.path)
        sf_response["X-Accel-Buffering"] = "yes"

        return sf_response


class StaticResourceView(View):
    """
    TODO: refactor to nginx reverse proxy
    """

    def get(self, *args, **kwargs):

        path = kwargs.get("path", None)
        cache_key = "static-proxy-{0}".format(
            hashlib.md5(path.encode("utf-8")).hexdigest()
        )

        r = cache.get(cache_key)

        if not r:

            url = "{0}/{1}".format(STATIC_BASE_URL, path)
            log.debug("remote request: {}".format(url))

            try:
                r = requests.get(url, verify=True)
            except ConnectionError as e:
                return HttpResponse("{}".format(e), status=503)

            if not r.status_code == 200:
                return HttpResponse("", status=r.status_code)

            cache.set(cache_key, r, STATIC_CACHE_DURATION)

        wrapper = FileWrapper(BytesIO(r.content))

        response = StreamingHttpResponse(
            wrapper, content_type=r.headers.get("Content-Type")
        )
        response["Content-Length"] = r.headers.get("Content-Length")

        return response

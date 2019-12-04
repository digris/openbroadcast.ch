# -*- coding: utf-8 -*-

import logging
from django.conf import settings
from django.http import HttpResponse, Http404, HttpResponseNotFound
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework import mixins
from rest_framework.exceptions import PermissionDenied
from braces.views import CsrfExemptMixin


from ..models import StreamEvent
from ..utils.webstream import get_available_streams
from .serializers import StreamEventSerializer

ICECAST_PUBLIC_SERVER_URL = getattr(settings, "ICECAST_PUBLIC_SERVER_URL")

log = logging.getLogger(__name__)


class StreamEventViewSet(
    CsrfExemptMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = StreamEvent.objects.all().order_by("-created")
    lookup_field = "uuid"
    serializer_class = StreamEventSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):

        if not request.user.has_perm("listener.add_streamevent"):
            raise PermissionDenied("missing permission: listener.add_streamevent")

        return super().create(request, *args, **kwargs)


stream_event_list = StreamEventViewSet.as_view({"get": "list", "post": "create"})


@api_view()
def webstream_list(request):
    """
    get available mountpoints / stream formats
    """
    streams = get_available_streams()
    return Response(streams)


@api_view()
def webstream_m3u(request, mountpoint):
    """
    download m3u file for given mountpoint
    """
    streams = get_available_streams()
    stream = next(
        (s for s in streams if s.get("path") == "/{}".format(mountpoint)), None
    )

    if not stream:
        return HttpResponseNotFound('mountpoint "{}" not found'.format(mountpoint))

    m3u = "#EXTM3U\n#EXTINF:0,open broadcast - eclectic and user driven\n{}".format(
        stream.get("url")
    )

    return HttpResponse(m3u, content_type="audio/x-mpegurl")

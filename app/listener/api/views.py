# -*- coding: utf-8 -*-

import logging


from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework import mixins
from rest_framework.exceptions import PermissionDenied
from braces.views import CsrfExemptMixin


from ..models import StreamEvent
from .serializers import StreamEventSerializer

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

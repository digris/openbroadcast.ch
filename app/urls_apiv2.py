# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.reverse import reverse, reverse_lazy


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request, format=None):
    return Response(
        {
            "chat": reverse("api:chat-message-list", request=request, format=format),
            "onair": reverse("api:onair-schedule-list", request=request, format=format),
        }
    )


urlpatterns = [
    url(r"^$", api_root),
    url("^chat/", include("chat.api.urls")),
    url("^onair/", include("onair.api.urls")),
    url("^rating/", include("rating.api.urls")),
    url("^listener/", include("listener.api.urls")),
]

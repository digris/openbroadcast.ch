# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r"^event/$", views.stream_event_list, name="listener-event-list"),
    # icecast streaming
    url(r"^webstream/$", views.webstream_list, name="listener-webstream-list"),
    url(
        r"^webstream/(?P<mountpoint>[-\w.]+).m3u$",
        views.webstream_m3u,
        name="listener-webstream-m3u",
    ),
]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import url

from . import views

urlpatterns = [url(r"^event/$", views.stream_event_list, name="listener-event-list")]

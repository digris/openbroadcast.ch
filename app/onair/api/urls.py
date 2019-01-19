# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^schedule/$', views.schedule_list, name='onair-schedule-list'),
    url(r'^schedule/(?P<uuid>[0-9A-Fa-f-]+)/$', views.schedule_detail, name='onair-schedule-detail'),
]

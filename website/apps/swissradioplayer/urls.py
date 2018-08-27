# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import patterns, url

app_name = 'swissradioplayer'
urlpatterns = [
    url(r'^console/$', 'stationtime.views.current_time', name='stationtime-current-time'),
]


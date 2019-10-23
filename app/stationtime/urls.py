from __future__ import absolute_import, unicode_literals

from django.conf.urls import url

from . import views

urlpatterns = [url(r"^time/$", views.current_time, name="stationtime-current-time")]

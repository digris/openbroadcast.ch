# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^vote/(?P<obj_ct>[a-z-_\.]+):(?P<obj_uuid>[0-9A-Fa-f-]+)/$', views.vote_detail, name='rating-vote-detail'),
]

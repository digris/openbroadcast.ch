# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^message/$', views.chatmessage_list, name='chat-message-list'),
    url(r'^message/(?P<uuid>[0-9A-Fa-f-]+)/$', views.chatmessage_detail, name='chat-message-detail'),
]

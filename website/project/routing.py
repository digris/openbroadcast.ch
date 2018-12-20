# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.staticfiles import StaticFilesWrapper, StaticFilesHandler

from chat.consumers import ChatJSONConsumer

application = StaticFilesWrapper(ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter([
            url('^ws/chat/$', ChatJSONConsumer),
        ])
    ),
}))

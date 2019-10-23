# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.staticfiles import StaticFilesWrapper

from chat.consumers import ChatJSONConsumer
from rating.consumers import RatingJSONConsumer
from onair.consumers import OnairJSONConsumer

application = StaticFilesWrapper(
    ProtocolTypeRouter(
        {
            "websocket": AuthMiddlewareStack(
                URLRouter(
                    [
                        url("^ws/onair/$", OnairJSONConsumer),
                        url("^ws/chat/$", ChatJSONConsumer),
                        url("^ws/rating/$", RatingJSONConsumer),
                    ]
                )
            )
        }
    )
)

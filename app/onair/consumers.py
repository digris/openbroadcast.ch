# -*- coding: utf-8 -*-
import logging

from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync

log = logging.getLogger(__name__)


class OnairJSONConsumer(JsonWebsocketConsumer):
    def connect(self):

        self.group_name = "onair"

        log.debug("user connected: {}".format(self.scope["user"].__class__))
        log.debug("channel: {}".format(self.group_name))

        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    # TODO: implemnt onair logic
    def onair(self, event):
        content = event["content"]
        self.send_json(content=content)

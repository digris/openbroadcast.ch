import logging

from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync

from .models import Message

log = logging.getLogger(__name__)

class ChatJSONConsumer(JsonWebsocketConsumer):

    def connect(self):

        self.group_name = 'chat'

        log.debug('user connected: {}'.format(self.scope['user'].__class__))
        log.debug('channel: {}'.format(self.group_name))

        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )
        self.accept()


    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    def receive_json(self, content, **kwargs):
        # incoming messages are handled via API POST
        # as validation and unserialize are faster implemented in DRF...
        log.debug(content)
        # m = Message(
        #     user=self.scope['user'],
        #     text=content['text']
        # )
        # m.save()


    def message(self, event):
        content = event['content']
        self.send_json(content=content)

# -*- coding: utf-8 -*-
import logging

from django import dispatch
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .api.serializers import ScheduledItemSerializer

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()

# signal definitions
item_start_playing = dispatch.Signal(providing_args=["item", "time_start"])


# connecting signals
@receiver(item_start_playing)
def ws_send_current_item(sender, item, time_start, **kwargs):
    log.debug("new item {} started playing. notify channel group".format(item))
    channel = "onair"
    data = {"type": "onair", "content": ScheduledItemSerializer(item).data}
    async_to_sync(channel_layer.group_send)(channel, data)

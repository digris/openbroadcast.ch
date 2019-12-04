# -*- coding: utf-8 -*-
import logging

from django import dispatch
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .api.serializers import ScheduledItemSerializer
from . import tasks

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()

# signal definitions
# triggered by celery schedule
item_start_playing = dispatch.Signal(providing_args=["item", "time_start"])


# connecting signals
@receiver(item_start_playing)
def ws_send_current_item(sender, item, time_start, **kwargs):
    """
    send current on-air item to connected clients.
    """
    log.debug("new item {} started playing. notify channel group".format(item))
    channel = "onair"
    data = {"type": "onair", "content": ScheduledItemSerializer(item).data}
    async_to_sync(channel_layer.group_send)(channel, data)


@receiver(item_start_playing)
def on_item_start_playing(sender, item, time_start, **kwargs):
    log.debug("item started playing {}".format(item))
    # tell facebook open-graph to clear cache
    tasks.clear_facebook_og_cache.apply_async(countdown=3)
    # update stream metadata ?????
    # for whatever reasons it is not possible to pass `item`
    tasks.update_stream_metadata.apply_async(
        countdown=6, kwargs={"item_uuid": item.uuid}
    )

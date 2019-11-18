# -*- coding: utf-8 -*-

import logging
import bleach

from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from telegram_bot.tasks import send_channel_message
from .api.serializers import MessageSerializer
from .models import Message


log = logging.getLogger(__name__)

channel_layer = get_channel_layer()


@receiver(pre_save, sender=Message)
def message_pre_save(sender, instance, *args, **kwargs):
    instance.text = bleach.clean(instance.text)
    # instance.text = bleach.linkify(instance.text)


@receiver(post_save, sender=Message)
def message_post_save(sender, instance, *args, **kwargs):
    serializer = MessageSerializer(instance, context={"request": None})
    channel = "chat"
    data = {"type": "message", "content": serializer.data}

    async_to_sync(channel_layer.group_send)(channel, data)

    message = '{} posted: "{}"'.format(instance.user.get_display_name(), instance.text)
    if len(message) > 200:
        message = message[0:200] + " ..."
    send_channel_message.delay("chat", message)

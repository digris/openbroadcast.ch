# -*- coding: utf-8 -*-

import logging
import bleach
import telegram

from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
from django.conf import settings

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .api.serializers import MessageSerializer
from .models import Message

TELEGRAM_BOT_TOKEN = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
TELEGRAM_CHAT_ID = getattr(settings, 'TELEGRAM_CHAT_ID', None)
USE_TELEGRAM = (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()


class TGBot(object):

    _bot = None

    def __init__(self, token, chat_id):
        self.chat_id = chat_id
        self._bot = telegram.Bot(token=token)

    def send(self, text):
        self._bot.send_message(self.chat_id, text)



if USE_TELEGRAM:
    bot = TGBot(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)

@receiver(pre_save, sender=Message)
def message_pre_save(sender, instance, *args, **kwargs):
    instance.text = bleach.clean(instance.text)
    # instance.text = bleach.linkify(instance.text)


@receiver(post_save, sender=Message)
def message_post_save(sender, instance, *args, **kwargs):
    serializer = MessageSerializer(
        instance,
        context={'request': None}
    )
    channel = 'chat'
    data = {
        'type': 'message',
        'content': serializer.data
    }

    async_to_sync(channel_layer.group_send)(
        channel, data
    )

    # TODO: eventually find a better playe...
    if USE_TELEGRAM:
        text = '{} posted: "{}"'.format(instance.user.get_display_name(), instance.text)
        if len(text) > 200:
            text = text[0:200] + ' ...'
        bot.send(text)

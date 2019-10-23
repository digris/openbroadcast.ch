# -*- coding: utf-8 -*-
import logging

from django import dispatch
from django.dispatch import receiver
from channels.layers import get_channel_layer
from telegram_bot.tasks import send_channel_message
from onair.models import ScheduledItem


log = logging.getLogger(__name__)

channel_layer = get_channel_layer()

# signal definitions
user_rated_object = dispatch.Signal(providing_args=["user", "votes"])


# connecting signals
@receiver(user_rated_object)
def rating_received(sender, user, votes, **kwargs):

    user_vote = votes.get('user_vote')
    current_item = ScheduledItem.objects.get_current()

    if user_vote and current_item:
        message = '{} rated "{}" with {}'.format(user, current_item.name, user_vote)

        send_channel_message.delay('rating', message)

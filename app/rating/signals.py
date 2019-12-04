# -*- coding: utf-8 -*-
import logging

from django import dispatch
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from telegram_bot.tasks import send_channel_message
from onair.models import ScheduledItem

VOTE_CHARACTER_MAP = {-1: "👎", 1: "👍", 0: "🗑", None: "🗑"}

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()

# signal definitions
user_rated_object = dispatch.Signal(providing_args=["user", "votes"])


@receiver(user_rated_object)
def push_to_connected_clients(sender, user, votes, **kwargs):

    channel = "rating"
    data = {"type": "votes", "content": votes}

    async_to_sync(channel_layer.group_send)(channel, data)

@receiver(user_rated_object)
def send_notification_to_telegram(sender, user, votes, **kwargs):

    user_vote = votes.get("user_vote")
    current_item = ScheduledItem.objects.get_current()

    if current_item:

        vote_char = VOTE_CHARACTER_MAP.get(user_vote, user_vote)

        try:
            str_item = "[{}](https://www.openbroadcast.org{})".format(
                current_item.name, current_item.item_data.get("absolute_url")
            )
        except:
            str_item = current_item.name

        if user and user.is_authenticated:
            str_user = user.get_display_name()
        else:
            str_user = 'anonymous'

        message = '{} by {} for "{}"'.format(
            vote_char, str_user, str_item
        )

        send_channel_message.delay("rating", message)

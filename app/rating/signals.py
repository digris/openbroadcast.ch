# -*- coding: utf-8 -*-
import logging

from django import dispatch
from django.dispatch import receiver
from channels.layers import get_channel_layer
from telegram_bot.tasks import send_channel_message
from onair.models import ScheduledItem

VOTE_CHARACTER_MAP = {-1: "👎", 1: "👍"}

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()

# signal definitions
user_rated_object = dispatch.Signal(providing_args=["user", "votes"])


# connecting signals
@receiver(user_rated_object)
def rating_received(sender, user, votes, **kwargs):

    user_vote = votes.get("user_vote")
    current_item = ScheduledItem.objects.get_current()

    if user_vote and current_item:

        try:
            str_item = '[{}](https://www.openbroadcast.org{})'.format(
                current_item.name,
                current_item.item_data.get('absolute_url')
            )
        except:
            str_item = current_item.name

        vote_char = VOTE_CHARACTER_MAP.get(user_vote, user_vote)
        message = '{} by {} for "{}"'.format(
            vote_char, user.get_display_name(), str_item
        )

        send_channel_message.delay("rating", message)

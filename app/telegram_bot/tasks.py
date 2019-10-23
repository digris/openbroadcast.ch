# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging

from app.celery import app
from .bot import bot

log = logging.getLogger(__name__)


@app.task
def send_channel_message(channel, message):
    log.info("sending message to channel: {} - {}".format(channel, message))
    bot.send(channel=channel, text=message)

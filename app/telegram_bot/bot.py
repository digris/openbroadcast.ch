# -*- coding: utf-8 -*-

import logging
import telegram

from django.conf import settings


TELEGRAM_BOT_TOKEN = getattr(settings, "TELEGRAM_BOT_TOKEN", None)

CHANNEL_MAP = {
    'chat': '-339332230',
    'rating': '-201118720',
}


log = logging.getLogger(__name__)


class TGBot(object):

    _tg_bot = None

    def __init__(self):
        log.debug('initialising telegram bot')
        if TELEGRAM_BOT_TOKEN:
            self._tg_bot = telegram.Bot(token=TELEGRAM_BOT_TOKEN)

    def send(self, channel, message):
        log.debug('send message - id: {} - {}'.format(channel, message))

        chat_id = CHANNEL_MAP.get(channel, None)
        if not chat_id:
            log.warning('invalid channel: {}'.format(channel))
            return

        self._tg_bot.send_message(chat_id, message)


bot = TGBot()

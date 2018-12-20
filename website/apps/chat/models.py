# -*- coding: utf-8 -*-

import logging


from django.conf import settings
from django.db import models

from base.models.mixins import TimestampedModelMixin, UUIDModelMixin


log = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL


class Message(TimestampedModelMixin, UUIDModelMixin, models.Model):

    user = models.ForeignKey(
        User,
        related_name='+'
    )
    text = models.TextField()

    class Meta:
        app_label = 'chat'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ('-created',)

    def __str__(self):
        return '{} {}'.format(self.user, self.text[:100])


class MentionedUser(models.Model):

    message = models.ForeignKey(
        Message,
        related_name='mentioned_users'
    )
    user = models.ForeignKey(
        User,
        related_name='+'
    )

    class Meta(object):
        app_label = 'chat'
        verbose_name = 'Mentioned User'

    def __unicode__(self):
        return '{}'.format(self.user)

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
import redis
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.db import models
from django.db.models.signals import post_save
from django.dispatch.dispatcher import receiver

log = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL


class Beat(models.Model):

    user = models.OneToOneField(User, related_name='beat')
    updated = models.DateTimeField(auto_now=True, editable=False)

    class Meta(object):
        app_label = 'heartbeat'
        verbose_name = 'Beat'
        ordering = ('-updated',)

    def __unicode__(self):
        return '{0} {1}'.format(self.user.username, self.updated)


    def save(self, *args, **kwargs):
        super(Beat, self).save(*args, **kwargs)

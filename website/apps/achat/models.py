# -*- coding: utf-8 -*-
import os
import sys
import shutil
import hashlib
import magic
import logging
import gzip
from random import randrange
import datetime
import requests
import redis
from django.utils.translation import ugettext_lazy as _
from django.db import models
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch.dispatcher import receiver
from django.conf import settings
from base.models import TimestampedModel
from jsonfield import JSONField
from django.contrib.auth import get_user_model


log = logging.getLogger(__name__)
User = get_user_model()

RS_HOST = '127.0.0.1'
RS_CHANNEL = 'levelbridge_'

# Create your models here.
class Message(models.Model):

    user = models.ForeignKey(User)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    text = models.TextField()
    options = JSONField(null=True, blank=True)

    class Meta(object):
        app_label = 'achat'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ('-created',)

    def __unicode__(self):
        return '%s "%s"' % (self.user.username, self.text[:100])

    def emit_message(self):

        from achat.api.resources import MessageResource
        from django.http import HttpRequest

        req = HttpRequest()
        resource = MessageResource()

        bundle = resource.build_bundle(obj=self)
        bundle = resource.full_dehydrate(bundle)
        bundle = resource.alter_detail_data_to_serialize(req, bundle)

        message = resource.serialize(req, bundle, 'application/json')
        rs = redis.StrictRedis(host=RS_HOST)

        try:
            rs.publish('%s%s' % (RS_CHANNEL, 'achat'), message)
        except redis.ConnectionError, e:
            print e


    def save(self, *args, **kwargs):
        super(Message, self).save(*args, **kwargs)

@receiver(post_save, sender=Message)
def message_post_save(sender, instance, **kwargs):
    log.debug('Post-save action: %s' % (instance.text))
    instance.emit_message()

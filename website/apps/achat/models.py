# -*- coding: utf-8 -*-
import os
import re
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
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from jsonfield import JSONField
from django.conf import settings
from base.models import TimestampedModel

log = logging.getLogger(__name__)

#User = settings.AUTH_USER_MODEL
User = settings.AUTH_USER_MODEL


REDIS_HOST = getattr(settings, 'PUSHY_REDIS_HOST', None)
REDIS_SITE_ID = getattr(settings, 'PUSHY_REDIS_SITE_ID', None)

if not (REDIS_HOST and REDIS_SITE_ID):
    raise ImproperlyConfigured('PUSHY_REDIS_HOST and PUSHY_REDIS_SITE_ID in settings is required!')




class Message(models.Model):

    user = models.ForeignKey(User)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    text = models.TextField()
    rendered_text = models.TextField(null=True, blank=True)
    options = JSONField(null=True, blank=True)

    class Meta(object):
        app_label = 'achat'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ('-created',)

    def __unicode__(self):
        return '%s "%s"' % (self.user.username, self.text[:100])


    @property
    def attachments(self):

        items = None
        has_youtube = re.findall(r'(https?://)?(www\.)?((youtube\.(com))/watch\?v=([-\w]+)|youtu\.be/([-\w]+))', self.text)
        if has_youtube:
            print has_youtube
            video_id = [c for c in has_youtube[0] if c] # Get rid of empty list objects
            video_id = video_id[len(video_id)-1] # Return the last item in the list
            items = []
            items.append('<div class="flex-video widescreen youtube"><iframe id="ytplayer" type="text/html" width="478" height="300" src="https://www.youtube.com/embed/{0}?autoplay=0&origin=http://example.com" frameborder="0"/></div>'.format(video_id))

        return items


    @property
    def html(self):

        if self.rendered_text:
            pass
            #return self.rendered_text

        bits = []
        for bit in self.text.split(' '):
            rendered_bit = bit
            if bit[0:1] == '@':

                try:
                    username = bit[1:]
                    # TODO: eventually this is not working!
                    #user = User.objects.get(username=username)
                    user = get_user_model().objects.get(username=username)
                    rendered_bit = u"""<a data-ct="user" data-id="{id}" data-name="{name}" data-profile_uri="{profile_uri}">@{username}</a>""".format(
                        username=user.username,
                        name=user.get_full_name(),
                        id=user.id,
                        profile_uri=user.profile_uri or 'false',
                    )
                except:
                    pass

            bits.append(rendered_bit)



        self.rendered_text = u' '.join(bits)
        self.save()

        return self.rendered_text





    def emit_message(self):

        from achat.api.resources import MessageResource
        from django.http import HttpRequest

        req = HttpRequest()
        resource = MessageResource()

        bundle = resource.build_bundle(obj=self)
        bundle = resource.full_dehydrate(bundle)
        bundle = resource.alter_detail_data_to_serialize(req, bundle)

        message = resource.serialize(req, bundle, 'application/json')
        rs = redis.StrictRedis(host=REDIS_HOST)

        try:
            log.debug('routing to: %s%s' % (REDIS_SITE_ID, 'achat'))
            rs.publish('%s%s' % (REDIS_SITE_ID, 'achat'), message)
        except redis.ConnectionError, e:
            log.warning('unable to route message %s' % e)


    def save(self, *args, **kwargs):
        super(Message, self).save(*args, **kwargs)

@receiver(post_save, sender=Message)
def message_post_save(sender, instance, **kwargs):
    log.debug('Post-save action: %s' % (instance.text))
    #instance.emit_message()


class MentionedUser(models.Model):

    message = models.ForeignKey(Message, related_name='mentioned_users')
    user = models.ForeignKey(User, related_name='mentions')

    class Meta(object):
        app_label = 'achat'
        verbose_name = 'Mentioned User'

    def __unicode__(self):
        return u'%s' % (self.user.username)


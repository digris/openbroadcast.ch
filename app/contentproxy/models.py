# -*- coding: utf-8 -*-
import logging
import os

import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext as _

MEDIA_ROOT = getattr(settings, 'MEDIA_ROOT', None)
MEDIA_URL = getattr(settings, 'MEDIA_URL', None)
API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)
ASSET_BASE_URL = getattr(settings, 'ASSET_BASE_URL', None)

User = settings.AUTH_USER_MODEL
log = logging.getLogger(__name__)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

if not API_BASE_AUTH:
    raise ImproperlyConfigured('settings.API_BASE_AUTH is required')


class CachedMedia(models.Model):
    uuid = models.CharField(max_length=36, db_index=True, unique=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    updated = models.DateTimeField(auto_now=True, editable=False)

    STATUS_CHOICES = (
        (0, _('Initial')),
        (1, _('Ready')),
        (99, _('Error')),
    )
    status = models.PositiveIntegerField(default=0, choices=STATUS_CHOICES)

    class Meta:
        app_label = 'contentproxy'
        verbose_name = _('Cached Media')
        verbose_name_plural = _('Cached Media')

    def __str__(self):
        return u'%s' % self.uuid

    @property
    def uri(self):
        return MEDIA_URL + 'private/' + 'media/' + self.uuid + '/default.mp3'

    @property
    def directory(self):
        return os.path.join(MEDIA_ROOT, 'private', 'media', self.uuid)

    @property
    def path(self):
        return os.path.join(self.directory, 'default.mp3')

    def get_remote_file(self):

        headers = {
            'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])
        }

        url = API_BASE_URL + 'v1/library/track/{0}/stream.mp3'.format(self.uuid)
        log.debug('calling API with %s' % url)
        r = requests.get(url, headers=headers, stream=True, verify=True)

        directory = os.path.join(MEDIA_ROOT, 'private', 'media', self.uuid)
        filename = 'default.mp3'

        if r.status_code == 200:

            if not os.path.exists(directory):
                os.makedirs(directory)

            path = os.path.join(directory, filename)

            with open(path, 'wb') as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)

            self.status = 1
        else:
            log.warn(u'unable to fetch remote file. %s - %s' % (r.status_code, r.text[0:120]))
            self.status = 99


@receiver(post_save, sender=CachedMedia)
def cached_media_post_save(sender, **kwargs):
    obj = kwargs['instance']
    if kwargs['created']:
        log.debug('instance created: %s' % obj)
        obj.get_remote_file()
        obj.save()


@receiver(pre_delete, sender=CachedMedia)
def cached_media_pre_delete(sender, **kwargs):
    obj = kwargs['instance']
    log.debug('delete: %s' % obj.directory)
    log.debug('delete: %s' % obj.path)

    if os.path.isfile(obj.path):
        log.debug('delete file: %s' % obj.path)
        try:
            os.remove(obj.path)
        except Exception as e:
            log.debug('unable to delete file: %s - %s' % (obj.path, e))

    if os.path.isdir(obj.directory):
        log.debug('delete directory: %s' % obj.directory)
        try:
            os.rmdir(obj.directory)
        except Exception as e:
            log.debug('unable to delete directory: %s - %s' % (obj.path, e))


class CachedEvent(models.Model):
    created = models.DateTimeField(auto_now_add=True, editable=False)
    ct = models.CharField(max_length=36)
    ct_uuid = models.CharField(max_length=36)
    user = models.ForeignKey(User)
    action = models.CharField(max_length=36)
    processed = models.BooleanField(default=False)

    class Meta:
        app_label = 'contentproxy'
        verbose_name = _('Cached Event')

    def __str__(self):
        return u'%s - %s - %s' % (self.ct, self.user, self.action)

    def create_remote_event(self):
        headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

        url = API_BASE_URL + 'v1/atracker/event/%s/%s/%s/%s/' % (
        self.ct, self.ct_uuid, self.action, self.user.remote_id)

        log.debug('calling API with %s' % url)

        r = requests.get(url, headers=headers, verify=True)

        # return r.json()


@receiver(post_save, sender=CachedEvent)
def cached_event_post_save(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.processed:
        log.info('event post save: %s - %s' % (obj, obj.created))

        obj.create_remote_event()

# -*- coding: utf-8 -*-
import os
import datetime
import logging
import requests
from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext as _
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings

MEDIA_ROOT = getattr(settings, 'MEDIA_ROOT', None)
MEDIA_URL = getattr(settings, 'MEDIA_URL', None)
API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)

User = settings.AUTH_USER_MODEL
log = logging.getLogger(__name__)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

if not API_BASE_AUTH:
    raise ImproperlyConfigured('settings.API_BASE_AUTH is required')

class CachedMedia(models.Model):

    uuid = models.CharField(max_length=36, db_index=True, unique=True)

    STATUS_CHOICES = (
        (0, _('Initial')),
        (1, _('Ready')),
        (99, _('Error')),
    )
    status = models.PositiveIntegerField(max_length=2, default=0, choices=STATUS_CHOICES)

    class Meta:
        app_label = 'contentproxy'
        verbose_name = _('Cached Media')
        verbose_name_plural = _('Cached Media')

    def __unicode__(self):
        return u'%s' % self.uuid


    @property
    def uri(self):
        return MEDIA_URL + 'private/' + 'media/' + self.uuid + '/stream.mp3'

    @property
    def path(self):
        return os.path.join(MEDIA_ROOT, 'private', 'media', self.uuid, 'stream.mp3')


    def get_remote_file(self):

        headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

        url = API_BASE_URL + 'v1/library/track/{0}/stream.mp3'.format(self.uuid)
        log.debug('calling API with %s' % url)
        r = requests.get(url, headers=headers, stream=True, verify=False)

        directory = os.path.join(MEDIA_ROOT, 'private', 'media', self.uuid)
        filename = 'stream.mp3'

        if not os.path.exists(directory):
            os.makedirs(directory)

        path = os.path.join(directory, filename)

        if r.status_code == 200:
            with open(path, 'wb') as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
        else:
            log.warn(u'unable to fetch remote file. %s - %s' % (r.status_code, r.text))




@receiver(post_save, sender=CachedMedia)
def cached_media_post_save(sender, **kwargs):
    obj = kwargs['instance']
    if kwargs['created']:
        log.debug('instance created: %s' % obj)
        obj.get_remote_file()
        obj.save()




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

    def __unicode__(self):
        return u'%s - %s - %s' % (self.ct, self.user, self.action)


    def create_remote_event(self):

        headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

        url = API_BASE_URL + 'v1/atracker/event/%s/%s/%s/%s/' % (self.ct, self.ct_uuid, self.action, self.user.remote_id)

        log.debug('calling API with %s' % url)

        r = requests.get(url, headers=headers, verify=False)

        #return r.json()


@receiver(post_save, sender=CachedEvent)
def cached_event_post_save(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.processed:
        log.info('event post save: %s - %s' % (obj, obj.created))

        obj.create_remote_event()





#!/usr/bin/python
# -*- coding: utf-8 -*-

import datetime
import logging
import requests
from django.db import models
from django.db.models.signals import post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.utils.translation import ugettext as _
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse
from django.contrib.postgres.fields import JSONField

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)

log = logging.getLogger(__name__)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

if not API_BASE_AUTH:
    raise ImproperlyConfigured('settings.API_BASE_AUTH is required')


class ScheduledItemManager(models.Manager):
    def history(self):
        #return self.get_query_set().filter(time_start__lte=timezone.now())
        return self.get_query_set().filter(time_start__lte=datetime.datetime.now())


class ScheduledItem(models.Model):

    name = models.CharField(max_length=255)

    time_start = models.DateTimeField()
    time_end = models.DateTimeField()

    emission_url = models.CharField(max_length=255, blank=True, null=True)
    item_url = models.CharField(max_length=255, blank=True, null=True)

    emission_data = JSONField(
        null=True, blank=True
    )
    item_data = JSONField(
        null=True, blank=True
    )

    STATUS_CHOICES = (
        (0, _('Initial')),
        (1, _('Done')),
        (2, _('Error')),
    )
    status = models.PositiveIntegerField(default=0, choices=STATUS_CHOICES)

    objects = ScheduledItemManager()

    class Meta:
        app_label = 'onair'
        verbose_name = _('Scheduled Item')
        verbose_name_plural = _('Scheduled Items')
        ordering = ('-time_start',)


    def __unicode__(self):
        return u'%s' % self.name


    @property
    def is_onair(self):
        now = timezone.now()
        return (self.time_start < now and self.time_end > now)

    @property
    def starts_in(self):
        now = timezone.now()
        if self.time_start > now:
            return (self.time_start - now).total_seconds()
        return 0

    @property
    def ends_in(self):
        now = timezone.now()
        if self.time_end > now:
            return (self.time_end - now).total_seconds()
        return 0


    """
    content mappings
    """

    @property
    def emission(self):
        if self.emission_data:
            return self.emission_data
        return self.emission_url

    @property
    def item(self):
        if self.item_data:
            return self.item_data
        return self.item_url


    def populate_from_api(self):

        headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

        url = API_BASE_URL + self.emission_url.replace('/api/', '') # sorry!
        log.debug('calling API with %s' % url)
        r = requests.get(url, headers=headers, verify=False)
        if r.status_code == 200:
            self.emission_data = r.json()

        url = API_BASE_URL + self.item_url.replace('/api/', '') # sorry!
        url += '?includes=label'
        log.debug('calling API with %s' % url)
        r = requests.get(url, headers=headers, verify=False)
        if r.status_code == 200:
            self.item_data = r.json()






@receiver(post_save, sender=ScheduledItem)
def scheduled_item_post_save(sender, **kwargs):

    obj = kwargs['instance']

    if kwargs['created']:
        log.debug('instance created: %s' % obj)
        obj.populate_from_api()
        obj.save()


@receiver(post_delete, sender=ScheduledItem)
def scheduled_item_post_delete(sender, **kwargs):
    obj = kwargs['instance']
    log.debug('post delete (stub): %s' % obj)



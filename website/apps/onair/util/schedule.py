# -*- coding: utf-8 -*-
import datetime
import json
import requests
import logging
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from onair.models import ScheduledItem

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)

CHANNEL_ID = 1

log = logging.getLogger(__name__)

if not API_BASE_URL:
    raise ImproperlyConfigured('API_BASE_URL in settings is required!')

if not API_BASE_AUTH:
    raise ImproperlyConfigured('settings.API_BASE_AUTH is required')

def fetch_from_api(range_start=0, range_end=0, channel=None):

    now = datetime.datetime.now()

    # get schedule from API
    url = API_BASE_URL + 'v1/abcast/channel/%s/schedule/?range_start=%s&range_end=%s' % (CHANNEL_ID, range_start, range_end)
    headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}
    log.info('calling API with %s' % url)

    r = requests.get(url, headers=headers, verify=False)
    if not r.status_code == 200:
        log.warning('unable to communicate with API. status code: %s' % r.status_code)
        return False

    remote_schedule = r.json()


    #print remote_schedule['objects']


    # get local schedule
    qs = ScheduledItem.objects.filter(
        time_end__gte=now - datetime.timedelta(seconds=range_start),
        time_start__lte=now + datetime.timedelta(seconds=range_end)).order_by('-time_start')


    times = {
        'start': [item['time_start'] for item in remote_schedule['objects']],
        'end': [item['time_end'] for item in remote_schedule['objects']],
    }


    #qs = qs.exclude(time_start__in=times['start'], time_end__in=times['end'])

    # delete vanished items
    if len(times['start']) + len(times['start']) > 0:
        qs.exclude(time_start__in=times['start'], time_end__in=times['end']).delete()
    else:
        qs.delete()


    # map
    for remote_item in remote_schedule['objects']:
        print remote_item
        item, created = ScheduledItem.objects.get_or_create(
            time_start=remote_item['time_start'],
            time_end=remote_item['time_end'],
            name=remote_item['verbose_name'],
            emission_url=remote_item['emission'],
            item_url=remote_item['item'],
        )
        if created:
            print 'created -> populate!'




    # map
    qs._result_cache = None
    #for locale_item in qs:
    #    print locale_item
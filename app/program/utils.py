# -*- coding: utf-8 -*-
import requests
import dateutil
import datetime
from datetime import timedelta

from django.conf import settings
API_BASE_URL = getattr(settings, 'API_BASE_URL', None)


def _get_scheduled_emissions_from_api(time_start=None, time_end=None):

    url = '{base_url}v2/abcast/emission/'.format(base_url=API_BASE_URL)

    fields = [
        'uuid',
        'url',
        'detail_url',
        'time_start',
        'name',
        'series',
        'is_playing',
        'is_history',
        'co',
        'co.user',
        'co.mixdown_file',
    ]

    params = {
        'fields': ','.join(fields),
    }

    url += '?time_start_0={}&time_start_1={}'.format(
        time_start, time_end
    )

    r = requests.get(url, params=params, timeout=(3,5))
    if not r.status_code == 200:
        return []

    return r.json().get('results')

def get_scheduled_emissions(date):

    time_start = '{}+06:00'.format(date)
    time_end = '{}+05:59'.format(date + timedelta(hours=24))

    emissions = _get_scheduled_emissions_from_api(time_start, time_end)

    return reversed(emissions)

# -*- coding: utf-8 -*-

import logging
import requests

from django.conf import settings

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)

REQUEST_HEADERS = {
    'User-Agent': 'openbroadcast.ch',
}

log = logging.getLogger(__name__)


def get_remote_votes(obj_ct, obj_pk):
    url = '{base_url}v1/rating/vote/{obj_ct}/{obj_pk}/'.format(
        base_url=API_BASE_URL,
        obj_ct=obj_ct,
        obj_pk=obj_pk,
    )

    log.debug('get votes - ct: {} - pk: {} - url: {}'.format(obj_ct, obj_pk, url))

    r = requests.get(url, headers=REQUEST_HEADERS, verify=True)

    try:
        data = r.json()
    except:
        data = None

    return data, r.status_code


def update_remote_vote(obj_ct, obj_pk, value, user_remote_id):
    url = '{base_url}v1/rating/vote/{obj_ct}/{obj_pk}/{value}/{user_remote_id}/'.format(
        base_url=API_BASE_URL,
        obj_ct=obj_ct,
        obj_pk=obj_pk,
        value=value,
        user_remote_id=user_remote_id,
    )

    log.debug('update vote - ct: {} - pk: {} - url: {}'.format(obj_ct, obj_pk, url))

    headers = REQUEST_HEADERS
    headers.update({
        'Authorization': 'ApiKey {username}:{api_key}'.format(
            username=API_BASE_AUTH['username'],
            api_key=API_BASE_AUTH['api_key'],
        )
    })

    r = requests.get(url, headers=headers, verify=True)

    try:
        data = r.json()
    except:
        data = None

    return data, r.status_code

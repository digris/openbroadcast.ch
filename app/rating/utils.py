# -*- coding: utf-8 -*-

import logging
import requests

from django.conf import settings

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)

REMOTE_BASE_URL = getattr(settings, 'REMOTE_BASE_URL', None)
REMOTE_API_AUTH_TOKEN = getattr(settings, 'REMOTE_API_AUTH_TOKEN', None)

REQUEST_HEADERS = {
    'User-Agent': 'openbroadcast.ch',
}

log = logging.getLogger(__name__)


def get_remote_votes(obj_ct, obj_uuid, user_id=None):
    url = '{base_url}/api/v2/rating/rating/{obj_ct}:{obj_uuid}/'.format(
        base_url=REMOTE_BASE_URL,
        obj_ct=obj_ct,
        obj_uuid=obj_uuid,
    )

    if user_id:
        url = '{}?user_id={}'.format(url, user_id)

    log.debug('get votes - ct: {} - pk: {} - url: {}'.format(obj_ct, obj_uuid, url))

    headers = REQUEST_HEADERS
    headers.update({
        'Authorization': 'Token {auth_token}'.format(
            auth_token=REMOTE_API_AUTH_TOKEN
        )
    })

    r = requests.get(url, headers=headers, verify=True)

    try:
        data = r.json()
    except:
        data = None

    return data, r.status_code


def put_remote_vote(obj_ct, obj_uuid, value, user_remote_id):
    url = '{base_url}/api/v2/rating/rating/{obj_ct}:{obj_uuid}/'.format(
        base_url=REMOTE_BASE_URL,
        obj_ct=obj_ct,
        obj_uuid=obj_uuid,
    )

    log.debug('update vote - ct: {} - uuid: {} - url: {}'.format(obj_ct, obj_uuid, url))

    headers = REQUEST_HEADERS
    headers.update({
        'Authorization': 'Token {auth_token}'.format(
            auth_token=REMOTE_API_AUTH_TOKEN
        )
    })

    payload = {
        "vote": value,
        "impersonate_user_id": user_remote_id
    }

    r = requests.put(url, headers=headers, json=payload, verify=True)

    try:
        data = r.json()
    except:
        data = None

    return data, r.status_code

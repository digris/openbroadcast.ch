# -*- coding: utf-8 -*-

import logging
import requests

from django.conf import settings


REMOTE_BASE_URL = getattr(settings, "REMOTE_BASE_URL", None)
REMOTE_API_AUTH_TOKEN = getattr(settings, "REMOTE_API_AUTH_TOKEN", None)

REQUEST_HEADERS = {
    "User-Agent": "openbroadcast.ch",
    "Authorization": "Token {auth_token}".format(auth_token=REMOTE_API_AUTH_TOKEN),
}

log = logging.getLogger(__name__)


def put_remote_event(obj_ct, obj_uuid, event_type, user_remote_id):
    url = "{base_url}/api/v2/atracker/event/{obj_ct}:{obj_uuid}/".format(
        base_url=REMOTE_BASE_URL, obj_ct=obj_ct, obj_uuid=obj_uuid
    )

    log.debug(
        "create event - ct: {} - uuid: {} event: {} - user: {} - url: {}".format(
            obj_ct, obj_uuid, event_type, user_remote_id, url
        )
    )

    payload = {"event_type": event_type, "impersonate_user_id": user_remote_id}

    r = requests.put(url, headers=REQUEST_HEADERS, json=payload, verify=True)

    try:
        data = r.json()
    except:
        data = None

    return data, r.status_code

# -*- coding: utf-8 -*-
import logging
import requests
from django.conf import settings

SITE_URL = getattr(settings, "SITE_URL")
GRAPH_URL = "https://graph.facebook.com/"
ACCESS_TOKEN = getattr(settings, "FACEBOOK_GRAPH_ACCESS_TOKEN")

log = logging.getLogger(__name__)


def clear_cache(path=""):
    url = GRAPH_URL
    clear_url = "{}{}".format(SITE_URL, path)

    log.debug("clear og cache: {}".format(clear_url))

    params = {"id": clear_url, "scrape": True, "access_token": ACCESS_TOKEN}

    try:
        r = requests.post(url=url, params=params, timeout=(2, 10))
        if r.status_code == 200:
            log.debug("sucessfully cleared cache for: {}".format(clear_url))
        else:
            log.warning(
                "unable to clear cache: {} - status: {}".format(
                    clear_url, r.status_code
                )
            )
    except requests.exceptions.RequestException as e:
        log.warning("unable to clear cache: {}".format(e))
        return

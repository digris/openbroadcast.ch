# -*- coding: utf-8 -*-
from __future__ import unicode_literals

try:
    from urlparse import urlparse, parse_qs
except ImportError:
    from urllib.parse import urlparse, parse_qs


EMBED_SERVICE_PROVIDERS = [
    # Video
    "Youtube",
    "Vimeo",
    # Audio
]


def process_provider_url(url, exclude_providers=[]):

    provider = None
    object_id = None

    # youtube
    if not "youtube" in exclude_providers:
        if "//youtube.com" in url or "//www.youtube.com" in url or "//youtu.be" in url:
            provider = "youtube"
            object_id = get_youtube_id_by_url(url)

    # vimeo
    if not "vimeo" in exclude_providers:
        if "//vimeo.com" in url:
            provider = "vimeo"
            object_id = get_vimeo_id_by_url(url)

    return provider, object_id


def get_youtube_id_by_url(url):
    """
    examples:
    - http://youtu.be/SA2iWivDJiE
    - http://www.youtube.com/watch?v=_oPAwA_Udwc&feature=feedu
    - http://www.youtube.com/embed/SA2iWivDJiE
    - http://www.youtube.com/v/SA2iWivDJiE?version=3&amp;hl=en_US
    """
    query = urlparse(url)
    if query.hostname == "youtu.be":
        return query.path[1:]
    if query.hostname in ("www.youtube.com", "youtube.com", "m.youtube.com"):
        if query.path == "/watch":
            p = parse_qs(query.query)
            return p["v"][0]
        if query.path[:7] == "/embed/":
            return query.path.split("/")[2]
        if query.path[:3] == "/v/":
            return query.path.split("/")[2]

    return None


def get_vimeo_id_by_url(url):
    """
    examples:
    - https://vimeo.com/178240219
    """
    query = urlparse(url)

    return query.path.split("/")[1]

# -*- coding: utf-8 -*-

import logging
import requests
import os
from urllib.parse import urlparse
from django.conf import settings

INTERNAL_SERVER_URL = getattr(settings, "ICECAST_INTERNAL_SERVER_URL")
PUBLIC_SERVER_URL = getattr(settings, "ICECAST_PUBLIC_SERVER_URL")

CODEC_EXT_MAP = {"mp3": "mp3", "flac": "flac", "ogg": "ogg"}
CODEC_MIME_MAP = {"audio/mpeg": "mp3", "application/ogg": "ogg"}

log = logging.getLogger(__name__)


def _parse_source(source):
    def parse_audio_info(audio_info_str):
        if not audio_info_str:
            return {}

        attrs = {}
        for bit in audio_info_str.split(";"):
            key = bit.split("=")[0]
            value = bit.split("=")[1]

            try:
                value = int(value)
            except TypeError:
                pass

            attrs.update({key: value})

        return attrs

    def parse_path(source):
        url = source.get("listenurl")
        return urlparse(url).path

    def parse_codec(source):
        path = parse_path(source)
        _, ext = os.path.splitext(path)

        if ext and ext[1:].lower() in CODEC_EXT_MAP:
            return CODEC_EXT_MAP[ext[1:].lower()]

        content_type = source.get("server_type")
        if content_type and content_type in CODEC_MIME_MAP:
            return CODEC_MIME_MAP[content_type]

        return

    def parse_bitrate(source):
        audio_info = parse_audio_info(source.get("audio_info"))
        return audio_info.get("bitrate")

    def parse_samplerate(source):
        audio_info = parse_audio_info(source.get("audio_info"))
        return audio_info.get("samplerate")

    def parse_content_type(source):
        return source.get("server_type")

    return {
        "path": parse_path(source),
        "codec": parse_codec(source),
        "bitrate": parse_bitrate(source),
        "samplerate": parse_samplerate(source),
        "content_type": parse_content_type(source),
    }


def _get_mountpoints(internal_server_url, public_server_url):

    url = "{}/status-json.xsl".format(internal_server_url.rstrip("/"))

    r = requests.get(url)
    sources = r.json().get("icestats", {}).get("source", [])

    mountponts = []
    for source in sources:
        mountpont = _parse_source(source)
        mountpont.update({"url": "{}{}".format(public_server_url, mountpont["path"])})
        mountponts.append(mountpont)

    return mountponts


def get_available_streams():
    internal_server_url = INTERNAL_SERVER_URL.rstrip("/")
    public_server_url = PUBLIC_SERVER_URL.rstrip("/")

    mountpoints = _get_mountpoints(internal_server_url, public_server_url)

    return mountpoints

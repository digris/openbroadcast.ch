# -*- coding: utf-8 -*-

from django.core.checks import register, Error
from django.conf import settings


REQUIRED_SETTINGS = (
    "REMOTE_BASE_URL",
    "API_BASE_URL",
    "API_BASE_AUTH",
    "STATIC_BASE_URL",
    "ASSET_BASE_URL",
    "STREAM_URL",
    "REMOTE_AUTH_ENDPOINT",
)


@register()
def check_remote_settings(app_configs, **kwargs):

    errors = []

    for key in REQUIRED_SETTINGS:
        # if getattr(settings, "DEBUG"):
        #     print("{}: {}".format(key, getattr(settings, key, "-")))

        if not getattr(settings, key, False):
            errors.append(
                Error(
                    "missing setting",
                    hint="binary location {} not specified in settings".format(key),
                    id="base.E001",
                )
            )

    return errors

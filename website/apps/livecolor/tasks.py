# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging
import os
from django.conf import settings
from project.celery import app
from livecolor.util.colors import set_colors_by_daytime, set_colors_by_mode

log = logging.getLogger(__name__)

@app.task
def update_colors(mode=None):
    log.info('updating colors - mode: {}'.format(mode))

    set_colors_by_mode(mode)

    #result = set_colors_by_daytime()

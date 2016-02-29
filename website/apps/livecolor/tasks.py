# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging
import os
from django.conf import settings
from project.celery import app
from livecolor.util.colors import set_colors_by_daytime

log = logging.getLogger(__name__)

@app.task
def update_colors():
    log.info('updating colors')
    result = set_colors_by_daytime()


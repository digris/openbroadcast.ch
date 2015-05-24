# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging
import os
from django.conf import settings
from project.celery import app
from onair.util import schedule

log = logging.getLogger(__name__)

@app.task
def update_schedule(range_start=3600, range_end=3600):

    log.info('updating schedule: %s to %s' % (range_start, range_end))
    result = schedule.fetch_from_api(range_start=range_start, range_end=range_end)




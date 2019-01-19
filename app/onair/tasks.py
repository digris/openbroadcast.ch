# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging

from app.celery import app
from .util import schedule

log = logging.getLogger(__name__)

@app.task
def update_schedule(range_start=3600, range_end=3600):
    log.info('updating schedule: %s to %s' % (range_start, range_end))
    schedule.fetch_from_api(range_start=range_start, range_end=range_end)

@app.task
def cleanup_schedule(max_age=3600):
    log.info('cleaning up schedule: max age: %s' % (max_age))
    schedule.cleanup_old_entries(max_age=max_age)

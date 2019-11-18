# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging

from celery.signals import worker_ready
from app.celery import app
from .schedule import scheduler

log = logging.getLogger(__name__)


@app.task
def update_schedule(time_range=(-600, 600)):
    result = scheduler.fetch_schedule_from_remote_api(time_range=time_range)
    log.info("processed {} items".format(len(result)))


@app.task
def cleanup_schedule(max_age=3600):
    result = scheduler.cleanup_local_schedule(max_age=max_age)
    log.info("cleaned schedule {}".format(result))


@app.task
def schedule_next_start():
    next_time_start = scheduler.schedule_next_start()
    schedule_next_start.apply_async(eta=next_time_start)


@worker_ready.connect
def celery_worker_ready(**kwargs):
    app.control.purge()
    log.info("celery worker ready. schedule next start in 10s")
    schedule_next_start.apply_async(countdown=10)

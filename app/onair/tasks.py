# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging

from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import timedelta
from celery.signals import worker_ready
from app.celery import app
from .util import schedule
from .models import ScheduledItem
from .api.serializers import ScheduledItemSerializer

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()


@app.task
def update_schedule(range_start=3600, range_end=3600):
    log.info("updating schedule: %s to %s" % (range_start, range_end))
    schedule.fetch_from_api(range_start=range_start, range_end=range_end)


@app.task
def cleanup_schedule(max_age=3600):
    log.info("cleaning up schedule: max age: %s" % (max_age))
    schedule.cleanup_old_entries(max_age=max_age)


@app.task(bind=True)
def schedule_next_item(self):
    log.debug("schedule next item")

    current_item = ScheduledItem.objects.get_current()
    next_item = ScheduledItem.objects.get_next()

    log.debug("current item: {}".format(current_item))

    # TODO: implement logic in separate place (signals?)
    if current_item:
        channel = "onair"
        data = {"type": "onair", "content": ScheduledItemSerializer(current_item).data}
        async_to_sync(channel_layer.group_send)(channel, data)

    if next_item:
        next_time_start = next_item.time_start
        log.debug("got item: {} - starts at: {}".format(next_item, next_time_start))

    else:
        next_time_start = timezone.now() + timedelta(seconds=60)
        log.debug("no item. wait 60 seconds...: {}".format(next_time_start))

    schedule_next_item.apply_async(eta=next_time_start)


@worker_ready.connect
def started_all(**kwargs):
    app.control.purge()
    print("*" * 72)
    print("CELERY STARTED")
    schedule_next_item.apply_async()

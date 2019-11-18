# -*- coding: utf-8 -*-
import logging
import datetime
import requests

from django.utils import timezone
from django.conf import settings
from onair.models import ScheduledItem
from . import signals as onair_signals

REMOTE_BASE_URL = getattr(settings, "REMOTE_BASE_URL", None)
REMOTE_API_AUTH_TOKEN = getattr(settings, "REMOTE_API_AUTH_TOKEN", None)

REQUEST_HEADERS = {
    "User-Agent": "openbroadcast.ch",
    "Authorization": "Token {auth_token}".format(auth_token=REMOTE_API_AUTH_TOKEN),
}

log = logging.getLogger(__name__)


class Scheduler(object):

    _current_item = None
    _next_item = None

    def __init__(self):
        pass

    @classmethod
    def fetch_schedule_from_remote_api(cls, time_range=(-3600, 3600)):
        log.debug("load schedule from remote api - range: {}".format(time_range))

        def get_flattened_schedule(time_range):
            url = "{base_url}/api/v2/abcast/flattened-schedule/".format(
                base_url=REMOTE_BASE_URL
            )
            params = {"time_range": "{},{}".format(time_range[0], time_range[1])}
            r = requests.get(url, params=params, headers=REQUEST_HEADERS, verify=True)
            if not r.status_code == 200:
                log.warning(
                    "unable to load remote data: status: {}".format(r.status_code)
                )
                return []

            return r.json()

        def delete_vanished_items(scheduled_items, time_range):
            log.debug("delete vanished items: {}".format(time_range))
            now = timezone.now()

            times = {
                "start": [item["time_start"] for item in scheduled_items],
                "end": [item["time_end"] for item in scheduled_items],
            }

            qs = ScheduledItem.objects.filter(
                time_end__gte=now + datetime.timedelta(seconds=time_range[0]),
                time_start__lte=now + datetime.timedelta(seconds=time_range[1]),
            ).order_by("-time_start")

            if len(times["start"]) + len(times["start"]) > 0:
                qs.exclude(
                    time_start__in=times["start"], time_end__in=times["end"]
                ).delete()
            else:
                qs.delete()

        def create_local_items(scheduled_items):
            for item in scheduled_items:

                ScheduledItem.objects.get_or_create(
                    time_start=item["time_start"],
                    time_end=item["time_end"],
                    name=item["verbose_name"],
                    emission_url=item["emission"],
                    item_url=item["item"],
                )

        flattened_schedule = get_flattened_schedule(time_range=time_range)

        if not flattened_schedule:
            return []

        scheduled_items = flattened_schedule.get("objects", [])
        delete_vanished_items(scheduled_items=scheduled_items, time_range=time_range)
        create_local_items(scheduled_items=scheduled_items)

        return scheduled_items

    @classmethod
    def cleanup_local_schedule(cls, max_age=3600):
        qs = ScheduledItem.objects.filter(
            time_end__lte=timezone.now() - datetime.timedelta(seconds=max_age)
        )
        log.debug(
            "clean up cached schedule. max. age: {} - num. items to delete: {}".format(
                max_age, qs.count()
            )
        )
        return qs.delete()

    @classmethod
    def reset_local_schedule(cls):
        qs = ScheduledItem.objects.all()
        log.debug("reset cached schedule. num. items to delete: {}".format(qs.count()))
        return qs.delete()

    def schedule_next_start(self):
        """
        this is running every time a new item starts playing (or periodically if no item scheduled)
        """

        # get current item, emit signal if changed since last run
        current_item = ScheduledItem.objects.get_current()
        if current_item and current_item != self._current_item:
            log.info(
                "current item changed: {} > {}".format(self._current_item, current_item)
            )
            onair_signals.item_start_playing.send(
                sender=self.__class__,
                item=current_item,
                time_start=current_item.time_start,
            )
            self._current_item = current_item
        else:
            log.debug("current unchanged: {}".format(current_item))

        # get next item, schedule rerun to start time (or retry interval)
        next_item = ScheduledItem.objects.get_next()

        if next_item:
            log.debug(
                "next item: {} - starts at: {}".format(next_item, next_item.time_start)
            )

            if (next_item.time_start - timezone.now()).total_seconds() < 90:
                return next_item.time_start

        return timezone.now() + datetime.timedelta(seconds=90)


scheduler = Scheduler()

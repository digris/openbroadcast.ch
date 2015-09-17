# -*- coding: utf-8 -*-
from __future__ import absolute_import
import logging
import os
from datetime import datetime, timedelta
from django.conf import settings
from project.celery import app
from contentproxy.models import CachedEvent, CachedMedia

log = logging.getLogger(__name__)

SECONDS_DUPLICATE = 30

@app.task
def create_cached_event(ct, ct_uuid, user, action):

    log.debug('event creation requested: %s %s %s %s' % (ct, ct_uuid, user, action))

    events = CachedEvent.objects.filter(created__range=[
        datetime.now() - timedelta(seconds=SECONDS_DUPLICATE),
        datetime.now() + timedelta(seconds=SECONDS_DUPLICATE)
    ], ct=ct, ct_uuid=ct_uuid, user=user, action=action)

    if not events.exists():
        event = CachedEvent(
            ct = ct,
            ct_uuid = ct_uuid,
            user = user,
            action = action
        )
        event.save()
        log.debug('event created: %s %s %s %s' % (ct, ct_uuid, user, action))
    else:
        log.debug('duplicate event, skipped: %s %s %s %s' % (ct, ct_uuid, user, action))


@app.task
def cleanup_cache(max_age=3600):
    log.info('cleaning up contentproxy cache: max age: %s' % (max_age))
    old_entries = CachedMedia.objects.filter(
        updated__lte=datetime.now() - timedelta(seconds=max_age)
    )
    log.debug('%s cached items to delete' % old_entries.count())
    old_entries.delete()


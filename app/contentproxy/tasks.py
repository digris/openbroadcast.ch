# -*- coding: utf-8 -*-
import logging
from threading import Timer
import threading
import time

from datetime import datetime, timedelta
from app.celery import app
from .models import CachedMedia
from .utils import put_remote_event

log = logging.getLogger(__name__)


def debounce(wait):
    """ Decorator that will postpone a functions
        execution until after wait seconds
        have elapsed since the last time it was invoked. """

    def decorator(fn):
        def debounced(*args, **kwargs):
            def call_it():
                debounced._timer = None
                debounced._last_call = time.time()
                return fn(*args, **kwargs)

            time_since_last_call = time.time() - debounced._last_call
            if time_since_last_call >= wait:
                return call_it()

            if debounced._timer is None:
                debounced._timer = threading.Timer(wait - time_since_last_call, call_it)
                debounced._timer.start()

        debounced._timer = None
        debounced._last_call = 0

        return debounced

    return decorator


@app.task
@debounce(wait=10)
def create_event(obj_ct, obj_uuid, event_type, user_remote_id):
    log.debug('create remote event')
    put_remote_event(obj_ct, obj_uuid, event_type, user_remote_id)



@app.task
def cleanup_cache(max_age=3600):
    log.info("cleaning up contentproxy cache: max age: %s" % (max_age))
    old_entries = CachedMedia.objects.filter(
        updated__lte=datetime.now() - timedelta(seconds=max_age)
    )
    log.debug("%s cached items to delete" % old_entries.count())
    old_entries.delete()

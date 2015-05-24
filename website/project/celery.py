# -*- coding: utf-8 -*-
from __future__ import absolute_import
import os
from django.conf import settings
from celery import Celery
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

app = Celery('project')

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

"""
app.conf.update(
    CELERYBEAT_SCHEDULER = "djcelery.schedulers.DatabaseScheduler",
    CELERY_RESULT_BACKEND='djcelery.backends.database:DatabaseBackend',
    #BROKER_URL = 'django://',
)
"""


"""
BROKER_URL = 'django://'
CELERY_RESULT_BACKEND='djcelery.backends.database:DatabaseBackend'
"""
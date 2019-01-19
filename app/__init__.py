from __future__ import absolute_import

from .celery import app as celery_app

__version__ = '0.1.1'
__all__ = ['celery_app']

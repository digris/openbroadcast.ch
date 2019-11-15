# -*- coding: utf-8 -*-

import logging
from django.conf import settings
from django.db import models
from base.models.mixins import TimestampedModelMixin, UUIDModelMixin


log = logging.getLogger(__name__)


class StreamEvent(TimestampedModelMixin, UUIDModelMixin, models.Model):
    """
    stores events collectded from icecast logfiles - using `icewatch`
    https://gitlab.com/ohrstrom/icewatch
    """

    ip = models.GenericIPAddressField(null=True, blank=True)
    method = models.CharField(
        verbose_name="request method", max_length=6, null=True, blank=True
    )
    path = models.CharField(
        verbose_name="mountpoint", max_length=250, null=True, blank=True
    )
    status = models.PositiveIntegerField(null=True, blank=True)
    bytes_sent = models.PositiveIntegerField(null=True, blank=True)
    referer = models.CharField(max_length=500, null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    seconds_connected = models.PositiveIntegerField(null=True, blank=True)
    time_start = models.DateTimeField(null=True, blank=True)
    time_end = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = "listener"
        verbose_name = "Stream Event"
        verbose_name_plural = "Stream Event"
        ordering = ("-created",)
        # permissions = [('can_create_stream_event', 'Can create Stream Event')]

    def __str__(self):
        return "{}".format(self.path)

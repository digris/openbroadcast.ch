# -*- coding: utf-8 -*-

from django.db import models
from base.models.mixins import TimestampedModelMixin


class AnonymousVote(TimestampedModelMixin, models.Model):

    value = models.SmallIntegerField(null=True, blank=True)

    session_key = models.CharField(max_length=64, db_index=True, null=True)
    obj_ct = models.CharField(max_length=64, db_index=True, null=True)
    obj_uuid = models.CharField(max_length=36, db_index=True, null=True)

    class Meta:
        app_label = "rating"
        verbose_name = "Anonymous Vote"
        verbose_name_plural = "Anonymous Votes"
        unique_together = ["session_key", "obj_ct", "obj_uuid"]

    def __str__(self):
        if self.value:
            return "{}".format(self.value)
        return "{}".format(self.pk)

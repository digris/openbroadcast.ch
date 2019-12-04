# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.translation import ugettext_lazy as _
from django.contrib import admin

from .models import Beat


@admin.register(Beat)
class BeatAdmin(admin.ModelAdmin):
    date_hierarchy = "updated"
    list_display = ["__str__", "updated", "last_beat", "ip", "is_online"]

    def last_beat(self, obj):
        if obj.last_beat:
            return "{0} seconds ago".format(obj.last_beat.seconds)

    last_beat.short_description = _("Last beat")
    last_beat.allow_tags = True

    def is_online(self, obj):
        if obj.last_beat:
            return obj.last_beat.seconds < 130

    is_online.short_description = _("Online")
    is_online.boolean = True

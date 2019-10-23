# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.translation import ugettext as _
from .models import ScheduledItem


class ScheduledItemAdmin(admin.ModelAdmin):

    date_hierarchy = "time_start"

    list_display = (
        "name",
        "is_onair",
        "starts_in",
        "ends_in",
        "time_start",
        "time_end",
        "emission_url",
        "item_url",
    )

    def is_onair(self, obj):
        return obj.is_onair

    is_onair.short_description = _("On Air")
    is_onair.boolean = True

    def starts_in(self, obj):
        return obj.starts_in

    starts_in.short_description = _("Starts in")

    def ends_in(self, obj):
        return obj.ends_in

    ends_in.short_description = _("Ends in")


admin.site.register(ScheduledItem, ScheduledItemAdmin)

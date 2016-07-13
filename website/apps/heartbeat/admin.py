# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.translation import ugettext_lazy as _
from django.contrib import admin
from django.utils import timezone, timesince
from .models import Beat


@admin.register(Beat)
class BeatAdmin(admin.ModelAdmin):
    date_hierarchy = 'updated'
    list_display = ['user', 'updated', 'last_beat',]


    def last_beat(self, obj):

        if obj.updated:
            diff = timezone.now() - obj.updated
            return '{0} seconds ago'.format(diff.seconds)

    last_beat.short_description = _('Last beat')
    last_beat.allow_tags = True

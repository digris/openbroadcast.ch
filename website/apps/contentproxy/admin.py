#-*- coding: utf-8 -*-
from django.contrib import admin
from models import CachedMedia, CachedEvent

admin.site.register(CachedEvent)

class CachedMediaAdmin(admin.ModelAdmin):

    date_hierarchy = 'created'
    list_display = ('uuid', 'created', 'updated', 'status')

admin.site.register(CachedMedia, CachedMediaAdmin)

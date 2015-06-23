#-*- coding: utf-8 -*-
from django.contrib import admin
from models import CachedMedia, CachedEvent

admin.site.register(CachedEvent)

class CachedMediaAdmin(admin.ModelAdmin):

    list_display = ('uuid', 'status')

admin.site.register(CachedMedia, CachedMediaAdmin)

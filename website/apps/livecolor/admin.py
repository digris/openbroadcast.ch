# -*- coding: utf-8 -*-
from __future__ import  unicode_literals

from django.contrib import admin
from .models import Colorset

class ColorestAdmin(admin.ModelAdmin):

    def has_add_permission(self, request):
        # limit to one instance
        return False if self.model.objects.count() > 0 else True

admin.site.register(Colorset, ColorestAdmin)

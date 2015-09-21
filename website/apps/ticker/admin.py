# -*- coding: utf-8 -*-
from django.contrib import admin
from django import forms
from django.utils.translation import ugettext_lazy as _
from pagedown.widgets import AdminPagedownWidget
from base.fields.extra import MarkdownTextField
from django.db.models.fields import TextField
from cms.admin.placeholderadmin import PlaceholderAdminMixin

from models import Article


class ArticleAdmin(PlaceholderAdminMixin, admin.ModelAdmin):

    list_display = ['name', 'subline', 'published']
    search_fields = ['name', 'subline']
    date_hierarchy = 'created'
    #list_filter = ['sites', ]
    #readonly_fields = ['status', 'folder',]
    save_on_top = True




    __fieldsets = (

        (None, {
            'fields':
                (
                    'name',
                    'subline',
                ),
        }),

        ("Publishing", {
            'fields': (
                'published',
            ),
        }),
    )


    formfield_overrides = {
        TextField: {'widget': forms.Textarea(attrs={'rows':3, 'cols':32}) },
    }

admin.site.register(Article, ArticleAdmin)

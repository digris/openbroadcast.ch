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

    list_display = ['name', 'teaser_info', 'author', 'publish', 'is_public']
    search_fields = ['name', 'teaser']
    date_hierarchy = 'created'
    #list_filter = ['sites', ]
    #readonly_fields = ['status', 'folder',]
    raw_id_fields = ['author',]
    save_on_top = True

    fieldsets = (

        (None, {
            'fields':
                (
                    'name',
                    'slug',
                    'teaser',
                    'key_image',
                    'author',
                ),
        }),

        ("Publishing", {
            'fields': (
                'publish',
            ),
        }),
    )

    def teaser_info(self, obj):
        teaser = obj.get_teaser()
        tpl = u"""<p>{teaser}</p>""".format(teaser=teaser[0:50] + '...' if teaser else '-',)
        return tpl
    teaser_info.short_description = _('Teaser')
    teaser_info.allow_tags = True

    def is_public(self, obj):
        return obj.public
    is_public.boolean = True


    formfield_overrides = {
        TextField: {'widget': forms.Textarea(attrs={'rows':3, 'cols':32}) },
    }

    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = request.user
        obj.save()


admin.site.register(Article, ArticleAdmin)

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings

from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool

from .models import Media

class MediaEmbedPlugin(CMSPluginBase):

    model = Media

    module = 'embed'
    name = 'Multimedia'
    #render_template = "media_embed/default.html"

    text_enabled = True

    readonly_fields = ['provider', 'object_id']

    def get_render_template(self, context, instance, placeholder):
        return 'media_embed/{0}.html'.format(instance.provider)


    def render(self, context, instance, placeholder):
        context.update({
            'instance': instance,
            'placeholder': placeholder,
        })
        return context


    def icon_src(self, instance):
        return settings.STATIC_URL + "media_embed/img/icon.{provider}.png".format(provider=instance.provider)


    def icon_alt(self, instance):
        return instance.url


plugin_pool.register_plugin(MediaEmbedPlugin)

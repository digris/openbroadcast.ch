# -*- coding: utf-8 -*-
from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.utils.translation import ugettext as _

from models import TeaserPlugin as TeaserPluginModel

@plugin_pool.register_plugin
class TeaserPlugin(CMSPluginBase):
    model = TeaserPluginModel
    module = _("Teaser")
    name = _("Teaser")
    render_template = "teaser/cmsplugin/teaser.html"

    class Meta:
        app_label = 'teaser'

    def render(self, context, instance, placeholder):


        context.update({
            'instance': instance,
            'slides': instance.teaser.slides.all(),
            'object': instance.teaser,
            'placeholder': placeholder,
        })
        return context


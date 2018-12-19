# -*- coding: utf-8 -*-
from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.utils.translation import ugettext as _

from .models import PartnerlinkListPlugin as PartnerlinkListPluginModel
from .models import Partnerlink


@plugin_pool.register_plugin
class PartnerlinkListPlugin(CMSPluginBase):

    model = PartnerlinkListPluginModel
    name = _("Partnerlink List")
    render_template = "partnerlink/cmsplugin/partnerlink_list.html"

    def render(self, context, instance, placeholder):

        objects = Partnerlink.objects.order_by('category').all()

        context.update({
            'instance': instance,
            'objects': objects,
            'placeholder': placeholder,
        })

        return context

# -*- coding: utf-8 -*-
import requests
from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.conf import settings
from django.utils.translation import ugettext as _

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)


@plugin_pool.register_plugin
class ProgramPlugin(CMSPluginBase):
    #model = ProfileListPluginModel
    name = _("Program Plugin")
    module = 'Program'
    render_template = "program/cmsplugin/program.html"

    def render(self, context, instance, placeholder):
        #objects = Profile.objects.all()

        uri = 'v1/abcast/channel/1/program/'

        #print API_BASE_URL
        #print uri

        r = requests.get(API_BASE_URL + uri, verify=False)

        objects = r.json().get('objects', [])

        context.update({
            'instance': instance,
            'objects': objects,
            'placeholder': placeholder,
        })
        return context

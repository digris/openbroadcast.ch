# -*- coding: utf-8 -*-
import requests
import dateutil
import datetime
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

        uri = 'v1/abcast/channel/1/program/'
        r = requests.get(API_BASE_URL + uri, verify=True)
        objects = r.json().get('objects', [])

        # hackish way to extract emissions (we don't need dayparts here..)
        emissions = []
        emission_ids = []
        for obj in objects:
            for emission in reversed(obj['emissions']):
                if not emission['id'] in emission_ids:
                    emission['is_history'] = dateutil.parser.parse(emission['time_end']) < datetime.datetime.now()
                    emission_ids.append(emission['id'])
                    emissions.append(emission)

        context.update({
            'instance': instance,
            'objects': objects,
            'emissions': emissions,
            'placeholder': placeholder,
        })
        return context

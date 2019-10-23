# -*- coding: utf-8 -*-
import requests
import dateutil
import datetime
from django.utils import timezone
from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.conf import settings
from django.utils.translation import ugettext as _

from .utils import get_scheduled_emissions

API_BASE_URL = getattr(settings, "API_BASE_URL", None)


@plugin_pool.register_plugin
class ProgramPlugin(CMSPluginBase):
    name = _("Program Plugin")
    cache = False
    module = "Program"
    render_template = "program/cmsplugin/program.html"

    def render(self, context, instance, placeholder):

        emissions = get_scheduled_emissions(date=timezone.now().date())

        context.update(
            {"instance": instance, "emissions": emissions, "placeholder": placeholder}
        )
        return context

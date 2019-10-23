from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool

from django.utils.translation import ugettext as _

from coverage.models import CoverageMap


@plugin_pool.register_plugin
class CoverageMapPlugin(CMSPluginBase):

    model = CoverageMap
    name = _("Coverage MAp Plugin")
    module = "Coverage"
    render_template = "coverage/cmsplugin/coverage_map.html"

    def render(self, context, instance, placeholder):
        context.update({"instance": instance, "placeholder": placeholder})
        return context

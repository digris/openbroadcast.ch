from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool

from django.utils.translation import ugettext as _


@plugin_pool.register_plugin
class WebstreamPlugin(CMSPluginBase):

    name = _("Webstream Plugin")
    module = "listener"
    render_template = "listener/cmsplugin/webstream.html"

    def render(self, context, instance, placeholder):
        context.update({"instance": instance, "placeholder": placeholder})
        return context

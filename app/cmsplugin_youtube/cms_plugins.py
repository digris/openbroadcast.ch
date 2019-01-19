from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool

from django.utils.translation import ugettext as _

from cmsplugin_youtube.models import YouTube as YouTubeModel




class YouTubePlugin(CMSPluginBase):
    model = YouTubeModel
    name = _("YouTube Video")
    render_template = "cmsplugin_youtube/embed_tubeplayer.html"
    text_enabled = True

    def render(self, context, instance, placeholder):

        context.update({
            'instance': instance,
            'placeholder': placeholder,
        })
        return context


plugin_pool.register_plugin(YouTubePlugin)

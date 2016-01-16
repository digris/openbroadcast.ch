from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool

from django.utils.translation import ugettext as _

from team.models import Profile

@plugin_pool.register_plugin
class ProfileListPlugin(CMSPluginBase):
    #model = ProfileListPluginModel
    name = _("Team Plugin")
    module = 'Team'
    render_template = "team/cmsplugin/team_list.html"

    def render(self, context, instance, placeholder):
        objects = Profile.objects.all()
        context.update({
            'instance': instance,
            'objects': objects,
            'placeholder': placeholder,
        })
        return context

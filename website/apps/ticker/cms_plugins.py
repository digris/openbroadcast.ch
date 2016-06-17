# -*- coding: utf-8 -*-
from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.utils.translation import ugettext as _
from django.contrib.sites.models import Site

from models import Article

@plugin_pool.register_plugin
class ArticlePlugin(CMSPluginBase):

    module = _("Ticker Base")
    name = _("Published Articles")
    render_template = "ticker/cmsplugin/article_list.html"

    def render(self, context, instance, placeholder):

        request = context['request']
        if request.user.is_staff:
            qs = Article.objects.all()
        else:
            qs = Article.objects.published()

        context.update({
            'instance': instance,
            'object_list': qs,
            'placeholder': placeholder,
        })
        return context

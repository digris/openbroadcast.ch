# -*- coding: utf-8 -*-
from django.utils.translation import ugettext_lazy as _
from cms.app_base import CMSApp
from cms.apphook_pool import apphook_pool
from .menu import ArticleMenu

@apphook_pool.register
class ArticleApp(CMSApp):

    name = _("Ticker Base")
    urls = ["ticker.urls"]
    menus = [ArticleMenu]

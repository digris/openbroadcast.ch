# -*- coding: utf-8 -*-
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse
from menus.base import Modifier, Menu, NavigationNode
from menus.menu_pool import menu_pool
from cms.menu_bases import CMSAttachMenu

class ArticleMenu(CMSAttachMenu):
    
    name = _("Ticker Base Menu")
    
    def get_nodes(self, request):
        nodes = []
        return nodes

menu_pool.register_menu(ArticleMenu)



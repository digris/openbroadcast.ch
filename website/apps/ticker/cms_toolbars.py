from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _
from cms.toolbar_pool import toolbar_pool
from cms.toolbar.items import Break
from cms.cms_toolbars import ADMIN_MENU_IDENTIFIER, ADMINISTRATION_BREAK
from cms.toolbar_base import CMSToolbar

@toolbar_pool.register
class ArticleToolbar(CMSToolbar):

    def populate(self):

        menu = self.toolbar.get_or_create_menu('ticker-app', _('News'))
        url = reverse('admin:ticker_article_changelist')
        #menu.add_sideframe_item(_('Play List'), url=url)
        menu.add_link_item(_('Article List'), url=url)

        url = reverse('admin:ticker_article_add')
        menu.add_link_item(_('Add Article'), url=url)



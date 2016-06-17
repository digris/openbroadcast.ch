# -*- coding: utf-8 -*-
import datetime
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.utils.translation import ugettext_lazy as _
from django.http import Http404, HttpResponseRedirect
from django.http import HttpResponse
from django.views.generic import DetailView, ListView
from django.core.urlresolvers import reverse

from models import Article

class ArticleDetailView(DetailView):

    model = Article
    slug_field = 'slug'
    template_name = 'ticker/article_detail.html'

    def get(self, request, **kwargs):
        self.object = self.get_object()
        context = self.get_context_data(object=self.object)
        menu = request.toolbar.get_or_create_menu('ticker-app', _('News'))
        menu.add_link_item(_('Edit Article'), url=reverse('admin:ticker_article_change', args=[self.object.pk]))
        menu.add_modal_item(_('Artikel Quickedit'), url=reverse('admin:ticker_article_change', args=[self.object.pk]))

        return self.render_to_response(context)

    def get_context_data(self, **kwargs):
        context = kwargs
        return context

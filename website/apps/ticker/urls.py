# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from views import ArticleDetailView

urlpatterns = patterns('ticker.views',
    url(r'^(?P<slug>[-\w]+)/$', ArticleDetailView.as_view(), name='ticker-article-detail'),
)
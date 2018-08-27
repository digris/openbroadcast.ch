from __future__ import absolute_import, unicode_literals

from django.conf.urls import url

from views import ArticleDetailView

urlpatterns = [
    url(r'^(?P<slug>[-\w]+)/$', ArticleDetailView.as_view(), name='ticker-article-detail'),
]

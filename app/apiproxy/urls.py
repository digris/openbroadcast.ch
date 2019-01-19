from __future__ import absolute_import, unicode_literals

from django.conf.urls import include, url

from .views import ResourceView

urlpatterns = [
    url(r'^(?P<path>.*)$', ResourceView.as_view(), name='apiproxy-root'),
]

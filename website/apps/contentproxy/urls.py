from __future__ import absolute_import, unicode_literals

from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^media-asset/format/(?P<uuid>[-\w]+)/default.(?P<encoding>\w+)$', views.MediaResourceView.as_view()),
    url(r'^media-asset/format/(?P<uuid>[-\w]+)/default.(?P<encoding>\w+)$', views.MediaResourceView.as_view()),
    url(r'^media-asset/format/(?P<uuid>[-\w]+)/default.(?P<encoding>\w+)/$', views.MediaResourceView.as_view()),

    url(r'^static-proxy/(?P<path>.*)$', views.StaticResourceView.as_view()),
]

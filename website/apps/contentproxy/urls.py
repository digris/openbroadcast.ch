from django.conf.urls import patterns, include, url

from contentproxy.views import MediaResourceView

urlpatterns = [
    #url(r'^content/library/tracks/(?P<uuid>[-\w]+)/stream.mp3$', MediaResourceView.as_view()),
    url(r'^media-asset/format/(?P<uuid>[-\w]+)/default.mp3$', MediaResourceView.as_view()),
    url(r'^media-asset/format/(?P<uuid>[-\w]+)/default.mp3/$', MediaResourceView.as_view()),
]

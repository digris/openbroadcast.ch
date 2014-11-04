from django.conf.urls import url, patterns


urlpatterns = patterns('',
    url(r'^base/$', 'bplayer.views.base'),
)
from django.conf.urls import url, patterns


urlpatterns = patterns('',
    url(r'^dialog/$', 'remotelink.views.dialog', name='remotelink-dialog'),
)
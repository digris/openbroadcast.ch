from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^time/$', 'stationtime.views.current_time', name='stationtime-current-time'),
)


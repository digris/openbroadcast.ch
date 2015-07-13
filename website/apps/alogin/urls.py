from django.conf.urls import url, patterns


urlpatterns = patterns('',
    url(r'^login/$', 'alogin.views.alogin_login', name='alogin-login'),
    url(r'^register/$', 'alogin.views.alogin_register', name='alogin-register'),
    url(r'^logout/$', 'alogin.views.alogin_logout', name='alogin-logout'),
    #
    url(r'^profile/$', 'alogin.views.alogin_profile', name='alogin-profile'),
)
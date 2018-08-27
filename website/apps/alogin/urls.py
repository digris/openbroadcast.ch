from __future__ import absolute_import, unicode_literals

from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^login/$', views.alogin_login, name='alogin-login'),
    url(r'^register/$', views.alogin_register, name='alogin-register'),
    url(r'^logout/$', views.alogin_logout, name='alogin-logout'),
    #
    url(r'^profile/$', views.alogin_profile, name='alogin-profile'),
]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url
from django.contrib.auth.views import logout

from .views import (UserLoginView, UserRegisterView, UserDetailView,
                    PasswordRecoverView, PasswordRecoverSentView, PasswordResetView, PasswordResetDoneView)

app_name = 'account'
urlpatterns = [
    # login/logout flow
    url(r'^logout/$', logout, {'next_page': '/'},  name='logout'),

    # login / register partials (ajax/modal usage)
    url(r'^p/login/$', UserLoginView.as_view(), name='login-partial'),
    url(r'^p/sign-up/$', UserRegisterView.as_view(), name='register-partial'),

    # password reset flow
    url(r'^password/recover/(?P<signature>.+)/$', PasswordRecoverSentView.as_view(), name='password_recover_sent'),
    url(r'^password/recover/$', PasswordRecoverView.as_view(), name='password_recover'),
    url(r'^password/reset/done/$', PasswordResetDoneView.as_view(), name='password_reset_done'),
    url(r'^password/reset/(?P<token>[\w:-]+)/$', PasswordResetView.as_view() ,name='password_reset'),

    # user views
    url(r'^user/(?P<uuid>[\w:-]+)/$', UserDetailView.as_view(), name='user-detail'),

]

# -*- coding: utf-8 -*-

from django.conf.urls import url
from django.contrib.auth.views import logout

from . import views

app_name = "account"
urlpatterns = [
    # login/logout flow
    # url(r'^logout/$', logout, {'next_page': '/'},  name='logout'),
    url(
        r"^logout/$", views.UserLogoutView.as_view(), {"next_page": "/"}, name="logout"
    ),
    # login / register partials (ajax/modal usage)
    url(r"^p/login/$", views.UserLoginView.as_view(), name="login"),
    url(r"^p/sign-up/$", views.UserRegisterView.as_view(), name="register"),
    # password reset flow
    url(
        r"^password/recover/(?P<signature>.+)/$",
        views.PasswordRecoverSentView.as_view(),
        name="password_recover_sent",
    ),
    url(
        r"^password/recover/$",
        views.PasswordRecoverView.as_view(),
        name="password_recover",
    ),
    url(
        r"^password/reset/done/$",
        views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    url(
        r"^password/reset/(?P<token>[\w:-]+)/$",
        views.PasswordResetView.as_view(),
        name="password_reset",
    ),
    # user views
    url(
        r"^user/(?P<uuid>[\w:-]+)/$", views.UserDetailView.as_view(), name="user-detail"
    ),
]

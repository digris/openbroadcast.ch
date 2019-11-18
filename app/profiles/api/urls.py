# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

urlpatterns = [
    url(
        r"^profiles/(?P<profile_id>\d+)/$",
        views.profile_detail_proxy,
        name="profiles-profiles-detail",
    )
]

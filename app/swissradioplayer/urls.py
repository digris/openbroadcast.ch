# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.conf.urls import url

from . import views

app_name = "swissradioplayer"
urlpatterns = [
    url(r"^console/$", views.ConsoleIndexView.as_view(), name="console-index")
]

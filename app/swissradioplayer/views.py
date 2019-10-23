# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging

from django.apps import apps
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.http import (
    HttpResponse,
    StreamingHttpResponse,
    HttpResponseForbidden,
    HttpResponseRedirect,
)
from django.views.generic import (
    DetailView,
    TemplateView,
    UpdateView,
    CreateView,
    ListView,
    FormView,
    View,
)
from django.contrib.contenttypes.models import ContentType


log = logging.getLogger(__name__)


class ConsoleIndexView(TemplateView):

    template_name = "swissradioplayer/console_index.html"

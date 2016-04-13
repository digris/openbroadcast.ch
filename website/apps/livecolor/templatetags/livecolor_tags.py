# -*- coding: utf-8 -*-
from __future__ import  unicode_literals

from django import template
from django.conf import settings

from livecolor.models import Colorset

DEFAULT_BG = getattr(settings, 'LIVECOLOR_DEFAULT_BG', '#efefef')
DEFAULT_FG = getattr(settings, 'LIVECOLOR_DEFAULT_FG', '#000000')

register = template.Library()

@register.assignment_tag
def current_colors():

    qs = Colorset.objects.all()
    if qs.exists():
        colors = {
            'bg': qs[0].bg_color,
            'fg': qs[0].fg_color,
        }
    else:
        colors = {
            'bg': DEFAULT_BG,
            'fg': DEFAULT_FG,
        }

    return colors

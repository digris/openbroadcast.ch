# -*- coding: utf-8 -*-
import re

from django import template
from django.utils.safestring import mark_safe

register = template.Library()


@register.inclusion_tag('bplayer/templatetags/_inline.html', takes_context=True)
def bplayer_inline(context):
    playlist = None
    context.update({'current_playlist': playlist})
    return context

# -*- coding: utf-8 -*-
from django import template
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings

SOCKET_SERVER = getattr(settings, 'PUSHY_SOCKET_SERVER', None)
DEBUG = getattr(settings, 'PUSHY_DEBUG', False)

if not SOCKET_SERVER:
    raise ImproperlyConfigured('PUSHY_SOCKET_SERVER in settings is required!')

register = template.Library()

@register.inclusion_tag('pushy_client/templatetags/pushy_client_scripts.html', takes_context=True)
def pushy_client_scripts(context):
    context.update({'SOCKET_SERVER': SOCKET_SERVER})
    context.update({'DEBUG': DEBUG})
    return context
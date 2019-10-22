# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import re
import logging
import json
import urllib

from django import template
from django.apps import apps
from django.utils.safestring import mark_safe
from django.conf import settings
from social_core.backends.utils import load_backends

from ..settings import BACKEND_DETAILS


log = logging.getLogger(__name__)

register = template.Library()


@register.inclusion_tag('account/templatetags/_inline.html', takes_context=True)
def account_inline(context):
    return context

@register.inclusion_tag('account/templatetags/_backend_detail.html', takes_context=True)
def backend_detail(context, backend_key, action='login'):

    if backend_key in BACKEND_DETAILS:

        be = BACKEND_DETAILS[backend_key].copy()
        be.update({
            'action': action,
            'key': backend_key,
        })

        context.update(be)

    else:

        context.update({
            'action': action,
            'key': backend_key,
            'name': backend_key,
        })

    return context


@register.inclusion_tag('account/templatetags/_user_pickup.html', takes_context=True)
def user_pickup(context):

    c = context['request'].COOKIES.get('auth_pickup', None)
    actions = {}
    try:
        _pickup = json.loads(urllib.unquote(c))
        model = apps.get_model(*_pickup['ct'].split('.'))
        obj = model.objects.get(uuid=_pickup['uuid'])

        _model_name = _pickup['ct'].split('.')[1]

        if not _model_name in actions:
            actions[_model_name] = []

        actions[_model_name].append({
            'action': _pickup['action'],
            'obj': obj
        })

    except Exception as e:
        log.info('unable to load pickup action: {}'.format(e))

    context['actions'] = actions

    return context

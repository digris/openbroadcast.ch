# -*- coding: utf-8 -*-
from django import template

register = template.Library()


@register.inclusion_tag('invitation/templatetags/claim_form.html', takes_context=True)
def invitation_claim_form(context):
    request = context.get('request', None)
    return context



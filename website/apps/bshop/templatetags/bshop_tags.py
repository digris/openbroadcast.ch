# -*- coding: utf-8 -*-
from django import template
from bshop.views import shop

register = template.Library()

@register.inclusion_tag('bshop/templatetags/cart_summary.html', takes_context=True)
def cart_summary(context):
    request = context.get('request', None)
    order = shop.order_from_request(request, create=False)
    context.update({'order': order})
    return context


@register.inclusion_tag('bshop/templatetags/cart_inline.html', takes_context=True)
def cart_inline(context):
    request = context.get('request', None)
    order = shop.order_from_request(request, create=False)
    context.update({'order': order})
    return context

@register.inclusion_tag('bshop/templatetags/ajax_cart.html', takes_context=True)
def ajax_cart(context):
    request = context.get('request', None)
    #order = shop.order_from_request(request, create=False)
    #context.update({'order': order})
    return context



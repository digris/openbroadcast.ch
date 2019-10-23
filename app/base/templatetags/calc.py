from django import template

register = template.Library()


@register.filter
def multiply(value, arg):
    return int(value) * int(arg)


@register.filter
def divide(value, arg):
    return int(int(value) / int(arg))


@register.filter
def subtract(value, arg):
    return int(int(value) - int(arg))


@register.filter
def squaretuple(value):
    return "%sx%s" % (value, value)


@register.filter
def halftuple(value):
    return "%sx%s" % (value, int(value) / 2)

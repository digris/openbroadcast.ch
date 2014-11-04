import markdown as mkdn

from django import template
from django.utils.safestring import mark_safe

from base.util.AsciiDammit import asciiDammit

register = template.Library()


@register.filter()
def markdown(value):
    #value = asciiDammit(value)
    value = value.replace('***', " <br>")
    return mark_safe(mkdn.markdown(value, enable_attributes=False))
    # return mark_safe(mkdn.markdown(value, safe_mode='escape'))
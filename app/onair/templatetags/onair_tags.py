import datetime
from django import template

from ..models import ScheduledItem

register = template.Library()


@register.simple_tag
def onair_item():
    obj = ScheduledItem.objects.get_current()
    if not obj:
        return
    return obj.item

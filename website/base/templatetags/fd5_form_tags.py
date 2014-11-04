from django import forms, template
from django.db.models import ObjectDoesNotExist
from django.template.loader import render_to_string


register = template.Library()

def _type_class(item):
    if isinstance(item.field.widget, forms.CheckboxInput):
        return 'checkbox'
    elif isinstance(item.field.widget, forms.DateInput):
        return 'date'
    elif isinstance(item.field.widget, (
            forms.RadioSelect, forms.CheckboxSelectMultiple)):
        return 'list'
    return ''



@register.inclusion_tag('fd5/_form_item.html')
def fd5_form_item(item, additional_classes=None):
    """
    Helper for easy displaying of form items::

        {% for field in form %}{% form_item field %}{% endfor %}
    """

    return {
        'item': item,
        'additional_classes': additional_classes,
        'is_checkbox': isinstance(item.field.widget, forms.CheckboxInput),
        'type_class': _type_class(item),
        }


@register.inclusion_tag('fd5/_form_item_plain.html')
def fd5_form_item_plain(item, additional_classes=None):
    """
    Helper for easy displaying of form items without any additional
    tags (table cells or paragraphs) or labels::

        {% form_item_plain field %}
    """

    return {
        'item': item,
        'additional_classes': additional_classes,
        'is_checkbox': isinstance(item.field.widget, forms.CheckboxInput),
        'type_class': _type_class(item),
        }



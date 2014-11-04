from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.dispatch import receiver

import plata
from plata.shop.models import Order
from plata.shop.signals import order_confirmed



def update_items_in_stock(order):

    for item in order.items.select_related('product'):
        item.product.items_in_stock = (item.product.items_in_stock - item.quantity)
        item.product.save()


def validate_order_stock_available(order):

    errors = []
    for item in order.items.select_related('product'):
        if item.quantity > item.product.items_in_stock:
            errors.append('%s | ordered: %s / available: %s' % (item.product.sku, item.quantity, item.product.items_in_stock))

    if len(errors) > 0:
        raise ValidationError(
            _('Not enough stock available for:\n%s.') % '\n'.join(errors),
            code='insufficient_stock')


product_model = plata.product_model()
try:
    product_model._meta.get_field('items_in_stock')
except models.FieldDoesNotExist:
    raise ImproperlyConfigured(
        'Product model %r must have a field named `items_in_stock`' % (
            product_model,
        ))

Order.register_validator(
    validate_order_stock_available,
    Order.VALIDATE_CART)

@receiver(order_confirmed)
def on_order_confirmed(sender, *args, **kwargs):

    order = kwargs.get('order', None)
    update_items_in_stock(order)


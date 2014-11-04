from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import models
from django.db.models import Sum, Q, signals
from django.utils import timezone
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _, ugettext
from django.dispatch import receiver
import plata
from plata.shop.models import Order, OrderPayment
from plata.shop.signals import order_confirmed, order_paid
import emailit.api

from base.util.html2pdf import render_html

def send_confirmation_client(request, order):

    context = {
        'request': request,
        'order': order,
    }

    # generate order html/pdf
    pdf_template = 'bshop/pdf/order.html'
    pdf_content = render_to_string(pdf_template, context)

    attachments = [
        {
            'filename': 'Order %s.pdf' % order.pk,
            'content': render_html(pdf_content),
            'mimetype': 'application/pdf',
        },
    ]

    emailit.api.send_mail([order.user.email], context, 'email/client/order_confirmed', attachments=attachments)

def send_confirmation_manager(request, order):
    context = {
        'request': request,
        'order': order,
    }
    emailit.api.mail_managers(context, 'email/admin/order_confirmed')


@receiver(order_confirmed)
def on_order_confirmed(sender, *args, **kwargs):

    order = kwargs.get('order', None)
    request = kwargs.get('request', None)

    send_confirmation_manager(request=request, order=order)
    send_confirmation_client(request=request, order=order)


#from plata.contact.models import Contact
from django import forms
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import Http404, HttpResponseRedirect
from django.http import HttpResponse
from django.views.generic import DetailView, ListView, UpdateView
from plata.discount.models import Discount
from plata.shop.models import Order
from plata.shop.views import Shop
from django.utils.translation import ugettext as _
from plata.shop import forms as shop_forms


from bshop.models import Contact
from bshop.forms import CheckoutForm, ContactForm


class ContactDetailView(DetailView):

    context_object_name = "contact"
    model = Contact
    slug = None


    def get_object(self, queryset=None):
        return get_object_or_404(Contact, user__pk=self.request.user.pk)


    def get_context_data(self, **kwargs):

        context = super(ContactDetailView, self).get_context_data(**kwargs)
        order_history = self.request.user.orders.filter(status__gte=30).order_by('-created',)
        extra_context = {'order_history': order_history}
        context.update(extra_context)
        return context


class ContactUpdateView(UpdateView):

    context_object_name = "contact"
    model = Contact
    slug = None
    form_class = ContactForm


    def get_object(self, queryset=None):
        return get_object_or_404(Contact, user__pk=self.request.user.pk)


    def get_context_data(self, **kwargs):

        context = super(ContactUpdateView, self).get_context_data(**kwargs)
        order_history = self.request.user.orders.filter(status__gte=30).order_by('-created',)
        extra_context = {'order_history': order_history}
        context.update(extra_context)
        return context


def order_as_pdf(request, pk):
    from base.util.html2pdf import render_html
    from plata.shop.models import Order
    from django.template.loader import render_to_string
    context = {
        'request': request,
        'order': Order.objects.get(pk=pk),
    }

    # generate order html/pdf
    pdf_template = 'bshop/pdf/order.html'
    pdf_content = render_to_string(pdf_template, context)



    #return HttpResponse(pdf_content)
    return HttpResponse(render_html(pdf_content), content_type='application/pdf')
















































































class CustomShop(Shop):
    def checkout_form(self, request, order):
        return CheckoutForm




# plata instance
shop = CustomShop(
    contact_model=Contact,
    order_model=Order,
    discount_model=Discount,
)


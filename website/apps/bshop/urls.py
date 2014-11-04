from django.conf.urls import patterns, url
from views import ContactDetailView, ContactUpdateView, order_as_pdf

urlpatterns = patterns('bshop.views',
    url(r'^contact/$', ContactDetailView.as_view(), name='bshop-contact-detail'),
    url(r'^contact/update/$', ContactUpdateView.as_view(), name='bshop-contact-update'),
    url(r'^pdf/order/(?P<pk>[-\w]+)/$', order_as_pdf, name='bshop-order-pdf'),
)

"""
custom contact model for plata
"""

from django.conf import settings
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_delete
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

from plata.fields import CurrencyField
from plata.shop.models import BillingShippingAddress

from geoposition.fields import GeopositionField

from catalog.models import PRODUCT_CATEGORY_CHOICES


DISCOUNT_LEVEL_CHOICES = (
    (0, _('None')),
    (1, _('Level 1')),
    (2, _('Level 2')),
)


#class Contact(BillingShippingAddress):
class Contact(BillingShippingAddress):
    """
    Each user can have at most one of these

    Note: You do not have to use this model if you want to store the contact
    information somewhere else. If you use your own contact model, you should
    take care of two things:

    - ``Contact.update_from_order`` has to exist, and should fill in
      contact details from the order
    - You probably have to override ``Shop.checkout_form`` too - this method
      probably won't work for your custom contact model
    """

    ADDRESS_FIELDS = ['company', 'name', 'phone', 'fax', 'address', 'zip_code', 'city', 'country']

    user = models.OneToOneField(
        getattr(settings, 'AUTH_USER_MODEL', 'auth.User'),
        verbose_name=_('user'),
        related_name='contactuser',
        blank=True, null=True, on_delete=models.CASCADE)

    #dob = models.DateField(_('date of birth'), blank=True, null=True)
    created = models.DateTimeField(_('created'), default=timezone.now,auto_now_add=True)

    tax_id = models.CharField(max_length=64, blank=True, null=True, help_text=_('USt-IDNr / MwSt-No'))
    discount_level = models.PositiveIntegerField(default=0, choices=DISCOUNT_LEVEL_CHOICES)

    currency = CurrencyField(help_text=_('Preferred currency.'), default='EUR')
    notes = models.TextField(_('notes'), blank=True)


    website = models.URLField(max_length=128, blank=True, null=True, help_text=_('include "http://"'))

    show_on_map = models.BooleanField(default=False)

    assortment_sun = models.BooleanField(verbose_name='SUN in assortment', default=False)
    assortment_kids = models.BooleanField(verbose_name='KIDS in assortment', default=False)
    assortment_optical = models.BooleanField(verbose_name='OPTICAL in assortment', default=False)


    coordinates = GeopositionField(blank=True, null=True)


    class Meta:
        verbose_name = _('contact')
        verbose_name_plural = _('contacts')

    def __unicode__(self):
        return unicode(self.user)

    @property
    def company(self):
        return self.billing_company

    @property
    def assortment(self):
        a = []
        if self.assortment_sun:
            a.append('Sun')
        if self.assortment_kids:
            a.append('Kids')
        if self.assortment_optical:
            a.append('Optical')
        return a


    def get_absolute_url(self):
        return reverse('bshop-contact-detail')

    def update_from_order(self, order, request=None):
        """
        This method is called by the checkout step and is used to update
        the contact information from an order instance
        """

        self.currency = order.currency
        self.shipping_same_as_billing = order.shipping_same_as_billing

        for field in self.ADDRESS_FIELDS:
            f = 'shipping_' + field
            setattr(self, f, getattr(order, f))

            f = 'billing_' + field
            setattr(self, f, getattr(order, f))



    def save(self, *args, **kwargs):

        # geocodeing
        if not self.coordinates:
            try:
                from pygeocoder import Geocoder
                address = '%s, %s %s' % (self.billing_address, self.billing_zip_code, self.billing_city)
                results = Geocoder.geocode(address.encode('ascii', 'ignore'))
                lat, lng = results[0].coordinates
                if lat and lng:
                    self.coordinates = '%s,%s' % (lat, lng)

            except Exception, e:
                print 'geocoder error: %s' % e

        print self.coordinates


        super(Contact, self).save(*args, **kwargs)

@receiver(post_delete,sender=Contact)
def contact_post_delete(sender,**kwargs):
    obj = kwargs['instance']
    if obj.user:
        obj.user.delete()
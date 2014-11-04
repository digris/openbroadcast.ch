#from plata.contact.models import Contact
from django import forms
from plata.discount.models import Discount
from plata.shop.models import Order
from django.utils.translation import ugettext as _
from plata.shop import forms as shop_forms

from bshop.models import Contact



class ContactForm(forms.ModelForm):

    class Meta:
        model = Contact
        # TODO: refactor to 'include' fields!
        exclude = ['currency', 'discount_level', ]
        #fields = ['pub_date', 'headline', 'content', 'reporter']

    def __init__(self, *args, **kwargs):

        request = kwargs.get('request')
        instance = kwargs.get('instance')

        initial = {
            'email': instance.user.email,
        }

        kwargs['initial'] = initial

        super(ContactForm, self).__init__(*args, **kwargs)


    #email = forms.EmailField(help_text='123')






class CheckoutForm(shop_forms.BaseCheckoutForm):

    class Meta:
        fields = ['notes', 'email', 'shipping_same_as_billing']
        fields.extend('billing_%s' % f for f in Order.ADDRESS_FIELDS)
        fields.extend('shipping_%s' % f for f in Order.ADDRESS_FIELDS)
        #fields.extend(['tax_id',])
        model = Order

    def __init__(self, *args, **kwargs):
        # BaseCheckoutForm.__init__ needs the following kwargs too, because
        # of this we do not pop() them here
        shop = kwargs.get('shop')
        request = kwargs.get('request')

        self.REQUIRED_ADDRESS_FIELDS = shop.contact_model.ADDRESS_FIELDS[:]
        self.REQUIRED_ADDRESS_FIELDS.remove('name')

        contact = shop.contact_from_user(request.user)

        if contact:
            initial = {
                'email': contact.user.email,
                'tax_id': contact.tax_id,
                'shipping_same_as_billing': contact.shipping_same_as_billing,
            }

            for f in contact.ADDRESS_FIELDS:
                initial['billing_%s' % f] = getattr(
                    contact,
                    'billing_%s' % f)
                initial['shipping_%s' % f] = getattr(
                    contact,
                    'shipping_%s' % f)

            kwargs['initial'] = initial

        elif request.user.is_authenticated():
            kwargs['initial'] = {
                'email': request.user.email,
                'billing_name': request.user.name,
            }

        super(CheckoutForm, self).__init__(*args, **kwargs)

        if not (contact or request.user.is_authenticated()):
            self.fields['create_account'] = forms.BooleanField(
                label=_('create account'),
                required=False, initial=True)

    def clean(self):
        data = super(CheckoutForm, self).clean()

        print 'required'
        print self.REQUIRED_ADDRESS_FIELDS
        print

        for f in self.REQUIRED_ADDRESS_FIELDS:
            field = 'billing_%s' % f
            if not data.get(field):
                self._errors[field] = self.error_class([
                    _('This field is required.')])

        if not data.get('shipping_same_as_billing'):
            for f in self.REQUIRED_ADDRESS_FIELDS:
                field = 'shipping_%s' % f
                if not data.get(field):
                    self._errors[field] = self.error_class([
                        _('This field is required.')])

        return data
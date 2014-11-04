from django import forms
from django.contrib import auth

try:  # pragma: no cover
    from django.contrib.auth import get_user_model
    User = get_user_model()
except ImportError, e:
    from django.contrib.auth.models import User

from django.utils.translation import ugettext_lazy as _

from plata.shop import signals


class BaseCheckoutForm(forms.ModelForm):
    """
    Needs the request and the shop object as keyword argument
    """

    def __init__(self, *args, **kwargs):
        self.shop = kwargs.pop('shop')
        self.request = kwargs.pop('request')

        super(BaseCheckoutForm, self).__init__(*args, **kwargs)

    def clean(self):
        data = super(BaseCheckoutForm, self).clean()

        if data.get('email'):
            users = list(User.objects.filter(email=data.get('email')))

            if users:
                if self.request.user not in users:
                    if self.request.user.is_authenticated():
                        self._errors['email'] = self.error_class([
                            _('This e-mail address belongs to a different'
                                ' account.')])
                    else:
                        self._errors['email'] = self.error_class([
                            _('This e-mail address might belong to you, but'
                                ' we cannot know for sure because you are'
                                ' not authenticated yet.')])

        return data

    def save(self):
        """
        Save the order, create or update the contact information
        (if available) and return the saved order instance
        """
        order = super(BaseCheckoutForm, self).save(commit=False)
        contact = self.shop.contact_from_user(self.request.user)

        if contact:
            order.user = contact.user
        elif self.request.user.is_authenticated():
            order.user = self.request.user

        if (self.cleaned_data.get('create_account') and not contact) or (
                not contact and self.request.user.is_authenticated()):
            password = None
            email = self.cleaned_data.get('email')

            if not self.request.user.is_authenticated():
                password = User.objects.make_random_password()
                params = {'email': email, 'password': password}
                if getattr(User, 'USERNAME_FIELD', 'username') == 'username':
                    params['username'] = email[:30]  # FIXME
                user = User.objects.create_user(**params)
                user = auth.authenticate(username=email, password=password)
                auth.login(self.request, user)
            else:
                user = self.request.user

            contact = self.shop.contact_model(user=user)
            order.user = user

            signals.contact_created.send(
                sender=self.shop,
                user=user,
                contact=contact,
                password=password,
                request=self.request)

        order.save()

        if contact:
            contact.update_from_order(order, request=self.request)
            contact.save()

        return order


class DiscountForm(forms.Form):
    code = forms.CharField(label=_('code'), max_length=30, required=False)

    def __init__(self, *args, **kwargs):
        self.order = kwargs.pop('order')
        self.discount_model = kwargs.pop('discount_model')
        request = kwargs.pop('request')  # noqa
        shop = kwargs.pop('shop')  # noqa

        super(DiscountForm, self).__init__(*args, **kwargs)

    def clean_code(self):
        code = self.cleaned_data.get('code')
        if not code:
            return self.cleaned_data

        try:
            discount = self.discount_model.objects.get(code=code)
        except self.discount_model.DoesNotExist:
            raise forms.ValidationError(_('This code does not validate'))

        discount.validate(self.order)
        self.cleaned_data['discount'] = discount
        return code

    def save(self):
        """
        Save the discount (or do nothing if no discount code has been given)
        """
        if 'discount' in self.cleaned_data:
            self.cleaned_data['discount'].add_to(self.order)


class ConfirmationForm(forms.Form):
    terms_and_conditions = forms.BooleanField(
        label=_('I accept the terms and conditions.'),
        required=True)

    def __init__(self, *args, **kwargs):
        self.order = kwargs.pop('order')
        self.request = kwargs.pop('request')
        self.shop = kwargs.pop('shop')
        self.payment_modules = self.shop.get_payment_modules(self.request)

        super(ConfirmationForm, self).__init__(*args, **kwargs)

        method_choices = [(m.key, m.name) for m in self.payment_modules]
        if len(method_choices) > 1:
            method_choices.insert(0, ('', '---------'))
        self.fields['payment_method'] = forms.ChoiceField(
            label=_('Payment method'), choices=method_choices,
        )

    def clean(self):
        data = super(ConfirmationForm, self).clean()
        self.order.validate(self.order.VALIDATE_ALL)
        return data

    def process_confirmation(self):
        """
        Process the successful order submission
        """
        self.order.update_status(self.order.CONFIRMED, 'Confirmation given')
        signals.order_confirmed.send(
            sender=self.shop,
            order=self.order,
            request=self.request)

        module = dict(
            (m.key, m) for m in self.payment_modules
            )[self.cleaned_data['payment_method']]

        return module.process_order_confirmed(self.request, self.order)

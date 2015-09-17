from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from django import forms
from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth.forms import PasswordResetForm
from authtools.forms import FriendlyPasswordResetForm
from cms.admin.placeholderadmin import PlaceholderAdmin, PlaceholderAdminMixin
from hvad.admin import TranslatableAdmin, TranslatableStackedInline, TranslatableTabularInline
from pagedown.widgets import AdminPagedownWidget
from nested_inline.admin import NestedStackedInline, NestedModelAdmin, NestedTabularInline
from filer.admin import ImageAdmin
from easy_thumbnails.files import get_thumbnailer
from base.fields.extra import MarkdownTextField
#from embed_video.admin import AdminVideoMixin
from models import Contact

THUMBNAIL_OPT = dict(size=(120, 80), crop=True, bw=False, quality=80)

User = settings.AUTH_USER_MODEL



class AddContactAdminForm(forms.ModelForm):

    email = forms.EmailField()
    name = forms.CharField(max_length=100, required=False)

    send_invitation_email = forms.BooleanField(initial=True, required=False)
    create_login_code = forms.BooleanField(required=False)

    class Meta:
        model = Contact

    def clean_email(self):
        cleaned_data = self.cleaned_data.get('email')
        try:
            User.objects.get(email=cleaned_data)
            raise forms.ValidationError(_('Account with this Email address already exists.'))
        except User.DoesNotExist:
            pass

        return cleaned_data

    def save(self, commit=False):

        contact = super(AddContactAdminForm, self).save(commit=False)
        contact.save()

        email = self.cleaned_data.get('email', None)
        send_invitation_email = self.cleaned_data.get('send_invitation_email', False)

        if not contact.user:
            user = User(email=email)
            user.name = contact.billing_name
            user.set_password(get_random_string())
            user.save()
            contact.user = user
            contact.save()

        if send_invitation_email:
            reset_form = FriendlyPasswordResetForm({'email': contact.user.email})
            assert reset_form.is_valid()
            reset_form.save(
                subject_template_name='wholesale/email/dealer_invitation_subject.txt',
                email_template_name='wholesale/email/dealer_invitation_body.txt',
            )

        return contact


class ChangeContactAdminForm(forms.ModelForm):

    send_password_reset_email = forms.BooleanField(initial=False, required=False)
    create_login_code = forms.BooleanField(required=False)
    send_login_code_sms = forms.CharField(max_length=50, required=False, label='send as SMS', help_text='Phone number in +xxxxxxxxxxx format')
    current_login_code = forms.CharField(max_length=50, required=False, label='Login Code')

    class Meta:
        model = Contact

    def __init__(self, *args, **kwargs):
        super(ChangeContactAdminForm, self).__init__(*args, **kwargs)
        print '--------------------------------------------'
        print args
        print kwargs

        obj = kwargs.get('instance', None)
        try:
            self.fields['current_login_code'].initial = obj.user.token
            self.fields['current_login_code'].widget.attrs['readonly'] = True
            self.fields['current_login_code'].widget.attrs['class'] = 'readonly-xxl'
        except:
            self.fields['current_login_code'].widget.attrs['readonly'] = True
            pass

    def save(self, commit=False):

        contact = super(ChangeContactAdminForm, self).save(commit=False)
        contact.save()

        send_password_reset_email = self.cleaned_data.get('send_password_reset_email', False)
        send_login_code_sms = self.cleaned_data.get('send_login_code_sms', False)
        create_login_code = self.cleaned_data.get('create_login_code', False)

        if send_password_reset_email:
            reset_form = FriendlyPasswordResetForm({'email': contact.user.email})
            assert reset_form.is_valid()
            reset_form.save(
                subject_template_name='wholesale/email/dealer_invitation_subject.txt',
                email_template_name='wholesale/email/dealer_invitation_body.txt',
            )

        if create_login_code or send_login_code_sms:
            from invitation.models import Invitation
            i, c = Invitation.objects.get_or_create(user=contact.user)
            i.expires = None
            i.claimed = None
            i.save()
            pass

        if send_login_code_sms:
            from aspsms.api import SMSAPI
            i = Invitation.objects.get(user=contact.user)
            s = SMSAPI()
            msg = 'Login Code: %s\n\rhttp://ohrstrom-local.anorg.net/de/accounts/login/#%s' % (i, i)
            s.send(send_login_code_sms, msg)




        return contact




class ContactAdmin(admin.ModelAdmin):

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            return AddContactAdminForm
        else:
            return ChangeContactAdminForm

        return super(ContactAdmin, self).get_form(request, obj, **kwargs)



    #class Media:
    #    css = {"all": ("admin_warning.css", )}
    #    js = ("admin_warning.js", )


    #readonly_fields = []

    def get_fieldsets(self, request, obj=None):

        if obj is None:

            fieldsets = (


                (None, {
                    'fields': (
                        'email', 'name', ('send_invitation_email', 'create_login_code'), 'tax_id', 'currency', 'discount_level'
                    ),
                    #'description': "A user will automatically created. "
                }),


                (_('Billing address'), {
                    'fields': Contact.address_fields('billing_'),
                }),
                (_('Shipping address'), {
                    'classes': ('collapse',),
                    'fields': (
                        ['shipping_same_as_billing']
                        + Contact.address_fields('shipping_')),
                }),
                (_('Additional fields'), {
                    'fields': ('notes',),
                }),
            )

        else:
            fieldsets = (
                (None, {'fields': ('user', 'website', 'tax_id', 'currency', 'discount_level')}),
                (_('Store Locator / Assortment'), {
                    'fields': (
                    'show_on_map', ('assortment_sun', 'assortment_kids', 'assortment_optical'),
                    )
                }),
                (_('Password & Login-Codes'), {
                    'fields': (
                    'current_login_code', 'send_password_reset_email', ('create_login_code', 'send_login_code_sms'),
                    )
                }),
                (_('Billing address'), {
                    'fields': Contact.address_fields('billing_'),
                }),

                (_('Shipping address'), {
                    'fields': (
                        ['shipping_same_as_billing']
                        + Contact.address_fields('shipping_')),
                }),
                (_('Additional fields'), {
                    'fields': ('notes',),
                }),
            )
        return fieldsets


    list_display = (
        '__unicode__', 'billing_company', 'billing_name', 'billing_city', 'show_on_map', 'created')
    list_filter = ('user__is_active',)
    ordering = ('-created',)
    raw_id_fields = ('user',)
    search_fields = (
        ['user__name', 'user__email']
        + Contact.address_fields('billing_')
        + Contact.address_fields('shipping_')
    )


admin.site.register(Contact, ContactAdmin)



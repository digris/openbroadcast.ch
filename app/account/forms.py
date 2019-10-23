from __future__ import unicode_literals
from __future__ import absolute_import

from django import forms
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.forms import UserCreationForm
from captcha.fields import CaptchaField
from django.contrib.auth.forms import AuthenticationForm as BaseAuthenticationForm
from password_reset.forms import PasswordRecoveryForm as BasePasswordRecoveryForm
from password_reset.forms import PasswordResetForm as BasePasswordResetForm

from remoteauth.models import User, validate_registration


class AuthenticationForm(BaseAuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(AuthenticationForm, self).__init__(*args, **kwargs)


class RegistrationForm(UserCreationForm):
    username = forms.RegexField(
        label=_("Username"),
        max_length=30,
        regex=r"^[\w.@+-]+$",
        error_messages={
            "invalid": _(
                "This value may contain only letters, numbers and @/./+/-/_ characters."
            )
        },
    )

    email = forms.EmailField(label=_("Email"))
    # password2 = forms.EmailField(
    #     label=_('Password confirmation')
    # )
    captcha = CaptchaField(
        label=_("Security Code"),
        help_text=_("Please enter the characters shown beside."),
    )

    tos = forms.BooleanField(
        widget=forms.CheckboxInput,
        label=_("I have read and agree to the privacy policy."),
        error_messages={
            "required": _("You must agree to the privacy policy to register.")
        },
    )
    # TODO: implement own loqic without password repeat
    password2 = forms.CharField(widget=forms.HiddenInput, required=False)

    field_order = ["email", "username", "password1", "password2", "captcha", "tos"]

    class Meta:
        model = User
        fields = ("email",)

    def __init__(self, *args, **kwargs):
        super(RegistrationForm, self).__init__(*args, **kwargs)

    # TODO: implement own loqic without password repeat
    def clean_password2(self):
        return True

    def clean_username(self):

        response = validate_registration(
            key="username", value=self.cleaned_data["username"]
        )
        if "error" in response and response["error"]:
            raise forms.ValidationError(response["error"])
        else:
            return self.cleaned_data["username"]

    def clean_email(self):

        response = validate_registration(key="email", value=self.cleaned_data["email"])
        if "error" in response and response["error"]:
            raise forms.ValidationError(response["error"])
        else:
            return self.cleaned_data["email"]


class PasswordRecoverForm(BasePasswordRecoveryForm):

    # TODO: implement password recovery logic
    def __init__(self, *args, **kwargs):
        super(PasswordRecoverForm, self).__init__(*args, **kwargs)

    def get_user_by_both(self, username):

        raise forms.ValidationError(_("Unable to find user...."))

        return user


class PasswordResetForm(BasePasswordResetForm):
    def __init__(self, *args, **kwargs):
        super(PasswordResetForm, self).__init__(*args, **kwargs)

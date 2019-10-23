from django.conf import settings
from django import forms
from django.utils.translation import ugettext_lazy as _
from captcha.fields import CaptchaField
from remoteauth.models import validate_registration


class RegistrationForm(forms.Form):

    required_css_class = "required"

    username = forms.RegexField(
        regex=r"^[\w.@+-]+$",
        max_length=30,
        label=_("Username"),
        error_messages={
            "invalid": _(
                "This value may contain only letters, numbers and @/./+/-/_ characters."
            )
        },
    )
    email = forms.EmailField(label=_("E-mail"))
    password = forms.CharField(widget=forms.PasswordInput, label=_("Password"))
    password2 = forms.CharField(widget=forms.PasswordInput, label=_("Password (again)"))

    captcha = CaptchaField(
        label=_(u"Sicherheits code"),
        id_prefix="captcha",
        # help_text=_('Enter the 6 digit code in the field above'),
        error_messages={"required": _("Code empty or invalid")},
    )

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

    def clean(self):

        if "password" in self.cleaned_data and "password2" in self.cleaned_data:
            if self.cleaned_data["password"] != self.cleaned_data["password2"]:
                raise forms.ValidationError(_("The two password fields didn't match."))
        return self.cleaned_data

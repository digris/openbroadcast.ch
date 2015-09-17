from __future__ import unicode_literals

from django.conf import settings
from django.conf import settings, REDIRECT_FIELD_NAME
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import SetPasswordForm
from django.contrib import auth
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404, resolve_url
from django.views.generic import FormView, TemplateView, RedirectView
from authtools.views import AuthDecoratorsMixin
from authtools.views import resolve_url_lazy
import json

from invitation.models import Invitation

User = settings.AUTH_USER_MODEL

class CheckTokenView(TemplateView):

    def post(self, request, **kwargs):

        data = json.loads(request.body)

        ret = {
            'valid': False,
            'message': None,
            'claim_url': None,
        }

        try:
            invitation = Invitation.objects.get(token=data.get('token'))
            if invitation.valid:
                ret['valid'] = True
                ret['claim_url'] = resolve_url('invitation_claim_token', token=data['token'])
            else:
                ret['valid'] = False
                ret['message'] = 'Invitation is invalid.'

        except Invitation.DoesNotExist:
            ret['message'] = 'Invitation does not exist.'


        return HttpResponse(json.dumps(ret), content_type="application/json")

check_token = CheckTokenView.as_view()

class ClaimTokenAndLoginView(AuthDecoratorsMixin, FormView):

    template_name = 'invitation/claim_invitation_and_set_password.html'
    token_generator = default_token_generator
    form_class = SetPasswordForm
    success_url = resolve_url_lazy(settings.LOGIN_REDIRECT_URL)

    def dispatch(self, *args, **kwargs):
        assert self.kwargs.get('token') is not None
        self.invitation, self.user = self.get_invitation()
        return super(ClaimTokenAndLoginView, self).dispatch(*args, **kwargs)

    def get_invitation(self):
        token = self.kwargs.get('token')
        try:
            invitation = Invitation.objects.get(token=token)
            return invitation, invitation.user
        except (TypeError, ValueError, OverflowError, Invitation.DoesNotExist):
            return None, None

    def valid_link(self):
        user = self.user
        invitation = self.user
        return user is not None and invitation is not None

    def get_form_kwargs(self):
        kwargs = super(ClaimTokenAndLoginView, self).get_form_kwargs()
        kwargs['user'] = self.user
        return kwargs

    def get_context_data(self, **kwargs):
        kwargs = super(ClaimTokenAndLoginView, self).get_context_data(**kwargs)
        if self.valid_link():
            kwargs['validlink'] = True
            kwargs['invitation'] = self.invitation
            kwargs['invitation_user'] = self.user
        else:
            kwargs['validlink'] = False
            kwargs['form'] = None
        return kwargs

    def form_valid(self, form):

        if not self.valid_link():
            return self.form_invalid(form)
        self.save_form(form)
        self.invitation.claim()
        return super(ClaimTokenAndLoginView, self).form_valid(form)

    def save_form(self, form):

        ret = form.save()
        user = auth.authenticate(username=self.user.get_username(),
                                 password=form.cleaned_data['new_password1'])
        auth.login(self.request, user)
        return ret

claim_token_and_login = ClaimTokenAndLoginView.as_view()
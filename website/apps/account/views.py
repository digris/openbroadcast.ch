from __future__ import unicode_literals

import json
import logging
from braces.views import AnonymousRequiredMixin, LoginRequiredMixin

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import View, DetailView, TemplateView, FormView, RedirectView

from password_reset.views import Recover, RecoverDone, Reset, ResetDone
from registration.views import RegistrationView

from .forms import RegistrationForm, PasswordRecoverForm, PasswordResetForm, AuthenticationForm
from remoteauth.models import User, register_user


log = logging.getLogger(__name__)

#######################################################################
# login/logout views
# using: https://github.com/stefanfoulis/django-class-based-auth-views
#######################################################################
class UserLoginView(AnonymousRequiredMixin, FormView):
    form_class = AuthenticationForm
    template_name = 'account/login_form_partial.html'
    success_url = '.'

    def form_valid(self, form):
        response = super(UserLoginView, self).form_valid(form)

        user = form.get_user()
        login(self.request, user)

        if self.request.is_ajax():

            _response = {
                'location':self.get_success_url(),
                'user': {
                    # 'username': user.username,
                    'id': user.pk,
                    'is_staff': user.is_staff
                }
            }

            return JsonResponse(_response)

        return response


class UserLogoutView(LoginRequiredMixin, RedirectView):

    def get(self, request, *args, **kwargs):
        next_page = kwargs.get('next_page', '/')

        logout(request)

        if self.request.is_ajax():
            _response = {
                'location': next_page,
                'user': None
            }
            return JsonResponse(_response)

        return redirect(next_page)

    def post(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)


class UserRegisterView(RegistrationView, AnonymousRequiredMixin):

    form_class = RegistrationForm
    template_name = 'account/register_form_partial.html'
    success_url = '.'

    def register(self, form):

        register_user(
            username=form.cleaned_data['username'],
            email=form.cleaned_data['email'],
            password=form.cleaned_data['password1']
        )

        # kind of ugly, abusing the login form...
        _p = {
            'username': form.cleaned_data['username'],
            'password': form.cleaned_data['password1'],
        }
        _form = AuthenticationForm(None, _p)
        if _form.is_valid():
            user = _form.get_user()
            login(self.request, user)

            # TODO: implement signals
            #signals.user_registered.send(sender=self.__class__, user=new_user, request=self.request)
            return user

    def get_success_url(self, user=None):
        return '/'
        # return reverse_lazy('account:user-pickup')

    def form_valid(self, form):
        response = super(UserRegisterView, self).form_valid(form)

        if self.request.is_ajax():

            user = self.request.user

            _response = {
                'location':self.get_success_url(user),
                'user': {
                    'username': user.username,
                    'id': user.pk,
                    'is_staff': user.is_staff
                }
            }

            return JsonResponse(_response)

        return response


#######################################################################
# password reset views
# using: https://github.com/brutasse/django-password-reset
# views here are extended to match an unified way of url and
# template handling.
# we want to avoid to have different namespaces for login,
# social accounts, password reset, register etc.
#######################################################################
class PasswordRecoverView(Recover):
    template_name = 'account/password_recover_form.html'
    email_template_name = 'account/password_recover_email.txt'
    email_subject_template_name = 'account/password_recover_email_subject.txt'
    form_class = PasswordRecoverForm
    success_url_name = 'account:password_recover_sent'


class PasswordRecoverSentView(RecoverDone):
    template_name = 'account/password_recover_sent.html'


class PasswordResetView(Reset):
    template_name = 'account/password_reset_form.html'
    form_class = PasswordResetForm
    # redirect to the login view
    # optionally use 'account:password_reset_done' do show a password reset done message
    #success_url = reverse_lazy('account:login')
    #success_url = reverse_lazy('account:password_reset_done')
    def get_success_url(self):
        return reverse_lazy('account:user-pickup')

    def form_valid(self, form):
        super(PasswordResetView, self).form_valid(form)
        form.user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(self.request, form.user)

        return redirect(self.get_success_url())


class PasswordResetDoneView(ResetDone):
    template_name = 'account/password_reset_done.html'



class UserDetailView(DetailView):
    model = User
    slug_field = 'uuid'

    template_name = 'account/user_detail.html'

    def get_object(self, queryset=None):
        return User.objects.get(uuid=self.kwargs['uuid'])

    def get_context_data(self, **kwargs):
        context = super(UserDetailView, self).get_context_data(**kwargs)
        return context

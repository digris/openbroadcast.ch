# -*- coding: utf-8 -*-
import logging
from django.shortcuts import render_to_response
from django.shortcuts import RequestContext
from django.shortcuts import render
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import login
from django.contrib.auth import logout
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from remoteauth.forms import RegistrationForm
from registration.views import RegistrationView
import json, pdb

from remoteauth.models import register_user

log = logging.getLogger(__name__)

def alogin_login(request):
    form = AuthenticationForm()
    if request.method == 'POST':
        form = AuthenticationForm(None, request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            log.debug('user "%s" logged in.' % user.username)


            messages.add_message(
                request, messages.INFO,
                _(u'Welcome {username}. You have successfully logged in.').format(username=user.username)
            )

            return HttpResponse(json.dumps({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                }
            })
            , mimetype='application/json')
    return render(request, 'alogin/login.html', {'form': form})



def alogin_register(request):
    form = RegistrationForm()
    if request.method == 'POST':
        form = RegistrationForm(request.POST)

        if form.is_valid():

            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            register_user(username=username, email=email, password=password)

            return alogin_login(request)


            #return HttpResponse(json.dumps({'success': True, 'mail_activation': True})
            #    , mimetype='application/json')

    return render(request, 'alogin/register.html', {'form': form})

def alogin_logout(request):
    log.debug('user "%s" logged out.' % request.user.username)
    logout(request)
    messages.add_message(request, messages.INFO, _(u'You have successfully logged out.'))
    response = {
        'success': True,
        'user': False,
    }
    return HttpResponse(json.dumps(response), mimetype='application/json')



def socialauth_success(request):
    return render(request, 'ajaxlogin/socialauth_success.html', {})


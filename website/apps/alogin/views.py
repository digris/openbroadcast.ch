from django.shortcuts import render_to_response
from django.shortcuts import RequestContext
from django.shortcuts import render
from django.contrib.auth import login
from django.contrib.auth import logout
from django.http import HttpResponse
from django.contrib.auth.forms import AuthenticationForm
from registration.forms import *
from registration.views import RegistrationView
import json, pdb


def alogin_login(request):
    form = AuthenticationForm()
    if request.method == 'POST':
        form = AuthenticationForm(None, request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return HttpResponse(json.dumps({
                'success': True,
                'is_authenticated': True,
            })
            , mimetype='application/json')
    return render(request, 'alogin/login.html', {'form': form})
    #return render(request, 'ajaxlogin/ajax_login.html', {'form': form})


def alogin_register(request):
    form = RegistrationForm()
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            return HttpResponse(json.dumps({'success': True, 'mail_activation': True})
                , mimetype='application/json')
    return render(request, 'alogin/register.html', {'form': form})

def alogin_logout(request):
    logout(request)
    response = {
        'success': True,
        'is_authenticated': False,
    }
    return HttpResponse(json.dumps(response), mimetype='application/json')



def socialauth_success(request):
    return render(request, 'ajaxlogin/socialauth_success.html', {})


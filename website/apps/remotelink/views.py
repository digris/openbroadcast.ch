# -*- coding: utf-8 -*-
import logging
from django.shortcuts import render_to_response
from django.shortcuts import render
from django.http import HttpResponse

log = logging.getLogger(__name__)

def dialog(request):
    return render(request, 'remotelink/dialog.html', {'user': request.user})





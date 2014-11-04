from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response


def base(request):
    return render_to_response('bplayer/base.html', {}, context_instance=RequestContext(request))


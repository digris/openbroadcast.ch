# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
from django.utils import timezone
from django.conf import settings
from django.http import HttpResponse

TIME_ZONE = getattr(settings, 'TIME_ZONE', None)

def current_time(request):

    now = timezone.localtime()

    # TODO: this is just a quick'n'dirty way to update users heartbeat
    if request.user.is_authenticated():
        from heartbeat.models import Beat
        beat, beat_created = Beat.objects.get_or_create(user=request.user)
        if not beat_created:
            beat.save()

    data = {
        'time': now.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
        'timezone': u'%s' % TIME_ZONE
    }

    return HttpResponse(json.dumps(data), content_type="application/json")

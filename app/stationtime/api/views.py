# -*- coding: utf-8 -*-
from django.utils import timezone
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response

TIME_ZONE = getattr(settings, "TIME_ZONE", None)
TIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"


def trigger_heartbeat(request):

    # TODO: this is just a quick'n'dirty way to update users heartbeat
    #       to be placed at a different place..
    if request.user.is_authenticated:
        from heartbeat.models import Beat

        beat, beat_created = Beat.objects.get_or_create(user=request.user)
        if not beat_created:
            beat.save()


@api_view(["GET"])
def time(request):
    trigger_heartbeat(request)

    data = {"time": timezone.localtime().strftime(TIME_FORMAT), "timezone": TIME_ZONE}

    return Response(data)

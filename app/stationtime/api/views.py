# -*- coding: utf-8 -*-
from django.utils import timezone
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response

from heartbeat.utils import heartbeat_for_request

TIME_ZONE = getattr(settings, "TIME_ZONE", None)
TIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"


@api_view(["GET"])
def time(request):

    heartbeat_for_request(request)

    data = {"time": timezone.localtime().strftime(TIME_FORMAT), "timezone": TIME_ZONE}

    return Response(data)

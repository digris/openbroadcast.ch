# -*- coding: utf-8 -*-
import requests
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

REMOTE_API_BASE_URL = getattr(settings, "REMOTE_API_BASE_URL")


@api_view(["GET"])
def profile_detail_proxy(request, profile_id):

    url = "{base_url}profiles/profiles/{id}/".format(
        base_url=REMOTE_API_BASE_URL, id=profile_id
    )

    r = requests.get(url, timeout=(2, 5))

    if not r.status_code == 200:
        return Response(status=r.status_code)

    return Response(r.json())

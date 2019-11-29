# -*- coding: utf-8 -*-

import logging

from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import authentication_classes, permission_classes

from ..utils import get_remote_votes, put_remote_vote
from .. import signals as rating_signals


API_BASE_URL = getattr(settings, "API_BASE_URL", None)
API_BASE_AUTH = getattr(settings, "API_BASE_AUTH", None)

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()


@api_view(["GET", "POST"])
@authentication_classes((SessionAuthentication, TokenAuthentication))
@permission_classes((IsAuthenticatedOrReadOnly,))
def vote_detail(request, obj_ct, obj_uuid):

    if not len(obj_uuid) == 36:
        return Response({}, status=400)

    if request.user and request.user.is_authenticated:
        user_id = request.user.remote_id
    else:
        user_id = None

    if request.method == "POST":
        value = request.data.get("value")
        votes, status_code = put_remote_vote(obj_ct, obj_uuid, value, user_id)

        # TODO: maybe implement in another place.
        channel = "rating"
        data = {"type": "votes", "content": votes}

        async_to_sync(channel_layer.group_send)(channel, data)
        rating_signals.user_rated_object.send(
            sender="vote", user=request.user, votes=votes
        )

    else:
        votes, status_code = get_remote_votes(obj_ct, obj_uuid, user_id)

    return Response(votes, status=status_code)

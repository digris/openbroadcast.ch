# -*- coding: utf-8 -*-

import logging

from django.conf import settings

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes, permission_classes

from ..utils import get_remote_votes, update_remote_vote


API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()

@api_view(['GET', 'POST'])
@authentication_classes((SessionAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def vote_detail(request, obj_ct, obj_pk):

    if request.method == 'POST':
        value = request.data.get('value')
        user_remote_id = request.user.remote_id
        votes, status_code = update_remote_vote(obj_ct, obj_pk, value, user_remote_id)

        # TODO: maybe implement in another place.
        channel = 'rating'
        data = {
            'type': 'votes',
            'content': votes
        }

        async_to_sync(channel_layer.group_send)(
            channel, data
        )

    else:
        votes, status_code = get_remote_votes(obj_ct, obj_pk)

    return Response(votes, status=status_code)

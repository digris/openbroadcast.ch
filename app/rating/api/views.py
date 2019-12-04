# -*- coding: utf-8 -*-

import logging

from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.throttling import (
    UserRateThrottle,
    AnonRateThrottle,
    ScopedRateThrottle,
)

from ..utils import get_consolidated_votes, set_vote
from .. import signals as rating_signals


API_BASE_URL = getattr(settings, "API_BASE_URL", None)
API_BASE_AUTH = getattr(settings, "API_BASE_AUTH", None)

log = logging.getLogger(__name__)

channel_layer = get_channel_layer()


class RatingThrottle(ScopedRateThrottle):

    scope = "rating.create"
    scope_attr = "throttle_scope_sustained"


class VoteViewSet(GenericViewSet):

    authentication_classes = (SessionAuthentication, TokenAuthentication)

    throttle_classes = [AnonRateThrottle, UserRateThrottle, RatingThrottle]

    def get_throttles(self):
        if self.action in ["create"]:
            self.throttle_scope = "rating.create"

        return super().get_throttles()

    def retrieve(self, request, obj_ct, obj_uuid):
        votes = get_consolidated_votes(obj_ct, obj_uuid, request)
        return Response(votes)

    def create(self, request, obj_ct, obj_uuid):

        value = request.data.get("value")
        votes = set_vote(obj_ct, obj_uuid, value, request)

        # # TODO: maybe implement in a better place...
        # channel = "rating"
        # data = {"type": "votes", "content": votes}
        #
        # async_to_sync(channel_layer.group_send)(channel, data)

        rating_signals.user_rated_object.send(
            sender="vote", user=request.user, votes=votes
        )

        return Response(votes)


vote_detail = VoteViewSet.as_view({"get": "retrieve", "post": "create"})

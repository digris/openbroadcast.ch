# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging

from django.apps import apps
from django.utils.html import strip_tags
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from rest_framework import viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import mixins

from ..models import Message
from .serializers import MessageSerializer

log = logging.getLogger(__name__)

class MessageViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Message.objects.all().order_by('-created')
    lookup_field = 'uuid'
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def perform_create(self, serializer):
        cleaned_text = serializer.validated_data.get('text')

        log.debug('ct: {}'.format(cleaned_text))

        serializer.save(user=self.request.user, text=cleaned_text)


chatmessage_list = MessageViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

chatmessage_detail = MessageViewSet.as_view({
    'get': 'retrieve',
})

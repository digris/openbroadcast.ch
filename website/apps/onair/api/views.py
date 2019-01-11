# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
import datetime
from django.utils import timezone
from datetime import datetime

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import mixins

from ..models import ScheduledItem
from .serializers import ScheduledItemSerializer

log = logging.getLogger(__name__)

class ScheduleViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):

    lookup_field = 'uuid'
    serializer_class = ScheduledItemSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)


    def get_queryset(self):
        qs = ScheduledItem.objects.filter(
            time_start__lte=datetime.now()
        ).order_by('-time_start')
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, args, kwargs)

        ###############################################################
        # add additional meta information
        ###############################################################
        onair_qs = ScheduledItem.objects.filter(
            time_start__lte=datetime.now(),
            time_end__gte=datetime.now()
        )

        next_item = ScheduledItem.objects.filter(
            time_start__gte=datetime.now()
        ).order_by('time_start').first()

        response.data.update({
            # 'onair': onair_qs.exists(),
            'onair': onair_qs.first().uuid if onair_qs.exists() else None,
            'next_starts_in': next_item.starts_in if next_item else None,
        })

        return response


schedule_list = ScheduleViewSet.as_view({
    'get': 'list',
})

schedule_detail = ScheduleViewSet.as_view({
    'get': 'retrieve',
})


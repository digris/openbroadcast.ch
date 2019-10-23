# -*- coding: utf-8 -*-

import logging
from rest_framework import serializers

from ..models import ScheduledItem

log = logging.getLogger(__name__)


class ScheduledItemSerializer(serializers.ModelSerializer):

    # url = serializers.HyperlinkedIdentityField(
    #     view_name='api:chat-message-detail',
    #     lookup_field='uuid'
    # )

    verbose_name = serializers.CharField(source="name", read_only=True)

    onair = serializers.BooleanField(source="is_onair", read_only=True)

    emission = serializers.JSONField(source="emission_data", read_only=True)

    item = serializers.JSONField(source="item_data", read_only=True)

    time_start = serializers.DateTimeField(read_only=True, source="time_start_offset")

    time_end = serializers.DateTimeField(read_only=True, source="time_end_offset")

    class Meta:
        model = ScheduledItem
        fields = [
            "id",
            "uuid",
            "time_end",
            "time_start",
            "verbose_name",
            "onair",
            "starts_in",
            "ends_in",
            #
            "emission",
            "item",
        ]

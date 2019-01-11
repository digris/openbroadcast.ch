# -*- coding: utf-8 -*-

import logging
import json

from django.conf import settings
from bleach.linkifier import Linker
from django.contrib.auth import get_user_model
from rest_framework import serializers

from ..models import ScheduledItem

log = logging.getLogger(__name__)


class ScheduledItemSerializer(serializers.ModelSerializer):

    # url = serializers.HyperlinkedIdentityField(
    #     view_name='api:chat-message-detail',
    #     lookup_field='uuid'
    # )

    verbose_name = serializers.CharField(
        source='name',
        read_only=True
    )

    onair = serializers.BooleanField(
        source='is_onair',
        read_only=True
    )

    emission = serializers.JSONField(
        source='emission_data',
        read_only=True
    )

    item = serializers.JSONField(
        source='item_data',
        read_only=True
    )

    # emission = serializers.SerializerMethodField()
    # def get_emission(self, obj):
    #     try:
    #         return json.loads(obj.emission_data)
    #     except:
    #         return obj.emission_data
    #
    # item = serializers.SerializerMethodField()
    # def get_item(self, obj):
    #     try:
    #         return json.loads(obj.item_data)
    #     except:
    #         return obj.item_data




    class Meta:
        model = ScheduledItem
        fields = [
            'id',
            'uuid',
            'time_end',
            'time_start',
            'verbose_name',
            'onair',
            'starts_in',
            'ends_in',
            #
            'emission',
            'item',
        ]

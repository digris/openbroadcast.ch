# -*- coding: utf-8 -*-
import logging

from django.conf import settings
from rest_framework import serializers

from ..models import StreamEvent

log = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL


class StreamEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamEvent
        fields = [
            "ip",
            "method",
            "path",
            "status",
            "bytes_sent",
            "referer",
            "user_agent",
            "seconds_connected",
            "time_start",
            "time_end",
        ]

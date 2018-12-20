# -*- coding: utf-8 -*-

import logging
import bleach

from django.conf import settings
from bleach.linkifier import Linker
from django.contrib.auth import get_user_model
from rest_framework import serializers

from ..models import Message

log = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL

def shorten_url(attrs, new=False):
    attrs[(None, 'title')] = attrs['_text']
    attrs['_text'] = '(link)'
    return attrs

linker = Linker(callbacks=[shorten_url])


class UserSerializer(serializers.ModelSerializer):

    display_name = serializers.CharField(
        source='get_display_name',
        read_only=True
    )

    class Meta:
        model = get_user_model()
        fields = [
            'display_name',
            'username',
        ]


class MessageSerializer(serializers.ModelSerializer):

    # url = serializers.HyperlinkedIdentityField(
    #     view_name='api:chat-message-detail',
    #     lookup_field='uuid'
    # )

    sender = UserSerializer(
        source='user',
        read_only=True
    )
    #text = serializers.CharField(source='text', read_only=True)

    html = serializers.SerializerMethodField()
    def get_html(self, obj):
        return linker.linkify(obj.text)


    # me = serializers.SerializerMethodField()
    # def get_me(self, obj):
    #     request = self.context['request']
    #     return request.user.is_authenticated() and (obj.user == request.user)

    class Meta:
        model = Message
        #depth=1
        fields = [
            #'url',
            'uuid',
            'sender',
            'created',
            'text',
            'html',
            # 'me',
        ]

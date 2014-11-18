import os, tempfile, zipfile

from django.http import HttpResponse
from django.core.servers.basehttp import FileWrapper
from django.conf.urls import url

from tastypie.resources import ModelResource
from tastypie.exceptions import ImmediateHttpResponse
from tastypie.http import HttpForbidden
from tastypie.authentication import SessionAuthentication, Authentication, MultiAuthentication
from tastypie.authorization import Authorization

from achat.models import Message
from achat.util import parse_text


class MessageResource(ModelResource):

    class Meta:
        queryset = Message.objects.all()
        resource_name = 'chat/message'
        #detail_uri_name = 'token'
        detail_allowed_methods = ['get',]
        list_allowed_methods = ['get', 'post']
        include_resource_uri = False
        authentication = MultiAuthentication(SessionAuthentication(), Authentication())
        authorization = Authorization()
        excludes = ['id',]

    def obj_create(self, bundle, **kwargs):

        return super(MessageResource, self).obj_create(bundle, user=bundle.request.user)

    def hydrate(self, bundle):
        return bundle

    def hydrate(self, bundle):

        # strip & parse text
        bundle.data['text'] = parse_text(bundle.data['text'])
        return bundle

    def dehydrate(self, bundle):
        bundle.data['options'] = bundle.obj.options if bundle.obj.options else {}
        bundle.data['user'] = {
            'username': bundle.obj.user.username,
            'name': bundle.obj.user.get_full_name(),
            'id': bundle.obj.user.pk,
        }
        return bundle

    def get_object_list(self, request):
        return super(MessageResource, self).get_object_list(request).order_by('-created').all()


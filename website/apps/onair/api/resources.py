import os
import requests
import logging
from django.http import HttpResponse
from django.core.servers.basehttp import FileWrapper
from django.conf.urls import url
from django.conf import settings
from tastypie.resources import ModelResource, Resource, Bundle
from tastypie.fields import IntegerField
from tastypie.exceptions import ImmediateHttpResponse
from tastypie.http import HttpForbidden, HttpBadRequest
from tastypie.authentication import SessionAuthentication, Authentication, MultiAuthentication
from tastypie.authorization import Authorization


API_BASE_URL = getattr(settings, 'API_BASE_URL', None)

log = logging.getLogger(__name__)

class VoteObject(object):

    def __init__(self, vote, ct, id):
        self.vote = vote
        self.ct = ct
        self.id = id

    def process(self, request=None):
        #send vote to ratings API endpoint
        # TODO: implement async flow
        log.info('Processing vote by %s: %s - %s - %s' % (request.user, self.vote, self.ct, self.id))

        log.info('API base url %s' % API_BASE_URL)

        print request.user

        self.remote_vote(user=request.user, ct=self.ct, obj_id=self.id, value=self.vote)


    def remote_vote(self, user, ct, obj_id, value):

        pass




class VoteResource(Resource):

    id = IntegerField(attribute='id', null=True, blank=True)

    class Meta:
        resource_name = 'onair/vote'
        detail_allowed_methods = []
        list_allowed_methods = ['post', 'put',]
        include_resource_uri = False
        always_return_data = True
        authentication = MultiAuthentication(SessionAuthentication(), Authentication())
        authorization = Authorization()

    def detail_uri_kwargs(self, bundle_or_obj):
        kwargs = {}

        if isinstance(bundle_or_obj, Bundle):
            kwargs['pk'] = bundle_or_obj.obj.id
        else:
            kwargs['pk'] = bundle_or_obj.id

        return kwargs

    def obj_create(self, bundle, **kwargs):

        vote = bundle.data.get('vote', None)
        ct = bundle.data.get('ct', None)
        id = bundle.data.get('id', None)

        if not (bundle.request.user and vote and ct and id):
            raise ImmediateHttpResponse(
                response=HttpBadRequest('vote, ct & id required')
            )

        vote_object = VoteObject(vote=vote, ct=ct, id=id)
        vote_object.process(request=bundle.request)
        bundle.obj = vote_object
        bundle = self.full_hydrate(bundle)

        return bundle


"""
curl api calls:

    curl -X POST \
         -H "Accept: application/json" \
         -H "Content-Type: application/json" \
         -d '{"vote": 1, "ct": "media", "id": 123}' \
         -i \
         "http://local.openbroadcast.ch:8081/api/v1/onair/vote/"


"""
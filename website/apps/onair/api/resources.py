# -*- coding: utf-8 -*-
import os
import requests
import logging
import redis
import json
from django.http import HttpResponse
from django.core.servers.basehttp import FileWrapper
from django.conf.urls import url
from  django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from tastypie.resources import ModelResource, Resource, Bundle
from tastypie.fields import IntegerField
from tastypie.exceptions import ImmediateHttpResponse
from tastypie.http import HttpForbidden, HttpBadRequest
from tastypie.authentication import SessionAuthentication, Authentication, MultiAuthentication
from tastypie.authorization import Authorization

from onair.models import ScheduledItem

API_BASE_URL = getattr(settings, 'API_BASE_URL', None)
API_BASE_AUTH = getattr(settings, 'API_BASE_AUTH', None)
REDIS_HOST = getattr(settings, 'PUSHY_REDIS_HOST', None)
REDIS_SITE_ID = getattr(settings, 'PUSHY_REDIS_SITE_ID', None)

log = logging.getLogger(__name__)

if not API_BASE_URL:
    raise ImproperlyConfigured('settings.API_BASE_URL is required')

if not API_BASE_AUTH:
    raise ImproperlyConfigured('settings.API_BASE_AUTH is required')

if not (REDIS_HOST and REDIS_SITE_ID):
    raise ImproperlyConfigured('PUSHY_REDIS_HOST and PUSHY_REDIS_SITE_ID in settings is required!')

class VoteObject(object):

    def __init__(self, vote, ct, id):
        self.vote = vote
        self.ct = ct
        self.id = id

    def create_vote(self, request=None):

        log.debug('API base url %s' % API_BASE_URL)
        log.info('Processing vote by %s: %s - %s - %s' % (request.user, self.vote, self.ct, self.id))


        vote = self.remote_vote(user=request.user, ct=self.ct, obj_id=self.id, value=self.vote)

        if vote:
            rs = redis.StrictRedis(host=REDIS_HOST)
            try:
                log.debug('routing to: %s%s' % (REDIS_SITE_ID, 'arating.vote'))
                rs.publish('%s%s' % (REDIS_SITE_ID, 'arating_vote'), json.dumps(vote))
            except redis.ConnectionError, e:
                log.warning('unable to route message %s' % e)


    def remote_vote(self, user, ct, obj_id, value):

        # TODO: schould eventually be factured out

        """
        url pattern: /api/v1/rating/vote/<content_type>/<object_id>/<vote>/<remote_user_id>/
        example:     /api/v1/rating/vote/alibrary.media/13535/0/1243/
        """

        url = API_BASE_URL + 'v1/rating/vote/%s/%s/%s/%s/' % (ct, obj_id, value, user.remote_id)
        headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

        log.info('calling API with %s' % url)

        r = requests.get(url, headers=headers, verify=False)

        return r.json()


class VoteResource(Resource):
    """
    resource mapped directly to remote endpoint
    """

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
        vote_object.create_vote(request=bundle.request)
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


"""
model resources
"""



class ScheduledItemResource(ModelResource):

    class Meta:
        queryset = ScheduledItem.objects.history()
        resource_name = 'onair/schedule'
        detail_allowed_methods = ['get',]
        list_allowed_methods = ['get',]
        include_resource_uri = True
        authentication = MultiAuthentication(SessionAuthentication(), Authentication())
        authorization = Authorization()
        excludes = ['id',]

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle = {
            'time_end': obj.time_end,
            'time_start': obj.time_start,
            'verbose_name': obj.name,
            'onair': obj.is_onair,
            'starts_in': obj.starts_in,
            'ends_in': obj.ends_in,
            # content data
            'emission': obj.emission_url,
            'item': obj.item_url,
        }

        return bundle

    def __todo__get_object_list(self, request):
        return super(ScheduledItemResource, self).get_object_list(request).order_by('-created').all()


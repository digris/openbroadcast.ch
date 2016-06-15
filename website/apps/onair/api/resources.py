# -*- coding: utf-8 -*-
import os
import requests
import logging
import redis
import json
import datetime
from django.http import HttpResponse
from django.conf.urls import url
from  django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from tastypie.resources import ModelResource, Resource, Bundle
from tastypie.fields import IntegerField, CharField
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

        vote = self.create_remote_vote(user=request.user, ct=self.ct, obj_id=self.id, value=self.vote)

        if vote:
            rs = redis.StrictRedis(host=REDIS_HOST)
            try:
                log.debug('routing to: %s%s' % (REDIS_SITE_ID, 'arating.vote'))
                rs.publish('%s%s' % (REDIS_SITE_ID, 'arating_vote'), json.dumps(vote))
            except redis.ConnectionError, e:
                log.warning('unable to route message %s' % e)


    def create_remote_vote(self, user, ct, obj_id, value):

        # TODO: schould eventually be factured out

        """
        url pattern: /api/v1/rating/vote/<content_type>/<object_id>/<vote>/<remote_user_id>/
        example:     /api/v1/rating/vote/alibrary.media/13535/0/1243/
        """

        headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

        url = API_BASE_URL + 'v1/rating/vote/%s/%s/%s/%s/' % (ct, obj_id, value, user.remote_id)

        log.debug('calling API with %s' % url)

        r = requests.get(url, headers=headers, verify=False)

        return r.json()


class VoteResource(Resource):
    """
    resource mapped directly to remote endpoint
    """

    id = IntegerField(attribute='id', null=True, blank=True)
    #vote = CharField(attribute='vote', null=True, blank=True)


    class Meta:
        resource_name = 'onair/vote'
        detail_allowed_methods = ['get']
        list_allowed_methods = ['post', 'put', 'get']
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


    def obj_get(self, bundle, **kwargs):

        req = kwargs.get('pk', None)

        print req

        pk = req.split('/')[1]
        bundle.data['pk'] = int(pk)

        return bundle


    def dehydrate(self, bundle, **kwargs):
        """
        TODO: crappy implementation here...
        """

        try:
            obj_id = bundle.obj.data['pk']
            ct = 'alibrary.media'


            url = API_BASE_URL + 'v1/rating/vote/%s/%s/' % (ct, obj_id)
            headers = {'Authorization': 'ApiKey %s:%s' % (API_BASE_AUTH['username'], API_BASE_AUTH['api_key'])}

            log.debug('calling API with %s' % url)

            r = requests.get(url, headers=headers, verify=False)

            bundle.data = r.json()

        except:
            pass

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
'classic' model resources
"""
class ScheduledItemResource(ModelResource):

    class Meta:
        #queryset = ScheduledItem.objects.history().order_by('-time_start')
        queryset = ScheduledItem.objects.all().order_by('-time_start')
        #queryset = ScheduledItem.objects.filter(time_start__lte=datetime.datetime.now()).order_by('-time_start')
        resource_name = 'onair/schedule'
        detail_allowed_methods = ['get',]
        list_allowed_methods = ['get',]
        include_resource_uri = True
        authentication = MultiAuthentication(SessionAuthentication(), Authentication())
        authorization = Authorization()
        #excludes = ['id',]
        excludes = []


    def alter_list_data_to_serialize(self, request, data):
        try:
            next_item = ScheduledItem.objects.filter(time_start__gte=datetime.datetime.now()).order_by('time_start')[0]
            next_starts_in = next_item.starts_in
        except:
            next_starts_in = None

        onair = ScheduledItem.objects.filter(time_start__lte=datetime.datetime.now(), time_end__gte=datetime.datetime.now())

        data['meta']['next_starts_in'] = next_starts_in
        data['meta']['onair'] = onair.exists()
        return data


    def dehydrate(self, bundle):
        obj = bundle.obj

        expand = bundle.request.GET.get('expand', None)
        expand = expand.split() if expand else []

        if 'emission' in expand:
            emission = obj.emission_data
        else:
            emission = obj.emission_url

        if 'item' in expand:
            item = obj.item_data
        else:
            item = obj.item_url

        bundle = {
            'id': obj.id,
            'time_end': obj.time_end,
            'time_start': obj.time_start,
            'verbose_name': obj.name,
            'onair': obj.is_onair,
            'starts_in': obj.starts_in,
            'ends_in': obj.ends_in,
            # content data
            'emission': emission,
            'item': item,
        }

        return bundle

    def get_object_list(self, request):

        qs = super(ScheduledItemResource, self).get_object_list(request)

        range = request.GET.get('range', 'history')
        if range == 'history':
            qs = qs.filter(time_start__lte=datetime.datetime.now())

        return qs


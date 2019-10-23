# -*- coding: utf-8 -*-

# TODO: API v1 resource, this is only needed by the 'swissradioplayer console'
# refactor console app to API v2

import logging
import json
import datetime

from django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from tastypie.resources import ModelResource
from tastypie.authentication import (
    SessionAuthentication,
    Authentication,
    MultiAuthentication,
)
from tastypie.authorization import Authorization

from onair.models import ScheduledItem

API_BASE_URL = getattr(settings, "API_BASE_URL", None)
API_BASE_AUTH = getattr(settings, "API_BASE_AUTH", None)
REDIS_HOST = getattr(settings, "PUSHY_REDIS_HOST", None)
REDIS_SITE_ID = getattr(settings, "PUSHY_REDIS_SITE_ID", None)

log = logging.getLogger(__name__)

if not API_BASE_URL:
    raise ImproperlyConfigured("settings.API_BASE_URL is required")

if not API_BASE_AUTH:
    raise ImproperlyConfigured("settings.API_BASE_AUTH is required")


class ScheduledItemResource(ModelResource):
    class Meta:
        queryset = ScheduledItem.objects.all().order_by("-time_start")
        resource_name = "onair/schedule"
        detail_allowed_methods = ["get"]
        list_allowed_methods = ["get"]
        include_resource_uri = True
        authentication = MultiAuthentication(SessionAuthentication(), Authentication())
        authorization = Authorization()
        excludes = []

    def alter_list_data_to_serialize(self, request, data):
        try:
            next_item = ScheduledItem.objects.filter(
                time_start__gte=datetime.datetime.now()
            ).order_by("time_start")[0]
            next_starts_in = next_item.starts_in
        except:
            next_starts_in = None

        onair = ScheduledItem.objects.filter(
            time_start__lte=datetime.datetime.now(),
            time_end__gte=datetime.datetime.now(),
        )

        data["meta"]["next_starts_in"] = next_starts_in
        data["meta"]["onair"] = onair.exists()
        return data

    def dehydrate(self, bundle):
        obj = bundle.obj

        expand = bundle.request.GET.get("expand", None)
        expand = expand.split() if expand else []

        if "emission" in expand:
            try:
                emission = json.loads(obj.emission_data)
            except:
                emission = obj.emission_data
        else:
            emission = obj.emission_url

        if "item" in expand:
            try:
                item = json.loads(obj.item_data)
            except:
                item = obj.item_data
        else:
            item = obj.item_url

        bundle = {
            "id": obj.id,
            "time_end": obj.time_end,
            "time_start": obj.time_start,
            "verbose_name": obj.name,
            "onair": obj.is_onair,
            "starts_in": obj.starts_in,
            "ends_in": obj.ends_in,
            # content data
            "emission": emission,
            "item": item,
        }

        return bundle

    def get_object_list(self, request):

        qs = super(ScheduledItemResource, self).get_object_list(request)

        range = request.GET.get("range", "history")
        if range == "history":
            qs = qs.filter(time_start__lte=datetime.datetime.now())

        return qs

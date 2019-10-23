from __future__ import absolute_import, unicode_literals

from django.conf.urls import url, include
from tastypie.api import Api

from onair.api import ScheduledItemResource

api = Api(api_name="v1")

# onair
api.register(ScheduledItemResource())


urlpatterns = [
    url(r"^", include(api.urls)),
    # pass all so far unmatched requests to the API proxy
    url(r"^", include("apiproxy.urls")),
]

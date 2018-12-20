from __future__ import absolute_import, unicode_literals

from django.conf.urls import url, include
from tastypie.api import Api

from profiles.api import UserResource
#from achat.api import MessageResource
from onair.api import VoteResource, ScheduledItemResource

api = Api(api_name='v1')

# onair
# api.register(VoteResource())
api.register(ScheduledItemResource())

# alogin
api.register(UserResource())

# achat
#api.register(MessageResource())

urlpatterns = [
    url(r'^', include(api.urls)),
    # pass all so far unmatched requests to the API proxy
    url(r'^', include('apiproxy.urls')),
]

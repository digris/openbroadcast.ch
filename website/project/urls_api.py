from django.conf.urls import patterns, include
from tastypie.api import Api

from profiles.api import UserResource
from achat.api import MessageResource

api = Api(api_name='v1')





api.register(UserResource())
api.register(MessageResource())

urlpatterns = patterns('',
    (r'^', include(api.urls)),
    (r'^', include('apiproxy.urls')),
)
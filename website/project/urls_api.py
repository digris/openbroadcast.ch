from django.conf.urls import patterns, include
from tastypie.api import Api

api = Api(api_name='v1')

urlpatterns = patterns('',
    (r'^', include(api.urls)),
)
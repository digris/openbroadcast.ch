from django.conf.urls import patterns, include, url

from apiproxy.views import ResourceView

urlpatterns = [
    url(r'^(?P<uri>.*)$', ResourceView.as_view(), name='apiproxy-root'),
]

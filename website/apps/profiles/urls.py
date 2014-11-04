from django.conf.urls import patterns, url
from views import ProfileDetailView

urlpatterns = patterns('profiles.views',
    url(r'^profile/$', ProfileDetailView.as_view(), name='profile-detail'),
    #url(r'^profile/(?P<slug>[-\w]+)/$', ProfileDetailView.as_view(), name='profile-detail'),
)

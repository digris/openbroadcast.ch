from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
#from solid_i18n.urls import solid_i18n_patterns
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required

admin.autodiscover()

# urlpatterns = i18n_patterns('',
#     url(r'^admin/', include(admin.site.urls)),
#     url(r'^alogin/', include('alogin.urls')),
#     url(r'^sa/', include('social_auth.urls')),
#     url(r'^captcha/', include('captcha.urls')),
#     #url(r'^feedback/', include('backfeed.urls')),
#     url(r'^stationtime/', include('stationtime.urls')),
#     url(r'^remotelink/', include('remotelink.urls')),
# )


urlpatterns = [

    url(r'^debug/', TemplateView.as_view(template_name='debug.html')),
    url(r'^api/', include('project.urls_api')),
    url(r'^', include('contentproxy.urls')),
    url(r'^subscription/', include('subscription.urls')),
]

urlpatterns += i18n_patterns(
    url(r'^admin/', include(admin.site.urls)),
    url(r'^alogin/', include('alogin.urls')),
    url(r'^sa/', include('social_auth.urls')),
    url(r'^captcha/', include('captcha.urls')),
    # url(r'^feedback/', include('backfeed.urls')),
    url(r'^stationtime/', include('stationtime.urls')),
    url(r'^remotelink/', include('remotelink.urls')),
    url(r'^srp/', include('swissradioplayer.urls')),
    url(r'^', include('cms.urls')),
    prefix_default_language=False
)

if settings.DEBUG:

    from django.views.static import serve

    urlpatterns = [
        url(r'^media/(?P<path>.*)$', serve,
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        url(r'', include('django.contrib.staticfiles.urls')),
    ] + urlpatterns

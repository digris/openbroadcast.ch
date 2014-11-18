from django.conf.urls import patterns, include, url
from django.conf.urls.i18n import i18n_patterns
from django.conf import settings
from django.contrib import admin
from django.views.static import serve
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required

admin.autodiscover()

#from bshop.views import shop

urlpatterns = i18n_patterns('',
    # Examples:
    # url(r'^$', 'project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    #url(r'^$', TemplateView.as_view(template_name='index.html')),

    #url(r'^admin/', include('client_admin.urls')),
    #url(r'^admin/', include(admin_site.urls)),
    url(r'^admin/', include(admin.site.urls)),

    url(r'^layouting/$', TemplateView.as_view(template_name='layouting.html')),

    #url(r'^accounts/', include('registration.backends.default.urls')),
    #url(r'^accounts/', include('authtools.urls')),
    #url(r'^accounts/', include('invitation.urls')),
    #url('^accounts/', include('registration.urls')),
    #url(r'^accounts/', include('bshop.urls')),

    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^ajaxlogin/', include('ajaxlogin.urls')),
    url(r'^sa/', include('social_auth.urls')),
    url(r'^feedback/', include('backfeed.urls')),
    url(r'^stationtime/', include('stationtime.urls')),


    # api
    #url(r'^api/', include(api.urls)),

    url(r'^docs/(?P<path>.*)', login_required(serve), {'document_root': '../doc/_build/html'}, 'docs'),

    # browser detectioin
    url(r'^bad-browser/', include('badbrowser.urls')),

    # auth
    #url(r'^accounts/', include('registration.backends.default.urls')),



)

urlpatterns += patterns('',
    url(r'^api/', include('project.urls_api')),
)

urlpatterns += i18n_patterns('',
    url(r'^', include('cms.urls')),
)

"""
if settings.DEBUG:
    # static files (images, css, javascript, etc.)
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve',
         {
            'document_root': settings.MEDIA_ROOT
         }
        )
    )
"""

if settings.DEBUG or 1 == 1:
    urlpatterns = patterns('',
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    url(r'', include('django.contrib.staticfiles.urls')),
) + urlpatterns
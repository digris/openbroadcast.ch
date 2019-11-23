from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
from django.urls import path, include
from django.conf import settings
from django.contrib import admin

admin.autodiscover()

urlpatterns = [
    # api v2 patterns
    # url(r"^api/v2/", include("app.urls_apiv2", namespace="api")),
    url(r"^api/v2/", include(("app.urls_apiv2", "api"), namespace="api")),
    url(r"^", include("contentproxy.urls")),
]

urlpatterns += i18n_patterns(
    path("admin/", admin.site.urls),
    path("account/", include("account.urls")),
    path("account/", include("django.contrib.auth.urls")),
    path("captcha/", include("captcha.urls")),
    path("s/", include("social_django.urls", namespace="social")),
    path("srp/", include("swissradioplayer.urls")),
    url(r"^", include("cms.urls")),
    prefix_default_language=False,
)

if settings.DEBUG:
    from django.views.static import serve
    urlpatterns = [
        url(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT, "show_indexes": False},
        ),
        url(r"", include("django.contrib.staticfiles.urls")),
    ] + urlpatterns

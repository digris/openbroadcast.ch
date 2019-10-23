from .base import *

INTERNAL_IPS = ("127.0.0.1",)

DEBUG = True

SITE_URL = "http://local.openbroadcast.ch:8080"


##################################################################
# db
##################################################################
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "ch_openbroadcast_local",
    }
}

TEMPLATES[0]["OPTIONS"]["loaders"] = [
    "django.template.loaders.filesystem.Loader",
    "django.template.loaders.app_directories.Loader",
    "django.template.loaders.eggs.Loader",
]

DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"


##################################################################
# cache
##################################################################
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"},
    # 'default': {
    #     'BACKEND': 'django_redis.cache.RedisCache',
    #     'LOCATION': 'redis://127.0.0.1:6379/7',
    #     'OPTIONS': {
    #         'CLIENT_CLASS': 'django_redis.client.DefaultClient',
    #     },
    # },
}
#
# SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
# SESSION_CACHE_ALIAS = 'default'


##################################################################
# queues
##################################################################
CELERY_BROKER_URL = "redis://localhost:6379/6"
CELERY_RESULT_BACKEND = "redis://localhost:6379/6"
CELERY_TASK_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]


##################################################################
# email
##################################################################
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


INSTALLED_APPS += [
    #'debug_toolbar',
    "django_extensions",
    #'dev',
    #'devserver',
]

MIDDLEWARE_CLASSES += [
    #'debug_toolbar.middleware.DebugToolbarMiddleware',
]

DEBUG_TOOLBAR_PANELS = [
    #'cachalot.panels.CachalotPanel',
]

# this fixes strange behaviour when running app through gunicorn
DEBUG_TOOLBAR_PATCH_SETTINGS = False

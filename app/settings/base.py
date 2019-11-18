# -*- coding: utf-8 -*-

import os
import sys
import dj_database_url
from decouple import config, Csv

gettext = lambda s: s
_ = gettext

##################################################################
# project directories & pythonpath
##################################################################
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
APP_ROOT = os.path.join(PROJECT_ROOT, "app")

# add app path
sys.path.insert(0, APP_ROOT)

# add additional paths
sys.path.insert(0, os.path.join(PROJECT_ROOT, "tools"))


##################################################################
# multisite settings
##################################################################
# Make sure to configure an appropriate one: "docs/multisite.md"
SITE_ID = config("SITE_ID", cast=int, default=1)
SITE_URL = config("SITE_URL", default="http://localhost:8080/")
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*,", cast=Csv())
PREPEND_WWW = config("PREPEND_WWW", default=False, cast=bool)


##################################################################
# project core settings
##################################################################
DEBUG = config("DEBUG", default=False, cast=bool)
SECRET_KEY = config("SECRET_KEY", default="---changeme---")

# auth cookie
SESSION_COOKIE_DOMAIN = config("SESSION_COOKIE_DOMAIN", default=None)
SESSION_COOKIE_NAME = "sid"
# CSRF / axios
# NOTE: axios not relevant for this project at the moment...
# https://stackoverflow.com/questions/39254562/csrf-with-django-reactredux-using-axios/44479078#44479078
CSRF_COOKIE_NAME = "csrftoken"

##################################################################
# language, translation & localisation
##################################################################
LANGUAGE_CODE = "de"
TIME_ZONE = "Europe/Zurich"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ("de", _("Deutsch")),
    # ('de-ch', _('Deutsch (Schweiz)')),
    # ('en', _('English')),
]

LOCALE_PATHS = [os.path.join(PROJECT_ROOT, "locale")]

ROOT_URLCONF = "app.urls"
WSGI_APPLICATION = "app.wsgi.application"
ASGI_APPLICATION = "app.routing.application"

##################################################################
# project apps
##################################################################
INSTALLED_APPS = [
    "django_slick_admin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "django.contrib.sitemaps",
    "django.contrib.humanize",
    #
    "channels",
    "raven.contrib.django.raven_compat",
    # 'django_celery_beat',
    # authentication
    "account",
    "social_django",
    "remoteauth",
    "captcha",
    # analytics (google & co)
    # cms base
    "cms",
    "menus",
    "sekizai",
    "treebeard",
    # cms modules
    # 'djangocms_picture',
    "djangocms_link",
    "djangocms_snippet",
    # 'cmsplugin_youtube',
    "djangocms_text_ckeditor",
    "filer",
    "easy_thumbnails",
    # cms custom modules
    "media_embed",
    # api
    "rest_framework",
    "rest_framework.authtoken",
    # 'compressor',
    # 'analytics',
    "ganalytics",
    # 'absolute',
    # project apps
    "base",
    "telegram_bot",
    "contentproxy",
    "chat",
    "onair",
    "listener",
    "rating",
    "stationtime",
    "heartbeat",
    "coverage",
    "program",
    "swissradioplayer",
]


##################################################################
# middleware
##################################################################
MIDDLEWARE_CLASSES = [
    "cms.middleware.utils.ApphookReloadMiddleware",
    "webpack.middleware.WebpackDevserverMiddleware",
    "turbolinks.middleware.TurbolinksMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "account.middleware.CustomSocialAuthExceptionMiddleware",
    "django.contrib.admindocs.middleware.XViewMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "cms.middleware.page.CurrentPageMiddleware",
    "cms.middleware.user.CurrentUserMiddleware",
    "cms.middleware.toolbar.ToolbarMiddleware",
    "cms.middleware.language.LanguageCookieMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

##################################################################
# database
##################################################################
DATABASES = {"default": dj_database_url.config()}

##################################################################
# cache
# REDIS_URL=redis://127.0.0.1:6379/
##################################################################
REDIS_URL = config("REDIS_URL", default=None)
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": "{}/0".format(REDIS_URL.rstrip("/")),
            "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
        }
    }
    SESSION_ENGINE = "django.contrib.sessions.backends.cache"
else:
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}


##################################################################
# media & static core
##################################################################
MEDIA_ROOT = config("MEDIA_ROOT", default=os.path.join(APP_ROOT, "media"))
MEDIA_URL = config("MEDIA_URL", "/media/")

STATIC_ROOT = config("STATIC_ROOT", default=os.path.join(APP_ROOT, "static-dist"))
STATIC_URL = config("STATIC_URL", default="/static/")

ADMIN_MEDIA_PREFIX = "/static/admin/"

# STATICFILES_STORAGE = 'app.storage.TolerantCompressedManifestStaticFilesStorage'

WHITENOISE_MIMETYPES = {".ttf": "application/x-font-ttf"}

STATICFILES_DIRS = [config("STATIC_ROOT", default=os.path.join(APP_ROOT, "static-src"))]

STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)

# sendfile
SENDFILE_BACKEND = "sendfile.backends.nginx"
SENDFILE_ROOT = os.path.join(MEDIA_ROOT, "private")
SENDFILE_URL = "/media/private"


##################################################################
# s3 flavored media handling
##################################################################
# DEFAULT_FILE_STORAGE = 'app.storage.MediaRootS3BotoStorage'


##################################################################
# media & static additional apps
##################################################################


##################################################################
# templates
##################################################################
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(APP_ROOT, "templates")],
        "APP_DIRS": False,
        "OPTIONS": {
            "context_processors": (
                "django.contrib.auth.context_processors.auth",
                # social auth
                "social_django.context_processors.backends",
                "social_django.context_processors.login_redirect",
                #
                "webpack.context_processors.webpack_devserver",
                "django.template.context_processors.i18n",
                "django.template.context_processors.request",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.contrib.messages.context_processors.messages",
                "django.template.context_processors.debug",
                "django_settings_export.settings_export",
                "cms.context_processors.cms_settings",
                "sekizai.context_processors.sekizai",
                # custom toolbar processor
                "base.context_processors.cms_toolbar",
            ),
            "loaders": [
                (
                    "django.template.loaders.cached.Loader",
                    [
                        # 'admin_tools.template_loaders.Loader',
                        "django.template.loaders.filesystem.Loader",
                        "django.template.loaders.app_directories.Loader",
                        "django.template.loaders.eggs.Loader",
                    ],
                )
            ],
        },
    }
]

#######################################################################
# cms
#######################################################################
CMS_REDIRECTS = True
CMS_SEO_FIELDS = True
CMS_SHOW_START_DATE = False
CMS_SHOW_END_DATE = False

CMS_CACHE_PREFIX = config("CMS_CACHE_PREFIX", default="_cms")

# CMS_CACHE_DURATIONS = {
#     'content': 120,
#     'menus': 3600,
#     'permissions': 3600,
# }

CMS_CACHE_DURATIONS = {"menus": 1, "content": 1, "permissions": 1}
CMS_PAGE_CACHE = False
CMS_PLACEHOLDER_CACHE = False
CMS_PLUGIN_CACHE = False


CMS_TEMPLATES = (("_cms/single-column.html", "1 Column"), ("_cms/home.html", "Home"))

CMS_PLACEHOLDER_CONF = {
    "content": {
        "name": _("Content"),
        # 'plugins': [
        #     #'TextPlugin',
        #     'PicturePlugin',
        #     'InlineSectionPlugin',
        #     'SnippetPlugin',
        # ],
        # 'text_only_plugins': [
        #     'LinkPlugin',
        #     'SimpleFilePlugin',
        #     'ServiceEmbedPlugin',
        # ],
        "extra_context": {
            # TODO: set to same value as container max with in grid
            "width": 1280
        },
        # 'plugin_modules': {
        #     'TextPlugin': _('Content'),
        #     'HTMLTemplatePlugin': 'Extra Plugins',
        # },
    }
}

# TODO: review editor settings & implement..
CKEDITOR_SETTINGS = {
    "language": "{{ language }}",
    "uiColor": "#ffffff",
    "toolbar_CMS": [
        ["Undo", "Redo"],
        ["cmsplugins", "ShowBlocks"],
        ["Styles"],
        ["Cut", "Copy", "Paste", "PasteText", "-", "Find", "Replace"],
        ["NumberedList", "BulletedList"],
        ["Source"],
        # ['Bold',]
    ],
    "startupOutlineBlocks": True,
    "stylesSet": [
        {"name": "Paragraph", "element": "p"},
        {"name": "Heading 1", "element": "h1"},
        {"name": "Heading 2", "element": "h2"},
        {"name": "Heading 3", "element": "h3"},
        {"name": "Heading 4", "element": "h4"},
        {"name": "span", "element": "span"},
    ],
}
##################################################################
# html templates / a.k.a. snippets
##################################################################
DJANGOCMS_HTML_TEMPLATES = [
    ("_snippets/foo.html", "My FOO Template"),
    ("_snippets/midem_partner.html", "MIDEM - Partner"),
]

##################################################################
# authentication
##################################################################
AUTH_USER_MODEL = "remoteauth.User"

# TODO: make dynamic
LOGIN_URL = "/account/login/"

AUTHENTICATION_BACKENDS = [
    # social-auth
    "social_core.backends.facebook.FacebookOAuth2",
    "social_core.backends.google.GoogleOAuth2",
    # remote api auth
    "remoteauth.backends.RemoteUserBackend",
]


##################################################################
# social auth
##################################################################
SOCIAL_AUTH_PIPELINE = (
    "social_core.pipeline.social_auth.social_details",
    "social_core.pipeline.social_auth.social_uid",
    "social_core.pipeline.social_auth.auth_allowed",
    "social_core.pipeline.social_auth.social_user",
    "social_core.pipeline.user.get_username",
    "social_core.pipeline.social_auth.associate_by_email",
    "social_core.pipeline.user.create_user",
    "social_core.pipeline.social_auth.associate_user",
    "social_core.pipeline.social_auth.load_extra_data",
    "social_core.pipeline.user.user_details",
    # 'social_core.pipeline.social_auth.associate_by_email',
    #'account.social_auth_pipeline.user_details.get_details',
)

SOCIAL_AUTH_USER_MODEL = "remoteauth.User"
SOCIAL_AUTH_EMAIL_FORM_URL = "account:login"

# facebook
SOCIAL_AUTH_FACEBOOK_KEY = config("SOCIAL_AUTH_FACEBOOK_KEY", default="**")
SOCIAL_AUTH_FACEBOOK_SECRET = config("SOCIAL_AUTH_FACEBOOK_SECRET", default="**")

SOCIAL_AUTH_FACEBOOK_SCOPE = ["email", "public_profile"]
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {"fields": "id,name,email"}

# google oauth2
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = config("SOCIAL_AUTH_GOOGLE_OAUTH2_KEY", default="**")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = config(
    "SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET", default="**"
)

SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

LOGIN_ERROR_URL = "/"
LOGIN_REDIRECT_URL = "/"

# AXES_COOLOFF_TIME = 1
# AXES_META_PRECEDENCE_ORDER = [
#     'HTTP_X_FORWARDED_FOR',
#     'X_FORWARDED_FOR',
# ]
#


##################################################################
# REST API (DRF)
##################################################################
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
}


##################################################################
# channels
##################################################################
if REDIS_URL:
    CHANNELS_REDIS_HOST = "{}/3".format(REDIS_URL.rstrip("/"))
else:
    CHANNELS_REDIS_HOST = "redis://localhost:6379/3"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [CHANNELS_REDIS_HOST]},
    }
}


##################################################################
# celery / tasks / schedule
##################################################################
from datetime import timedelta

##################################################################
# queues
##################################################################
if REDIS_URL:
    CELERY_REDIS_HOST = "{}/6".format(REDIS_URL.rstrip("/"))
else:
    CELERY_REDIS_HOST = "redis://localhost:6379/6"

CELERY_BROKER_URL = CELERY_REDIS_HOST
CELERY_RESULT_BACKEND = CELERY_REDIS_HOST
CELERY_TASK_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]

##################################################################
# schedule
##################################################################
CELERY_BEAT_SCHEDULE = {
    "onair-update-schedule": {
        "task": "onair.tasks.update_schedule",
        "schedule": timedelta(seconds=60),
        "kwargs": {"time_range": (-600, 600)},
    },
    "onair-cleanup-schedule": {
        "task": "onair.tasks.cleanup_schedule",
        "schedule": timedelta(seconds=60 * 60),
        "kwargs": {"max_age": 12 * 60 * 60},
    },
    "contentproxy-cleanup-cache": {
        "task": "contentproxy.tasks.cleanup_cache",
        "schedule": timedelta(seconds=60 * 60),
        "kwargs": {"max_age": 12 * 60 * 60},
    },
}


##################################################################
# remote / API connections
##################################################################
REMOTE_BASE_URL = config(
    "REMOTE_BASE_URL", default="https://www.openbroadcast.org"
).rstrip("/")

API_BASE_URL = config("REMOTE_BASE_URL", default="{}/api/".format(REMOTE_BASE_URL))
STATIC_BASE_URL = config("REMOTE_BASE_URL", default=REMOTE_BASE_URL)
ASSET_BASE_URL = config("REMOTE_BASE_URL", default="{}/".format(REMOTE_BASE_URL))
REMOTE_AUTH_ENDPOINT = config(
    "REMOTE_BASE_URL", default="{}/api/v1/auth/user/".format(REMOTE_BASE_URL)
)

# API_BASE_AUTH = {'username': 'remote', 'api_key': 'd65b075c593f27a42c26e65be74c047e5b50d215'}

STREAM_URL = config(
    "STREAM_URL", default="https://www.openbroadcast.org/stream/openbroadcast"
)

API_BASE_AUTH = {
    "username": config("REMOTE_API_AUTH_USER", default="none"),
    "api_key": config("REMOTE_API_AUTH_KEY", default="none"),
}

REMOTE_API_BASE_URL = config(
    "REMOTE_API_BASE_URL", default="https://www.openbroadcast.org/api/v2/"
)
REMOTE_API_AUTH_TOKEN = config("REMOTE_API_AUTH_TOKEN", default=None)


##################################################################
# email settings
##################################################################
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


##################################################################
# admin-tools dashboard
##################################################################
ADMIN_TOOLS_INDEX_DASHBOARD = "app.dashboard.AdminIndexDashboard"


##################################################################
# exported settings
##################################################################
SETTINGS_EXPORT = [
    "DEBUG",
    "SITE_URL",
    "REMOTE_BASE_URL",
    "GANALYTICS_TRACKING_CODE",
    # 'API_BASE_URL',
    # 'STREAM_URL',
    # 'STATIC_BASE_URL',
]


##################################################################
# messages (the django.contrib ones :) )
##################################################################
MESSAGE_STORAGE = "django.contrib.messages.storage.session.SessionStorage"


##################################################################
# file upload
##################################################################
# avoid in-memory files (as we need fs access)
FILE_UPLOAD_HANDLERS = ["django.core.files.uploadhandler.TemporaryFileUploadHandler"]


##################################################################
# proxy & co
##################################################################
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


##################################################################
# captcha
##################################################################
CAPTCHA_FILTER_FUNCTIONS = []
CAPTCHA_LETTER_ROTATION = (-12, 12)
CAPTCHA_BACKGROUND_COLOR = "#ffffff"
CAPTCHA_FOREGROUND_COLOR = "#000000"
CAPTCHA_NOISE_FUNCTIONS = ("captcha.helpers.noise_dots",)
CAPTCHA_FILTER_FUNCTIONS = []
CAPTCHA_PUNCTUATION = """_"',.;:-"""
CAPTCHA_LENGTH = 6
CAPTCHA_IMAGE_SIZE = (160, 50)


##################################################################
# 3rd party keys & tokens
##################################################################
FACEBOOK_APP_ID = config("FACEBOOK_APP_ID", default="---")


##################################################################
# analytics & co
##################################################################
GANALYTICS_TRACKING_CODE = config("GANALYTICS_TRACKING_CODE", default=None)


##################################################################
# telegram bot
##################################################################
TELEGRAM_BOT_TOKEN = config("TELEGRAM_BOT_TOKEN", default=None)


##################################################################
# log handling / sentry
##################################################################
RAVEN_SENTRY_DSN = config("RAVEN_SENTRY_DSN", default=None)
if RAVEN_SENTRY_DSN:
    RAVEN_CONFIG = {"dsn": RAVEN_SENTRY_DSN}

if RAVEN_SENTRY_DSN:
    LOGGING_ROOT_HALNDLERS = ["sentry"]
else:
    LOGGING_ROOT_HALNDLERS = ["console"]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "root": {"level": "WARNING", "handlers": LOGGING_ROOT_HALNDLERS},
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s "
            "%(process)d %(thread)d %(message)s"
        }
    },
    "handlers": {
        "sentry": {
            "level": "ERROR",
            "class": "raven.contrib.django.raven_compat.handlers.SentryHandler",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django.db.backends": {
            "level": "ERROR",
            "handlers": ["console"],
            "propagate": False,
        },
        "django": {"handlers": ["console"], "propagate": False, "level": "INFO"},
        "raven": {"level": "INFO", "handlers": ["console"], "propagate": False},
        "sentry.errors": {"level": "INFO", "handlers": ["console"], "propagate": False},
        #
        "onair": {"handlers": ["console"], "propagate": False, "level": "DEBUG"},
        "rating": {"handlers": ["console"], "propagate": False, "level": "DEBUG"},
        "chat": {"handlers": ["console"], "propagate": False, "level": "DEBUG"},
        "contentproxy": {"handlers": ["console"], "propagate": False, "level": "DEBUG"},
        "telegram_bot": {"handlers": ["console"], "propagate": False, "level": "DEBUG"},
        "remoteauth": {"handlers": ["console"], "propagate": False, "level": "INFO"},
    },
}

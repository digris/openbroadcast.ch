# -*- coding: utf-8 -*-
import os
import sys
import posixpath
from datetime import timedelta

gettext = lambda s: s
_ = gettext

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
sys.path.insert(0, os.path.join(BASE_DIR, 'tools'))
sys.path.insert(0, os.path.join(BASE_DIR, 'cmsplugins'))
sys.path.insert(0, os.path.join(BASE_DIR, 'ecommerce'))


SITE_ID = 1
BASE_SITE_ID = 1
SECRET_KEY = 'j1odx#ji=z%r@in1k3pj4=&kwgv&4dv78^9!nymh+vhy9m4&e*'
DEBUG = True
ALLOWED_HOSTS = []

LOCALE_PATHS = ('%s/locale/' % BASE_DIR,)

# Internationalization
LANGUAGE_CODE = 'de-ch'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('de-ch', _('German')),
    ('en', _('English')),
]

CMS_LANGUAGES = {
    1: [
        {
            'code': 'de-ch',
            'name': _('German'),
            'public': True,
            'redirect_on_fallback': False,
        },
        {
            'code': 'en',
            'name': _('English'),
            'fallbacks': ['de-ch',],
            'public': True,
        },
    ],
    'default': {
        'fallbacks': ['en', 'de-ch',],
        'redirect_on_fallback': False,
        'public': False,
        'hide_untranslated': False,
    }
}

PARLER_DEFAULT_LANGUAGE_CODE = 'de-ch'
PARLER_LANGUAGES = {
    # Global site
    1: (
        {'code': 'de-ch',},
        {'code': 'en',},
    ),
    'default': {
        'hide_untranslated': False,
    }
}

SOLID_I18N_USE_REDIRECTS = False

ROOT_URLCONF = 'project.urls'
WSGI_APPLICATION = 'project.wsgi.application'

INSTALLED_APPS = (

    #'djangocms_admin_style',
    #'admin_shortcuts',
    'django_slick_admin',

    # django base
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.sitemaps',
    'django.contrib.humanize',
    'solid_i18n',
    'alogin',

    # wip only
    'django.contrib.webdesign',

    # life-savers
    'crispy_forms',
    'raven.contrib.django.raven_compat',
    'tastypie',
    'kombu.transport.django',
    #'relatedadminlink',

    'remoteauth',

    # cms
    'cms',
    'mptt',
    'treebeard', # mptt replacement for cms
    'menus',
    'sekizai',

    'djangocms_picture',
    'djangocms_link',

    'djangocms_gmaps',
    'djangocms_snippet',


    'filer',
    'cmsplugin_filer_file',
    #'cmsplugin_filer_folder',
    'cmsplugin_filer_image',
    #'cmsplugin_filer_teaser',
    #'cmsplugin_filer_video',
    'cmsplugin_youtube',
    'djangocms_column',

    'turbolinks',
    'nunjucks',

    'djangocms_text_ckeditor',
    'apiproxy',
    'pushy_client',

    'django_extensions',
    'compressor',
    'easy_thumbnails',
    'analytics',
    'absolute',
    'emailit',
    'hvad',
    'colorfield',
    'geoposition',

    'base',
    'bplayer',
    'achat',
    'onair',
    'backfeed',
    'stationtime',
    'remotelink',
    'livecolor',
    'contentproxy',
    'profiles',
    'ticker',
    'team',
    'program',
    'partnerlink',
    'social_auth',
    'subscription',

)

AUTH_USER_MODEL = 'remoteauth.User'

REGISTRATION_SUPPLEMENT_CLASS = 'wholesale.models.DealerRegistration'
REGISTRATION_DJANGO_AUTH_URL_NAMES_PREFIX = 'auth_'
REGISTRATION_DEFAULT_PASSWORD_LENGTH = 14

MIDDLEWARE_CLASSES = (

    'django.contrib.sessions.middleware.SessionMiddleware',
    'turbolinks.middleware.TurbolinksMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'solid_i18n.middleware.SolidLocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware',
    #'base.middleware.AJAXLoaderRedireckMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'social_auth.middleware.SocialAuthExceptionMiddleware',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'data.sqlite3'),
    }
}

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

# http://docs.celeryproject.org/en/latest/configuration.html#celeryd-prefetch-multiplier
CELERYD_PREFETCH_MULTIPLIER = 1

CELERYBEAT_SCHEDULE = {
    'onair-update-schedule': {
        'task': 'onair.tasks.update_schedule',
        'schedule': timedelta(seconds=60),
        'kwargs': {'range_start': 600, 'range_end': 600}
    },
    'onair-cleanup-schedule': {
        'task': 'onair.tasks.cleanup_schedule',
        'schedule': timedelta(seconds=60*60),
        'kwargs': {'max_age': 12*60*60}
    },
    'contentproxy-cleanup-cache': {
        'task': 'contentproxy.tasks.cleanup_cache',
        'schedule': timedelta(seconds=60*60),
        'kwargs': {'max_age': 12*60*60}
    },
    # 'livecolor-update-colors': {
    #     'task': 'livecolor.tasks.update_colors',
    #     'schedule': timedelta(seconds=120),
    #     #'kwargs': {'range_start': 600, 'range_end': 600}
    # },
}


TASTYPIE_DEFAULT_FORMATS = ['json', ]

# auth
AUTHENTICATION_BACKENDS = (
    # social-auth
    'social_auth.backends.twitter.TwitterBackend',
    'social_auth.backends.facebook.FacebookBackend',
    'social_auth.backends.google.GoogleOAuth2Backend',
    'social_auth.backends.contrib.dropbox.DropboxBackend',
    'social_auth.backends.contrib.soundcloud.SoundcloudBackend',
    # remote api auth
    'remoteauth.backends.RemoteUserBackend',
)

LOGIN_ERROR_URL = '/'


ANONYMOUS_USER_ID = -1
ACCOUNT_ACTIVATION_DAYS = 7

CMS_GIT_FILE = os.path.join(BASE_DIR, 'changelog.txt')
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

JENKINS_TASKS = (
    'django_jenkins.tasks.run_pylint',
    'django_jenkins.tasks.with_coverage',
    'django_jenkins.tasks.run_pep8',
    'django_jenkins.tasks.run_pyflakes',
)

MIGRATION_MODULES = {
    # filer plugins
    'cmsplugin_filer_file': 'cmsplugin_filer_file.migrations_django',
    'cmsplugin_filer_folder': 'cmsplugin_filer_folder.migrations_django',
    'cmsplugin_filer_link': 'cmsplugin_filer_link.migrations_django',
    'cmsplugin_filer_image': 'cmsplugin_filer_image.migrations_django',
    'cmsplugin_filer_teaser': 'cmsplugin_filer_teaser.migrations_django',
    'cmsplugin_filer_video': 'cmsplugin_filer_video.migrations_django',
    # other plugins
    'cmsplugin_youtube': 'cmsplugin_youtube.migrations_django',
}


# registration
ACCOUNT_ACTIVATION_DAYS = 7

# Apps to run ci-tests on
PROJECT_APPS = (
    # 'my_app',
)

SETTINGS_EXPORT = [
    'DEBUG',
    'API_BASE_URL',
    'STREAM_URL',
    'STATIC_BASE_URL',
    'ONAIR_LOAD_HISTORY',
]

ADMIN_SHORTCUTS = [
    {
        'title': _('Quick Links'),
        'shortcuts': [
            {
                'url': '/',
                'title': _('Public Site'),
                'open_new_window': True,
            },
            {
                'url': 'https://lab.hazelfire.com/projects/openbroadcast-ch/activity',
                'title': _('Bug- & Issue Tracker'),
                'open_new_window': True,
                'class': 'tool',
            },
        ]
    },
    {
        'title': _('Administration'),
        'shortcuts': [
            {
                'url_name': 'admin:cms_page_changelist',
                'title': _('CMS Pages'),
            },
        ]
    },
]

BADBROWSER_REQUIREMENTS = (
	("firefox", "22.0"),
	("chrome", "22.0"),
	("microsoft internet explorer", "11.0"),
	("opera", None),
)
BADBROWSER_SUGGEST = ('chrome', 'safari', 'ie', 'firefox', )

#LOGIN_REDIRECT_URL = '/accounts/contact/'
LOGIN_REDIRECT_URL = '/'

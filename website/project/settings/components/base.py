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

#SOLID_I18N_USE_REDIRECTS = False

ROOT_URLCONF = 'project.urls'
WSGI_APPLICATION = 'project.wsgi.application'

INSTALLED_APPS = [

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
    #'solid_i18n',

    'account',
    'social_django',

    'alogin',


    # life-savers
    'crispy_forms',
    'raven.contrib.django.raven_compat',
    'tastypie',
    #'kombu.transport.django',
    #'relatedadminlink',

    'remoteauth',
    'captcha',

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
    'stationtime',
    'heartbeat',
    'remotelink',
    'livecolor',
    'contentproxy',
    'profiles',
    'ticker',
    'team',
    'coverage',
    'program',
    'subscription',
    'swissradioplayer',

]

TO_BE_UNINSTALLED_APPS = [
    'partnerlink',
]

INSTALLED_APPS += TO_BE_UNINSTALLED_APPS


AUTH_USER_MODEL = 'remoteauth.User'

REGISTRATION_SUPPLEMENT_CLASS = 'wholesale.models.DealerRegistration'
REGISTRATION_DJANGO_AUTH_URL_NAMES_PREFIX = 'auth_'
REGISTRATION_DEFAULT_PASSWORD_LENGTH = 14

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'webpack.middleware.WebpackDevserverMiddleware',
    'turbolinks.middleware.TurbolinksMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    #'solid_i18n.middleware.SolidLocaleMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'social_django.middleware.SocialAuthExceptionMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware',
    #'base.middleware.AJAXLoaderRedireckMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

# SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
# SESSION_CACHE_ALIAS = 'default'

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'



##################################################################
# media, static & co
##################################################################
# media deliver
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

ADMIN_MEDIA_PREFIX = '/static/admin/'

# static files (application js/img etc)
# STATIC_ROOT = os.path.join(BASE_DIR, 'static')
# STATIC_URL = '/static/'
# STATICFILES_DIRS = (
#     os.path.join(BASE_DIR, 'site-static'),
# )

# refactoring to webpack
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static-src'),
)



STATICFILES_FINDERS = (
    'compressor.finders.CompressorFinder',
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

#STATICFILES_STORAGE = 'require.storage.OptimizedStaticFilesStorage'

THUMBNAIL_PROCESSORS = (
    'easy_thumbnails.processors.colorspace',
    'easy_thumbnails.processors.autocrop',
    #'easy_thumbnails.processors.scale_and_crop',
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
    'easy_thumbnails.processors.filters',
)
THUMBNAIL_QUALITY = 80
THUMBNAIL_HIGH_RESOLUTION = True

CMSPLUGIN_FILER_IMAGE_STYLE_CHOICES = (
    ('default', 'Default'),
    ('inline', 'Inline'),
)
CMSPLUGIN_FILER_IMAGE_DEFAULT_STYLE = 'inline'




##################################################################
# templates
##################################################################
CRISPY_TEMPLATE_PACK = 'bootstrap3'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
        'APP_DIRS': False,
        'OPTIONS': {
            'context_processors': (
                'django.contrib.auth.context_processors.auth',
                # social auth
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',

                'webpack.context_processors.webpack_devserver',
                'django.template.context_processors.i18n',
                'django.template.context_processors.request',
                'django.contrib.messages.context_processors.messages',
                'absolute.context_processors.absolute',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'cms.context_processors.cms_settings',
                'sekizai.context_processors.sekizai',
                'django_settings_export.settings_export',

                # custom
                'base.context_processors.cms_toolbar'
            ),
            'loaders': [
                ('django.template.loaders.cached.Loader', [
                    'django.template.loaders.filesystem.Loader',
                    'django.template.loaders.app_directories.Loader',
                    'django.template.loaders.eggs.Loader',
                ]),
            ],
        },
    },
]

#######################################################################
# cms
#######################################################################
CMS_REDIRECTS = True
CMS_SEO_FIELDS = True
CMS_CACHE_PREFIX = '__site__'
CMS_SHOW_START_DATE = True
CMS_SHOW_END_DATE = True

CMS_TEMPLATES = (
    ('_cms/single-column.html', '1 Column'),
    ('_cms/two-columns.html', '2 Columns'),
    ('_cms/home.html', 'Home'),
    ('_cms/fs-video.html', 'Video (full-screen)'),
    #('_templates/cms_construction.html', 'Under construction'),
)

CONTENT_PLUGINS = ['TextPlugin', 'LinkPlugin']
CONTENT_PLUGINS.extend(['AppshotPlugin', 'BoxedPlugin', 'FAQMultiListPlugin', 'FilerFilePlugin', 'FilerImagePlugin', 'FilerSVGPlugin', 'MapPlugin', 'SingleProductPlugin', 'SnippetPlugin', 'TextPlugin', 'YouTubePlugin', ])



DEFAULT_PLUGINS = [
            {
                'plugin_type': 'TextPlugin',
                'values': {
                    'body':'<h1>Lorem ipsum dolor sit amet... </h1><p>(Double-click me to edit!)</p>',
                },
            },
        ]


CMS_PLACEHOLDER_CONF = {
    'content': {
        #'plugins': ['TextPlugin', 'PicturePlugin'],
        #'text_only_plugins': ['LinkPlugin'],
        'extra_context': {"width": 640},
        'name': _("Main Content"),
        'default_plugins': DEFAULT_PLUGINS,
    },
    'sidebar': {
        #"plugins": ['TextPlugin', 'LinkPlugin'],
        "extra_context": {"width": 280},
        'name': _("Sidebar"),
        'limits': {
            'global': 4,
            'TeaserPlugin': 1,
            'LinkPlugin': 10,
        },
        'default_plugins': DEFAULT_PLUGINS,
    },
    'ticker_article_content': {
        #'plugins': ['TextPlugin', 'PicturePlugin'],
        #'text_only_plugins': ['LinkPlugin'],
        'extra_context': {"width": 640},
        'name': _("Main Content"),
        'default_plugins': [
            {
                'plugin_type': 'TextPlugin',
                'values': {
                    'body':'<p>(Double-click me to edit!)</p>',
                },
            },
        ],
    },
}

CMS_PLUGIN_PROCESSORS = (
    'base.cms_plugin_processors.wrap_text',
)

CKEDITOR_SETTINGS = {
    'language': '{{ language }}',
    'uiColor': '#ffffff',
    'contentsCss': STATIC_URL + 'css/cms/editor.css',
    'toolbar_CMS': [
        ['Undo', 'Redo'],
        ['cmsplugins', 'ShowBlocks',],
        #['Format', 'Styles'],
        ['Styles',],
        ['Cut','Copy','Paste','PasteText', '-', 'Find','Replace'],
        ['NumberedList', 'BulletedList',],
        ['Source',],
        ['Bold', 'Italic', 'Underline', '-', 'Subscript', 'Superscript', '-', 'RemoveFormat'],
    ],
    'startupOutlineBlocks': True,
    'skin': 'moono',
    #'extraPlugins': 'blockquote',

    'stylesSet': [

        # alternative to 'format' selector
        {'name': 'Paragraph', 'element': 'p',},
        {'name': 'Heading 1 (only _one_ per page!)', 'element': 'h1',},
        {'name': 'Heading 2', 'element': 'h2',},
        {'name': 'Heading 3', 'element': 'h3',},
        {'name': 'Heading 4', 'element': 'h4',},

        {'name': 'Highlight', 'element': 'p', 'attributes': { 'class': 'highlight' }},

        #{'name': 'BQ', 'element': 'blockquote', 'attributes': { 'class': 'bq' }},

        {'name': 'Marked "info"', 'element': 'p', 'attributes': { 'class': 'marked-info' }},
        {'name': 'Marked "hint"', 'element': 'p', 'attributes': { 'class': 'marked-hint' }},
        {'name': 'Marked "warning"', 'element': 'p', 'attributes': { 'class': 'marked-warning' }},
        {'name': 'Marked "alert"', 'element': 'p', 'attributes': { 'class': 'marked-alert' }},

        {'name': 'Quote', 'element': 'p', 'attributes': { 'class': 'blockquote' }},

        {'name': 'Dimmed', 'element': 'p', 'attributes': { 'class': 'dimmed' }},
        #{'name': 'Address', 'element': 'address',},

        {'name': 'Cited Work', 'element': 'cite',},
        {'name': 'Inline Quotation', 'element': 'q',},

        # custom elements
        {'name': 'Italic Title',
        'element': 'h2',
        'styles': {
            'font-style': 'italic'
        }},

    ]

}



CELERY_BEAT_SCHEDULE = {
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
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    # remote api auth
    'remoteauth.backends.RemoteUserBackend',
)





##################################################################
# social auth
##################################################################

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
    # 'social_core.pipeline.social_auth.associate_by_email',
    #'account.social_auth_pipeline.user_details.get_details',
)



SOCIAL_AUTH_USER_MODEL = 'remoteauth.User'
SOCIAL_AUTH_EMAIL_FORM_URL = 'account:login'


# facebook
SOCIAL_AUTH_FACEBOOK_KEY = '**'
SOCIAL_AUTH_FACEBOOK_SECRET = '**'
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email', 'public_profile',]
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    'fields': 'id,name,email',
}

# google oauth2
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '**'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = '**'

SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    # 'https://www.googleapis.com/auth/plus.me',
    # 'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]


LOGIN_ERROR_URL = '/'


ANONYMOUS_USER_ID = -1
ACCOUNT_ACTIVATION_DAYS = 7

CMS_GIT_FILE = os.path.join(BASE_DIR, 'changelog.txt')
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


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

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

CAPTCHA_LETTER_ROTATION = (-13, 13)
CAPTCHA_BACKGROUND_COLOR = '#e6e6e6'
CAPTCHA_FOREGROUND_COLOR = '#000'
CAPTCHA_CHALLENGE_FUNCT = 'captcha.helpers.random_char_challenge'
CAPTCHA_NOISE_FUNCTIONS = ('captcha.helpers.noise_arcs',)
CAPTCHA_FILTER_FUNCTIONS = ()
CAPTCHA_PUNCTUATION = '''_"',.;:-'''
CAPTCHA_LENGTH = 6
CAPTCHA_IMAGE_SIZE = (120, 30)
CAPTCHA_FIELD_TEMPLATE = 'captcha/field.html'

SETTINGS_EXPORT = [
    'DEBUG',
    'API_BASE_URL',
    'STREAM_URL',
    'STATIC_BASE_URL',
    'ONAIR_LOAD_HISTORY',
]

LOGIN_REDIRECT_URL = '/'

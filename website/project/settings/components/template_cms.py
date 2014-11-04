# -*- coding: utf-8 -*-
TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, "templates"),
)

CRISPY_TEMPLATE_PACK = 'bootstrap3'

FLAVOURS = ('full', 'mobile', 'tablet', 'experiment')

CMS_REDIRECTS = True
CMS_SEO_FIELDS = True
CMS_CACHE_PREFIX = '__site__'
CMS_SHOW_START_DATE = True
CMS_SHOW_END_DATE = True

CMS_TEMPLATES = (
    ('_cms/two-columns.html', '2 Columns'),
    ('_cms/single-column.html', '1 Column'),
    ('_cms/home.html', 'Home'),
    ('_cms/fs-video.html', 'Video (full-screen)'),
    #('_templates/cms_construction.html', 'Under construction'),
)

CMS_LANGUAGES = {
    1: [
        {
            'code': 'en',
            'name': 'English',
            'fallbacks': ['de', 'fr'],
            'public': True,
            'hide_untranslated': True,
            'redirect_on_fallback': False,
        },
        {
            'code': 'de',
            'name': 'Deutsch',
            'fallbacks': ['en', 'fr'],
            'public': True,
        },
    ],
    'default': {
        'fallbacks': ['en', 'de',],
        'redirect_on_fallback': False,
        'public': False,
        'hide_untranslated': False,
    }
}




CONTENT_PLUGINS = ['TextPlugin', 'LinkPlugin']
CONTENT_PLUGINS.extend(['AppshotPlugin', 'BoxedPlugin', 'FAQMultiListPlugin', 'FilerFilePlugin', 'FilerImagePlugin', 'FilerSVGPlugin', 'MapPlugin', 'SingleProductPlugin', 'SnippetPlugin', 'TextPlugin', 'YouTubePlugin', ])

CMS_PLACEHOLDER_CONF = {
    'main_content': {
        #'plugins': ['TextPlugin', 'PicturePlugin'],
        'text_only_plugins': ['LinkPlugin'],
        'extra_context': {"width": 640},
        'name': _("Content"),
    },
    'sidebar': {
        "plugins": ['TextPlugin', 'LinkPlugin'],
        "extra_context": {"width": 280},
        'name': _("Right Column"),
        'limits': {
            'global': 2,
            'TeaserPlugin': 1,
            'LinkPlugin': 1,
        },
    },
    'content_right': {
        "plugins": CONTENT_PLUGINS,
        'name': "Main Content",
        'limits': {
            'global': 20,
            #'TeaserPlugin': 1,
        },
    },
    'content_left': {
        "plugins": CONTENT_PLUGINS,
        'name': "Secondary Content",
        'limits': {
            'global': 20,
        },
    },
    'cms_onepage.html main_content': {
        "plugins": ['EmbeddedPagesPlugin', ]
    },
}

#CMS_PLUGIN_PROCESSORS = (
#    'base.cms_plugin_processors.wrap_text',
#)

TEMPLATE_LOADERS = (
    'django_mobile.loader.Loader',
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'django.template.loaders.eggs.Loader',
)
"""
TEMPLATE_LOADERS = (
    'django_mobile.loader.Loader',
    ('django.template.loaders.cached.Loader', (
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
        'django.template.loaders.eggs.Loader',
    )),
)
"""
TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'absolute.context_processors.absolute',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'cms.context_processors.cms_settings',
    'django_mobile.context_processors.flavour',
    'sekizai.context_processors.sekizai',
)


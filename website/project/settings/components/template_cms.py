# -*- coding: utf-8 -*-
TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, "templates"),
)

CRISPY_TEMPLATE_PACK = 'bootstrap3'


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
            'LinkPlugin': 1,
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
                    'body':'<h1>I\'m a blog post... </h1><p>(Double-click me to edit!)</p>',
                },
            },
        ],
    },
}

CMS_PLUGIN_PROCESSORS = (
    'base.cms_plugin_processors.wrap_text',
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'absolute.context_processors.absolute',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'cms.context_processors.cms_settings',
    'sekizai.context_processors.sekizai',
    'django_settings_export.settings_export',


    # authentication
    'social_auth.context_processors.social_auth_backends',
    'social_auth.context_processors.backends_data',
    'social_auth.context_processors.social_auth_login_redirect',
)





TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': TEMPLATE_DIRS,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': TEMPLATE_CONTEXT_PROCESSORS,
        },
    },
]





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
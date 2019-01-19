"""
TubePlayer plugin
"""
from django.conf import settings
from django.utils.translation import ugettext as _

THEME_CHOICES = (
    ('light', _('light')),
    ('dark', _('dark')),
)
COLOR_CHOICES = (
    ('white', _('white')),
    ('red', _('red')),
)

RATIO_CHOICES = (
    (1.33, '3/4 (default)'),
    (1.78, '16/9 (widescreen)'),
    (1.6, '16/10 (widescreen)'),
    (1.4, '14/10 (extra widescreen)'),
)

CMS_YOUTUBE_DEFAULT_THEME = getattr(settings, 'CMS_YOUTUBE_DEFAULT_THEME', 'light') # light ot dark
CMS_YOUTUBE_DEFAULT_COLOR = getattr(settings, 'CMS_YOUTUBE_DEFAULT_COLOR', 'white') # white or red
CMS_YOUTUBE_DEFAULT_RATIO = getattr(settings, 'CMS_YOUTUBE_DEFAULT_COLOR', 1.78) # white or red




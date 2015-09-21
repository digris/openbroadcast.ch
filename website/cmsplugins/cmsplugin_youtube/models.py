import re
from django.db import models
from django.utils.translation import ugettext as _

from cms.models import CMSPlugin

from cmsplugin_youtube import settings


class YouTube(CMSPlugin):
    
    video_url = models.URLField(max_length=512)
    name = models.CharField(max_length=200, blank=True, null=True, verbose_name='Optional title to display')

    theme = models.CharField(_('theme'), max_length=20, default=settings.CMS_YOUTUBE_DEFAULT_THEME, choices=settings.THEME_CHOICES)
    color = models.CharField(_('color'), max_length=20, default=settings.CMS_YOUTUBE_DEFAULT_COLOR, choices=settings.COLOR_CHOICES)
    ratio = models.FloatField(_('ratio'), default=settings.CMS_YOUTUBE_DEFAULT_RATIO, choices=settings.RATIO_CHOICES)

    class Meta:
        verbose_name = _("YouTube")
        db_table = 'cmsplugin_youtube'


    def __unicode__(self):
        if self.name:
            return u'%s - %s' % (self.name, self.get_ratio_display())
        else:
            return u'%s - ID: %s' % (self.get_ratio_display(), self.video_id)


    @property
    def video_id(self):
        try:
            return self.extract_video_id(self.video_url)
        except:
            return _('unknown video')


    def extract_video_id(self, video_url):

        m = re.search(r"youtube\.com/.*v=([^&]*)", video_url)
        try:
            video_id = m.group(1)
        except Exception, e:
            print e
            video_id  = None

        return video_id


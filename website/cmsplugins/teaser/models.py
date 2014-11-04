from django.db import models
from cms.models import CMSPlugin, Page
from django.utils.translation import ugettext as _
from filer.fields.image import FilerImageField
from cmsplugin_filer_image.models import ThumbnailOption


class Slide(models.Model):
    slide_name = models.CharField(verbose_name=_("Slide Name"), max_length=200, blank=False)

    image = FilerImageField(null=True, blank=False, default=None, related_name="slide_images")
    #thumbnail_option = models.ForeignKey(ThumbnailOption, null=True, blank=True, related_name="slide_thumb_options")

    def __unicode__(self):
        return "%s" % self.slide_name

    class Meta:
        app_label = 'teaser'
        verbose_name = _('Slide')
        verbose_name_plural = _('Slides')




class Teaser(models.Model):
    name = models.CharField(verbose_name=_("Teaser Name"), max_length=200, help_text=_("Eg. osogna eyeglasses"), blank=False)
    subline = models.TextField(verbose_name=_("Teaser Text"), help_text=_("Eg. Best handmade eyeglasses on the planet"), blank=False)
    slides = models.ManyToManyField(Slide, through='Slidehook', verbose_name=_("Attached Slides"))


    def __unicode__(self):
        return "%s" % (self.name)

    class Meta:
        app_label = 'teaser'
        verbose_name = _('Slideshow')
        verbose_name_plural = _('Slideshows')


class Slidehook(models.Model):
    slide = models.ForeignKey(Slide)
    teaser = models.ForeignKey(Teaser)

    class Meta:
        app_label = 'teaser'
        verbose_name = _('Slide')
        verbose_name_plural = _('Slides')

class TeaserPlugin(CMSPlugin):
    teaser = models.ForeignKey(Teaser)

    def __unicode__(self):
        return " %s " % self.teaser.name


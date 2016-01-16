# -*- coding: utf-8 -*-
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from filer.fields.image import FilerImageField
from cms.models import CMSPlugin

CATEGORY_CHOICES = (
    ('mainsponsor', _('Main Sponsor')),
    ('sponsor', _('Sponsor')),
    ('award', _('Award Partner')),
    ('media', _('Media Partner')),
    ('jury', _('Jury- & Project-Prints')),
    ('print', _('Printing Partner')),
    ('exhibition', _('Exhibition Partner')),
    ('partner', _('Partner')),
    ('patronage', _('Patronage')),
    ('technology', _('Technology Partner')),
)

class SponsorCategory(models.Model):

    name = models.CharField(max_length=16, null=True)

    class Meta(object):
        app_label = 'partnerlink'
        verbose_name = _('Sponsor category')

    def __unicode__(self):
        return '%s' % (self.name)

class Partnerlink(models.Model):

    name = models.CharField(max_length=255)
    url = models.URLField(max_length=255)

    #category = models.ForeignKey(SponsorCategory, null=True, blank=True)
    category = models.CharField(max_length=16, null=True, choices=CATEGORY_CHOICES, default="partner")

    #image = models.ImageField(upload_to='partnerlink', null=True, blank=True)
    image = FilerImageField(null=True, blank=True)

    WEIGHT_CHOICES = [(i,i) for i in range(1, 6)]
    weight = models.PositiveSmallIntegerField(default=1, choices=WEIGHT_CHOICES)

    # auto-update
    created = models.DateTimeField(auto_now_add=True, editable=False)
    updated = models.DateTimeField(auto_now=True, editable=False)

    class Meta(object):
        app_label = 'partnerlink'
        verbose_name = _('Partnerlink')
        verbose_name_plural = _("Partnerlink")
        ordering = ['-weight',]

    def __unicode__(self):
        return '%s (%s)' % (self.name, self.url)

    def save(self, *args, **kwargs):
        super(Partnerlink, self).save(*args, **kwargs)


class PartnerlinkListPlugin(CMSPlugin):

    style = models.CharField(max_length=10, default='s')
    class Meta:
        app_label = 'partnerlink'

    def __unicode__(self):
        return  '%s' % (self.style)


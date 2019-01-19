# -*- coding: utf-8 -*-
from django.db import models
from django.utils.translation import ugettext_lazy as _
from cms.models import CMSPlugin

class CoverageMap(CMSPlugin):

    url = models.URLField(blank=True, null=True)

    class Meta:
        app_label = 'coverage'
        verbose_name = _('Map')

    def __unicode__(self):
        return u'%s' % self.url

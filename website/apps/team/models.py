# -*- coding: utf-8 -*-
from django.db import models
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _
from cms.models import CMSPlugin
from filer.fields.image import FilerImageField

from hvad.models import TranslatableModel, TranslatedFields
from hvad.manager import TranslationManager


class ProfileManager(TranslationManager):
    pass

class Profile(TranslatableModel):

    name = models.CharField(max_length=256)
    image = FilerImageField(blank=True, null=True)
    sort = models.PositiveIntegerField(default=1)

    is_company = models.BooleanField(default=False)

    website = models.URLField(blank=True, null=True)

    # contact info
    email = models.EmailField(max_length=256, null=True, blank=True)
    phone_direct = models.CharField(max_length=64, null=True, blank=True)

    translations = TranslatedFields(
        title = models.CharField(max_length=255, blank=True, null=True),
        description = models.TextField(blank=True, null=True),
    )

    objects = ProfileManager()

    class Meta:
        app_label = 'team'
        verbose_name = _('Profile')
        verbose_name_plural = _('Profiles')
        ordering = ('is_company', 'sort', 'name',)

    def __unicode__(self):
        return u'%s' % self.name



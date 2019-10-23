# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.core.exceptions import ValidationError

from django.db import models
from django.utils.translation import ugettext_lazy as _

from cms.models import CMSPlugin

from .utils import process_provider_url
from .utils import EMBED_SERVICE_PROVIDERS


class Media(CMSPlugin):

    url = models.URLField(
        help_text=_(
            "Supported Services: {services}".format(
                services=", ".join(EMBED_SERVICE_PROVIDERS)
            )
        )
    )
    provider = models.CharField(max_length=256, null=True, blank=True, editable=False)
    object_id = models.CharField(max_length=256, null=True, blank=True, editable=False)

    class Meta:
        verbose_name = _("Multimedia einbetten")

    def __str__(self):
        return self.url

    def process_media(self):
        self.provider, self.object_id = process_provider_url(self.url)

    def save(self, *args, **kwargs):
        self.process_media()
        super(Media, self).save(*args, **kwargs)

    def clean(self):
        provider, object_id = process_provider_url(self.url)
        if not (provider and object_id):
            raise ValidationError(_("Unable to process url"))

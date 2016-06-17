# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import datetime
import re
import itertools
from django.db import models
from django.db.models import Q
from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils import timezone
from django.contrib.sites.models import Site
from django.utils.html import strip_tags
from django.utils.translation import ugettext_lazy as _
from django.utils.text import slugify
from django_extensions.db.fields import AutoSlugField
from filer.fields.file import FilerFileField
from filer.fields.image import FilerImageField
from cms.models.fields import PlaceholderField

from base.models import TimestampedModel


class ArticleManager(models.Manager):

    def published(self):
        return self.get_queryset().exclude(publish__isnull=True).filter(publish__lte=timezone.now())


class Article(TimestampedModel):

    slug = AutoSlugField(populate_from='name', editable=True, blank=False, overwrite=False)
    name = models.CharField(max_length=256, verbose_name=_('Title'))
    teaser = models.TextField(null=True, blank=True)
    content = PlaceholderField('ticker_article_content')
    publish = models.DateTimeField(null=True, blank=True)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        verbose_name=_('Author'),
        related_name='author',
        null=True, blank=True,
        limit_choices_to={'is_staff': True}
    )

    objects = ArticleManager()

    key_image = FilerImageField(blank=True, null=True)

    class Meta:
        app_label = 'ticker'
        verbose_name = _('Article')
        ordering = ('-publish',)

    def __unicode__(self):
        return self.name

    def get_absolute_url(self):
        try:
            return reverse('ticker-article-detail', kwargs={'slug': self.slug})
        except Exception, e:
            return e

        return e


    @property
    def public(self):
        if self.publish:
            return self.publish <= timezone.now()
        return False


    def get_teaser(self):
        if self.teaser:
            return self.teaser

        #cmsplugin = self.content.cmsplugin_set.order_by('position')[0]
        #return strip_tags(cmsplugin.render_plugin())


    def save(self, *args, **kwargs):
        super(Article, self).save(*args, **kwargs)


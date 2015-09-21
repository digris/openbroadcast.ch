# -*- coding: utf-8 -*-
import datetime
import re
import itertools
from django.db import models
from django.db.models import Q
from django.core.urlresolvers import reverse
from django.contrib.sites.models import Site
from django.utils.translation import ugettext_lazy as _
from django.utils.text import slugify
from django_extensions.db.fields import AutoSlugField
from filer.fields.file import FilerFileField
from filer.fields.image import FilerImageField
from cms.models.fields import PlaceholderField

from base.models import TimestampedModel




class ArticleManager(models.Manager):

    def published(self):
        return self.get_queryset().filter(published=True)


class Article(TimestampedModel):

    slug = AutoSlugField(populate_from='name', editable=True, blank=True, overwrite=False)
    name = models.CharField(max_length=256, verbose_name=_('Title'))
    subline = models.CharField(max_length=256, null=True, blank=True)
    content = PlaceholderField('ticker_article_content')
    published = models.BooleanField(default=False)

    objects = ArticleManager()

    main_image = FilerImageField(blank=True, null=True)

    class Meta:
        app_label = 'ticker'
        verbose_name = _('Article')
        #ordering = ('-publish',)

    def __unicode__(self):
        if self.subline:
            return u'%s - %s' % (self.name, self.subline)
        return u'%s' % self.name

    def get_absolute_url(self):
        try:
            return reverse('ticker-article-detail', kwargs={'slug': self.slug})
        except Exception, e:
            return e

    def save(self, *args, **kwargs):

        # if not self.slug:
        #     self.slug = slugify(self.name)
        #
        # orig_slug = self.slug
        # for x in itertools.count(1):
        #     if not Article.objects.exclude(pk=self.pk).filter(translations__slug=self.slug).exists():
        #         break
        #     self.slug = u'%s-%d' % (orig_slug, x)


        super(Article, self).save(*args, **kwargs)


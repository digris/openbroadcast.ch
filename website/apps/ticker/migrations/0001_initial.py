# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cms.models.fields
import django_extensions.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0012_auto_20150607_2207'),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('slug', django_extensions.db.fields.AutoSlugField(populate_from=b'name', editable=False, blank=True)),
                ('publish', models.DateTimeField(null=True, blank=True)),
                ('content', cms.models.fields.PlaceholderField(slotname=b'ticker_article_content', editable=False, to='cms.Placeholder', null=True)),
            ],
            options={
                'ordering': ('-publish',),
                'verbose_name': 'Article',
            },
        ),
    ]

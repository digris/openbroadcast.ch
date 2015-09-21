# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ticker', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='name',
            field=models.CharField(default='a', max_length=256, verbose_name='Title'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='article',
            name='subline',
            field=models.CharField(max_length=256, null=True, blank=True),
        ),
    ]

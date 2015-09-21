# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import filer.fields.image


class Migration(migrations.Migration):

    dependencies = [
        ('filer', '0002_auto_20150606_2003'),
        ('ticker', '0003_auto_20150918_1901'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='main_image',
            field=filer.fields.image.FilerImageField(blank=True, to='filer.Image', null=True),
        ),
    ]

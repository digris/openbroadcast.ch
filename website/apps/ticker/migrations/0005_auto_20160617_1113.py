# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticker', '0004_article_main_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='article',
            name='subline',
        ),
        migrations.AddField(
            model_name='article',
            name='teaser',
            field=models.TextField(null=True, blank=True),
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ticker', '0007_auto_20160617_1150'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='author',
            field=models.ForeignKey(related_name='author', on_delete=django.db.models.deletion.SET_NULL, verbose_name='Author', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]

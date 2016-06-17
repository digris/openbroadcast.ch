# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticker', '0005_auto_20160617_1113'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='article',
            name='published',
        ),
        migrations.AddField(
            model_name='article',
            name='publish',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]

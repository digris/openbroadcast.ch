# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('livecolor', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='colorset',
            name='duration',
            field=models.PositiveIntegerField(default=10000, null=True, blank=True),
        ),
    ]

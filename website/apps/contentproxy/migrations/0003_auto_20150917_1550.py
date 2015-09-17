# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('contentproxy', '0002_cachedevent_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='cachedmedia',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 9, 17, 13, 50, 9, 819928, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='cachedmedia',
            name='status',
            field=models.PositiveIntegerField(default=0, choices=[(0, 'Initial'), (1, 'Ready'), (99, 'Error')]),
        ),
    ]

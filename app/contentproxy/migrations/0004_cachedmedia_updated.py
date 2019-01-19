# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('contentproxy', '0003_auto_20150917_1550'),
    ]

    operations = [
        migrations.AddField(
            model_name='cachedmedia',
            name='updated',
            field=models.DateTimeField(default=datetime.datetime(2015, 9, 17, 14, 2, 24, 210673, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticker', '0006_auto_20160617_1146'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='article',
            options={'ordering': ('-publish',), 'verbose_name': 'Article'},
        ),
        migrations.RenameField(
            model_name='article',
            old_name='main_image',
            new_name='key_image',
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('team', '0002_auto_20160116_1700'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='profile',
            options={'ordering': ('is_company', 'sort', 'name'), 'verbose_name': 'Profile', 'verbose_name_plural': 'Profiles'},
        ),
    ]

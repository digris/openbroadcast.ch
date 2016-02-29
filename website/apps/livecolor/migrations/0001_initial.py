# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Colorset',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('bg_color', models.CharField(default=b'#000000', max_length=7, null=True, blank=True)),
                ('fg_color', models.CharField(default=b'#ffffff', max_length=7, null=True, blank=True)),
            ],
            options={
                'verbose_name': 'Colorset',
                'verbose_name_plural': 'Colorset',
            },
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import filer.fields.image


class Migration(migrations.Migration):

    dependencies = [
        ('filer', '0002_auto_20150606_2003'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=256)),
                ('sort', models.PositiveIntegerField(default=1)),
                ('is_core_team', models.BooleanField(default=True)),
                ('is_company', models.BooleanField(default=False)),
                ('website', models.URLField(null=True, blank=True)),
                ('email', models.EmailField(max_length=256, null=True, blank=True)),
                ('phone_direct', models.CharField(max_length=64, null=True, blank=True)),
                ('image', filer.fields.image.FilerImageField(blank=True, to='filer.Image', null=True)),
            ],
            options={
                'ordering': ('-is_core_team', 'sort', 'name'),
                'verbose_name': 'Profile',
                'verbose_name_plural': 'Profiles',
            },
        ),
        migrations.CreateModel(
            name='ProfileTranslation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=255, null=True, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
                ('language_code', models.CharField(max_length=15, db_index=True)),
                ('master', models.ForeignKey(related_name='translations', editable=False, to='team.Profile', null=True)),
            ],
            options={
                'managed': True,
                'abstract': False,
                'db_table': 'team_profile_translation',
                'db_tablespace': '',
            },
        ),
        migrations.AlterUniqueTogether(
            name='profiletranslation',
            unique_together=set([('language_code', 'master')]),
        ),
    ]

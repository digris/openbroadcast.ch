# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2019-01-14 15:04
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cms', '0016_auto_20160608_1535'),
    ]

    operations = [
        migrations.CreateModel(
            name='Media',
            fields=[
                ('cmsplugin_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, related_name='media_embed_media', serialize=False, to='cms.CMSPlugin')),
                ('url', models.URLField(help_text='Supported Services: Youtube, Vimeo')),
                ('provider', models.CharField(blank=True, editable=False, max_length=256, null=True)),
                ('object_id', models.CharField(blank=True, editable=False, max_length=256, null=True)),
            ],
            options={
                'verbose_name': 'Multimedia einbetten',
            },
            bases=('cms.cmsplugin',),
        ),
    ]
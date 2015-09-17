# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MentionedUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
            options={
                'verbose_name': 'Mentioned User',
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('text', models.TextField()),
                ('rendered_text', models.TextField(null=True, blank=True)),
                ('options', jsonfield.fields.JSONField(null=True, blank=True)),
            ],
            options={
                'ordering': ('-created',),
                'verbose_name': 'Message',
                'verbose_name_plural': 'Messages',
            },
        ),
    ]

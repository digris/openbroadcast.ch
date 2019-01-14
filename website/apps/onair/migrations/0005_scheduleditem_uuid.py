# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-12-21 13:17
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('onair', '0004_auto_20180827_1759'),
    ]

    operations = [
        migrations.AddField(
            model_name='scheduleditem',
            name='uuid',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False),
        ),
    ]
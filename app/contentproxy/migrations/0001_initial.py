# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="CachedEvent",
            fields=[
                (
                    "id",
                    models.AutoField(
                        verbose_name="ID",
                        serialize=False,
                        auto_created=True,
                        primary_key=True,
                    ),
                ),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("ct", models.CharField(max_length=36)),
                ("ct_uuid", models.CharField(max_length=36)),
                ("action", models.CharField(max_length=36)),
                ("processed", models.BooleanField(default=False)),
            ],
            options={"verbose_name": "Cached Event"},
        ),
        migrations.CreateModel(
            name="CachedMedia",
            fields=[
                (
                    "id",
                    models.AutoField(
                        verbose_name="ID",
                        serialize=False,
                        auto_created=True,
                        primary_key=True,
                    ),
                ),
                ("uuid", models.CharField(unique=True, max_length=36, db_index=True)),
                (
                    "status",
                    models.PositiveIntegerField(
                        default=0,
                        max_length=2,
                        choices=[(0, "Initial"), (1, "Ready"), (99, "Error")],
                    ),
                ),
            ],
            options={
                "verbose_name": "Cached Media",
                "verbose_name_plural": "Cached Media",
            },
        ),
    ]

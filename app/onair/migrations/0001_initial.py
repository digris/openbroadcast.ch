# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields.jsonb


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ScheduledItem",
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
                ("name", models.CharField(max_length=255)),
                ("time_start", models.DateTimeField()),
                ("time_end", models.DateTimeField()),
                (
                    "emission_url",
                    models.CharField(max_length=255, null=True, blank=True),
                ),
                ("item_url", models.CharField(max_length=255, null=True, blank=True)),
                ("emission_data", django.contrib.postgres.fields.jsonb.JSONField()),
                ("item_data", django.contrib.postgres.fields.jsonb.JSONField()),
                (
                    "status",
                    models.PositiveIntegerField(
                        default=0,
                        max_length=2,
                        choices=[(0, "Initial"), (1, "Done"), (2, "Error")],
                    ),
                ),
            ],
            options={
                "ordering": ("-time_start",),
                "verbose_name": "Scheduled Item",
                "verbose_name_plural": "Scheduled Items",
            },
        )
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [("onair", "0001_initial")]

    operations = [
        migrations.AlterField(
            model_name="scheduleditem",
            name="status",
            field=models.PositiveIntegerField(
                default=0, choices=[(0, "Initial"), (1, "Done"), (2, "Error")]
            ),
        )
    ]

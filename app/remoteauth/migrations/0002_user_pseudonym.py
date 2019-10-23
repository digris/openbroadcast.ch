# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("remoteauth", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="pseudonym",
            field=models.CharField(max_length=250, null=True, blank=True),
        )
    ]

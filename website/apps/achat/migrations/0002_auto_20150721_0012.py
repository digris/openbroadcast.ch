# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('achat', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='mentioneduser',
            name='message',
            field=models.ForeignKey(related_name='mentioned_users', to='achat.Message'),
        ),
        migrations.AddField(
            model_name='mentioneduser',
            name='user',
            field=models.ForeignKey(related_name='mentions', to=settings.AUTH_USER_MODEL),
        ),
    ]

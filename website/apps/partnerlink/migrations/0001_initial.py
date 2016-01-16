# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import filer.fields.image


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '__first__'),
        ('filer', '0002_auto_20150606_2003'),
    ]

    operations = [
        migrations.CreateModel(
            name='Partnerlink',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('url', models.URLField(max_length=255)),
                ('category', models.CharField(default=b'partner', max_length=16, null=True, choices=[(b'mainsponsor', 'Main Sponsor'), (b'sponsor', 'Sponsor'), (b'award', 'Award Partner'), (b'media', 'Media Partner'), (b'jury', 'Jury- & Project-Prints'), (b'print', 'Printing Partner'), (b'exhibition', 'Exhibition Partner'), (b'partner', 'Partner'), (b'patronage', 'Patronage'), (b'technology', 'Technology Partner')])),
                ('weight', models.PositiveSmallIntegerField(default=1, choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)])),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('image', filer.fields.image.FilerImageField(blank=True, to='filer.Image', null=True)),
            ],
            options={
                'ordering': ['-weight'],
                'verbose_name': 'Partnerlink',
                'verbose_name_plural': 'Partnerlink',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PartnerlinkListPlugin',
            fields=[
                ('cmsplugin_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='cms.CMSPlugin')),
                ('style', models.CharField(default=b's', max_length=10)),
            ],
            options={
            },
            bases=('cms.cmsplugin',),
        ),
        migrations.CreateModel(
            name='SponsorCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=16, null=True)),
            ],
            options={
                'verbose_name': 'Sponsor category',
            },
            bases=(models.Model,),
        ),
    ]

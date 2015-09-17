# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import filer.fields.image


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0013_auto_20150721_0012'),
        ('filer', '0002_auto_20150606_2003'),
    ]

    operations = [
        migrations.CreateModel(
            name='Slide',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slide_name', models.CharField(max_length=200, verbose_name='Slide Name')),
                ('image', filer.fields.image.FilerImageField(related_name='slide_images', default=None, to='filer.Image', null=True)),
            ],
            options={
                'verbose_name': 'Slide',
                'verbose_name_plural': 'Slides',
            },
        ),
        migrations.CreateModel(
            name='Slidehook',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slide', models.ForeignKey(to='teaser.Slide')),
            ],
            options={
                'verbose_name': 'Slide',
                'verbose_name_plural': 'Slides',
            },
        ),
        migrations.CreateModel(
            name='Teaser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(help_text='Eg. osogna eyeglasses', max_length=200, verbose_name='Teaser Name')),
                ('subline', models.TextField(help_text='Eg. Best handmade eyeglasses on the planet', verbose_name='Teaser Text')),
                ('slides', models.ManyToManyField(to='teaser.Slide', verbose_name='Attached Slides', through='teaser.Slidehook')),
            ],
            options={
                'verbose_name': 'Slideshow',
                'verbose_name_plural': 'Slideshows',
            },
        ),
        migrations.CreateModel(
            name='TeaserPlugin',
            fields=[
                ('cmsplugin_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='cms.CMSPlugin')),
                ('teaser', models.ForeignKey(to='teaser.Teaser')),
            ],
            options={
                'abstract': False,
            },
            bases=('cms.cmsplugin',),
        ),
        migrations.AddField(
            model_name='slidehook',
            name='teaser',
            field=models.ForeignKey(to='teaser.Teaser'),
        ),
    ]

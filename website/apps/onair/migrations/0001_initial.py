# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'ScheduledItem'
        db.create_table(u'onair_scheduleditem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('time_start', self.gf('django.db.models.fields.DateTimeField')()),
            ('time_end', self.gf('django.db.models.fields.DateTimeField')()),
            ('emission_url', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('item_url', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.PositiveIntegerField')(default=0, max_length=2)),
        ))
        db.send_create_signal('onair', ['ScheduledItem'])


    def backwards(self, orm):
        # Deleting model 'ScheduledItem'
        db.delete_table(u'onair_scheduleditem')


    models = {
        'onair.scheduleditem': {
            'Meta': {'object_name': 'ScheduledItem'},
            'emission_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'max_length': '2'}),
            'time_end': ('django.db.models.fields.DateTimeField', [], {}),
            'time_start': ('django.db.models.fields.DateTimeField', [], {})
        }
    }

    complete_apps = ['onair']
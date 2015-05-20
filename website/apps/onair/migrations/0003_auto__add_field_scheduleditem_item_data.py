# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'ScheduledItem.item_data'
        db.add_column(u'onair_scheduleditem', 'item_data',
                      self.gf('django.db.models.fields.TextField')(default='{}'),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'ScheduledItem.item_data'
        db.delete_column(u'onair_scheduleditem', 'item_data')


    models = {
        'onair.scheduleditem': {
            'Meta': {'ordering': "('time_start',)", 'object_name': 'ScheduledItem'},
            'emission_data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'emission_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item_data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'item_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'max_length': '2'}),
            'time_end': ('django.db.models.fields.DateTimeField', [], {}),
            'time_start': ('django.db.models.fields.DateTimeField', [], {})
        }
    }

    complete_apps = ['onair']
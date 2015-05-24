# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'CachedMedia.uuid'
        db.add_column(u'contentproxy_cachedmedia', 'uuid',
                      self.gf('django.db.models.fields.CharField')(default=None, max_length=36, db_index=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'CachedMedia.uuid'
        db.delete_column(u'contentproxy_cachedmedia', 'uuid')


    models = {
        'contentproxy.cachedmedia': {
            'Meta': {'object_name': 'CachedMedia'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'max_length': '2'}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36', 'db_index': 'True'})
        }
    }

    complete_apps = ['contentproxy']
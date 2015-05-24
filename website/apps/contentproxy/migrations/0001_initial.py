# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CachedMedia'
        db.create_table(u'contentproxy_cachedmedia', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('status', self.gf('django.db.models.fields.PositiveIntegerField')(default=0, max_length=2)),
        ))
        db.send_create_signal('contentproxy', ['CachedMedia'])


    def backwards(self, orm):
        # Deleting model 'CachedMedia'
        db.delete_table(u'contentproxy_cachedmedia')


    models = {
        'contentproxy.cachedmedia': {
            'Meta': {'object_name': 'CachedMedia'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'max_length': '2'})
        }
    }

    complete_apps = ['contentproxy']
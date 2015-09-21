# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'YouTube.height'
        db.delete_column('cmsplugin_youtube', 'height')

        # Deleting field 'YouTube.width'
        db.delete_column('cmsplugin_youtube', 'width')

        # Adding field 'YouTube.theme'
        db.add_column(u'cmsplugin_youtube', 'theme',
                      self.gf('django.db.models.fields.CharField')(default='light', max_length=20),
                      keep_default=False)

        # Adding field 'YouTube.color'
        db.add_column(u'cmsplugin_youtube', 'color',
                      self.gf('django.db.models.fields.CharField')(default='white', max_length=20),
                      keep_default=False)

        # Adding field 'YouTube.ratio'
        db.add_column(u'cmsplugin_youtube', 'ratio',
                      self.gf('django.db.models.fields.FloatField')(default=0),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'YouTube.height'
        db.add_column('cmsplugin_youtube', 'height',
                      self.gf('django.db.models.fields.IntegerField')(default=350),
                      keep_default=False)

        # Adding field 'YouTube.width'
        db.add_column('cmsplugin_youtube', 'width',
                      self.gf('django.db.models.fields.IntegerField')(default=630),
                      keep_default=False)

        # Deleting field 'YouTube.theme'
        db.delete_column(u'cmsplugin_youtube', 'theme')

        # Deleting field 'YouTube.color'
        db.delete_column(u'cmsplugin_youtube', 'color')

        # Deleting field 'YouTube.ratio'
        db.delete_column(u'cmsplugin_youtube', 'ratio')


    models = {
        'cms.cmsplugin': {
            'Meta': {'object_name': 'CMSPlugin'},
            'changed_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '15', 'db_index': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cms.CMSPlugin']", 'null': 'True', 'blank': 'True'}),
            'placeholder': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cms.Placeholder']", 'null': 'True'}),
            'plugin_type': ('django.db.models.fields.CharField', [], {'max_length': '50', 'db_index': 'True'}),
            'position': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'})
        },
        'cms.placeholder': {
            'Meta': {'object_name': 'Placeholder'},
            'default_width': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'slot': ('django.db.models.fields.CharField', [], {'max_length': '50', 'db_index': 'True'})
        },
        u'cmsplugin_youtube.youtube': {
            'Meta': {'object_name': 'YouTube', 'db_table': "u'cmsplugin_youtube'", '_ormbases': ['cms.CMSPlugin']},
            u'cmsplugin_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['cms.CMSPlugin']", 'unique': 'True', 'primary_key': 'True'}),
            'color': ('django.db.models.fields.CharField', [], {'default': "'white'", 'max_length': '20'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'ratio': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'theme': ('django.db.models.fields.CharField', [], {'default': "'light'", 'max_length': '20'}),
            'video_url': ('django.db.models.fields.URLField', [], {'max_length': '512'})
        }
    }

    complete_apps = ['cmsplugin_youtube']
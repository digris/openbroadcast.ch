# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Slidehook'
        db.create_table(u'teaser_slidehook', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('slide', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['teaser.Slide'])),
            ('teaser', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['teaser.Teaser'])),
        ))
        db.send_create_signal('teaser', ['Slidehook'])

        # Adding model 'Slide'
        db.create_table(u'teaser_slide', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('slide_name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('image', self.gf('django.db.models.fields.related.ForeignKey')(default=None, related_name='slide_images', null=True, to=orm['filer.Image'])),
        ))
        db.send_create_signal('teaser', ['Slide'])

        # Deleting field 'Teaser.image_1'
        db.delete_column(u'teaser_teaser', 'image_1_id')

        # Deleting field 'Teaser.image_3'
        db.delete_column(u'teaser_teaser', 'image_3_id')

        # Deleting field 'Teaser.updated'
        db.delete_column(u'teaser_teaser', 'updated')

        # Deleting field 'Teaser.image_2'
        db.delete_column(u'teaser_teaser', 'image_2_id')

        # Deleting field 'Teaser.created'
        db.delete_column(u'teaser_teaser', 'created')

        # Deleting field 'Teaser.headline'
        db.delete_column(u'teaser_teaser', 'headline')

        # Deleting field 'Teaser.subline'
        db.delete_column(u'teaser_teaser', 'subline')

        # Adding field 'Teaser.name'
        db.add_column(u'teaser_teaser', 'name',
                      self.gf('django.db.models.fields.CharField')(default='dfasdf', max_length=200),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'Slidehook'
        db.delete_table(u'teaser_slidehook')

        # Deleting model 'Slide'
        db.delete_table(u'teaser_slide')

        # Adding field 'Teaser.image_1'
        db.add_column(u'teaser_teaser', 'image_1',
                      self.gf('django.db.models.fields.related.ForeignKey')(related_name='ti1_set', null=True, to=orm['filer.Image'], blank=True),
                      keep_default=False)

        # Adding field 'Teaser.image_3'
        db.add_column(u'teaser_teaser', 'image_3',
                      self.gf('django.db.models.fields.related.ForeignKey')(related_name='ti3_set', null=True, to=orm['filer.Image'], blank=True),
                      keep_default=False)

        # Adding field 'Teaser.updated'
        db.add_column(u'teaser_teaser', 'updated',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now=True, default=datetime.datetime(2014, 9, 17, 0, 0), blank=True),
                      keep_default=False)

        # Adding field 'Teaser.image_2'
        db.add_column(u'teaser_teaser', 'image_2',
                      self.gf('django.db.models.fields.related.ForeignKey')(related_name='ti2_set', null=True, to=orm['filer.Image'], blank=True),
                      keep_default=False)

        # Adding field 'Teaser.created'
        db.add_column(u'teaser_teaser', 'created',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, default=datetime.datetime(2014, 9, 17, 0, 0), blank=True),
                      keep_default=False)

        # Adding field 'Teaser.headline'
        db.add_column(u'teaser_teaser', 'headline',
                      self.gf('django.db.models.fields.CharField')(default='dfads', max_length=255),
                      keep_default=False)

        # Adding field 'Teaser.subline'
        db.add_column(u'teaser_teaser', 'subline',
                      self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True),
                      keep_default=False)

        # Deleting field 'Teaser.name'
        db.delete_column(u'teaser_teaser', 'name')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'authtools.user': {
            'Meta': {'ordering': "[u'name', u'email']", 'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'unique': 'True', 'max_length': '255', 'db_index': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"})
        },
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
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'filer.file': {
            'Meta': {'object_name': 'File'},
            '_file_size': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'folder': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "u'all_files'", 'null': 'True', 'to': u"orm['filer.Folder']"}),
            'has_all_mandatory_data': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '255', 'blank': 'True'}),
            'original_filename': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "u'owned_files'", 'null': 'True', 'to': u"orm['authtools.User']"}),
            'polymorphic_ctype': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "u'polymorphic_filer.file_set'", 'null': 'True', 'to': u"orm['contenttypes.ContentType']"}),
            'sha1': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '40', 'blank': 'True'}),
            'uploaded_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        u'filer.folder': {
            'Meta': {'ordering': "(u'name',)", 'unique_together': "((u'parent', u'name'),)", 'object_name': 'Folder'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            u'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            u'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "u'filer_owned_folders'", 'null': 'True', 'to': u"orm['authtools.User']"}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "u'children'", 'null': 'True', 'to': u"orm['filer.Folder']"}),
            u'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            u'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'uploaded_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'filer.image': {
            'Meta': {'object_name': 'Image', '_ormbases': [u'filer.File']},
            '_height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            '_width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'author': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'date_taken': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'default_alt_text': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'default_caption': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'file_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['filer.File']", 'unique': 'True', 'primary_key': 'True'}),
            'must_always_publish_author_credit': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'must_always_publish_copyright': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'subject_location': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '64', 'null': 'True', 'blank': 'True'})
        },
        'teaser.slide': {
            'Meta': {'object_name': 'Slide'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'slide_images'", 'null': 'True', 'to': "orm['filer.Image']"}),
            'slide_name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'teaser.slidehook': {
            'Meta': {'object_name': 'Slidehook'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'slide': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['teaser.Slide']"}),
            'teaser': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['teaser.Teaser']"})
        },
        'teaser.teaser': {
            'Meta': {'object_name': 'Teaser'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'slides': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['teaser.Slide']", 'through': "orm['teaser.Slidehook']", 'symmetrical': 'False'})
        },
        u'teaser.teaserplugin': {
            'Meta': {'object_name': 'TeaserPlugin', '_ormbases': ['cms.CMSPlugin']},
            u'cmsplugin_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['cms.CMSPlugin']", 'unique': 'True', 'primary_key': 'True'}),
            'teaser': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['teaser.Teaser']"})
        }
    }

    complete_apps = ['teaser']
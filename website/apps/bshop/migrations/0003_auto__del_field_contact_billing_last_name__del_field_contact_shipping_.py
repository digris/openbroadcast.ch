# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Contact.billing_last_name'
        db.delete_column(u'bshop_contact', 'billing_last_name')

        # Deleting field 'Contact.shipping_last_name'
        db.delete_column(u'bshop_contact', 'shipping_last_name')

        # Deleting field 'Contact.billing_first_name'
        db.delete_column(u'bshop_contact', 'billing_first_name')

        # Deleting field 'Contact.shipping_first_name'
        db.delete_column(u'bshop_contact', 'shipping_first_name')

        # Adding field 'Contact.billing_name'
        db.add_column(u'bshop_contact', 'billing_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Adding field 'Contact.shipping_name'
        db.add_column(u'bshop_contact', 'shipping_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)


        # Changing field 'Contact.user'
        db.alter_column(u'bshop_contact', 'user_id', self.gf('django.db.models.fields.related.OneToOneField')(unique=True, to=orm['authtools.User']))

    def backwards(self, orm):
        # Adding field 'Contact.billing_last_name'
        db.add_column(u'bshop_contact', 'billing_last_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Adding field 'Contact.shipping_last_name'
        db.add_column(u'bshop_contact', 'shipping_last_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Adding field 'Contact.billing_first_name'
        db.add_column(u'bshop_contact', 'billing_first_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Adding field 'Contact.shipping_first_name'
        db.add_column(u'bshop_contact', 'shipping_first_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Deleting field 'Contact.billing_name'
        db.delete_column(u'bshop_contact', 'billing_name')

        # Deleting field 'Contact.shipping_name'
        db.delete_column(u'bshop_contact', 'shipping_name')


        # Changing field 'Contact.user'
        db.alter_column(u'bshop_contact', 'user_id', self.gf('django.db.models.fields.related.OneToOneField')(unique=True, to=orm['auth.User']))

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
        u'bshop.contact': {
            'Meta': {'object_name': 'Contact'},
            'billing_address': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'billing_city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'billing_company': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'billing_country': ('django_countries.fields.CountryField', [], {'max_length': '2', 'blank': 'True'}),
            'billing_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'billing_zip_code': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'currency': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'discount_level': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'shipping_address': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'shipping_city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_company': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_country': ('django_countries.fields.CountryField', [], {'max_length': '2', 'blank': 'True'}),
            'shipping_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_same_as_billing': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'shipping_zip_code': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'contactuser'", 'unique': 'True', 'to': u"orm['authtools.User']"})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['bshop']
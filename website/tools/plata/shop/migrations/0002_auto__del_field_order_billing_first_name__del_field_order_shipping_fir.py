# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Order.billing_first_name'
        db.delete_column(u'shop_order', 'billing_first_name')

        # Deleting field 'Order.shipping_first_name'
        db.delete_column(u'shop_order', 'shipping_first_name')

        # Deleting field 'Order.billing_last_name'
        db.delete_column(u'shop_order', 'billing_last_name')

        # Deleting field 'Order.shipping_last_name'
        db.delete_column(u'shop_order', 'shipping_last_name')

        # Adding field 'Order.billing_name'
        db.add_column(u'shop_order', 'billing_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Adding field 'Order.shipping_name'
        db.add_column(u'shop_order', 'shipping_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)


        # Changing field 'Order.user'
        db.alter_column(u'shop_order', 'user_id', self.gf('django.db.models.fields.related.ForeignKey')(null=True, to=orm['authtools.User']))

    def backwards(self, orm):
        # Adding field 'Order.billing_first_name'
        db.add_column(u'shop_order', 'billing_first_name',
                      self.gf('django.db.models.fields.CharField')(default=None, max_length=100),
                      keep_default=False)

        # Adding field 'Order.shipping_first_name'
        db.add_column(u'shop_order', 'shipping_first_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Adding field 'Order.billing_last_name'
        db.add_column(u'shop_order', 'billing_last_name',
                      self.gf('django.db.models.fields.CharField')(default=None, max_length=100),
                      keep_default=False)

        # Adding field 'Order.shipping_last_name'
        db.add_column(u'shop_order', 'shipping_last_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100, blank=True),
                      keep_default=False)

        # Deleting field 'Order.billing_name'
        db.delete_column(u'shop_order', 'billing_name')

        # Deleting field 'Order.shipping_name'
        db.delete_column(u'shop_order', 'shipping_name')


        # Changing field 'Order.user'
        db.alter_column(u'shop_order', 'user_id', self.gf('django.db.models.fields.related.ForeignKey')(null=True, to=orm['auth.User']))

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
        'catalog.combo': {
            'Meta': {'ordering': "('pk',)", 'unique_together': "(('product', 'frame', 'glass'),)", 'object_name': 'Combo'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'frame': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'combos'", 'to': "orm['catalog.MaterialFrame']"}),
            'glass': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'combos'", 'to': "orm['catalog.MaterialGlass']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'items_in_stock': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'next_charge': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'product': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'combos'", 'to': "orm['catalog.Product']"}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        'catalog.designer': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Designer'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '256'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'website': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        'catalog.materialframe': {
            'Meta': {'object_name': 'MaterialFrame'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '256'}),
            'obj_no': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        'catalog.materialglass': {
            'Meta': {'object_name': 'MaterialGlass'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '256'}),
            'obj_no': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        'catalog.product': {
            'Meta': {'ordering': "('obj_no',)", 'object_name': 'Product'},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '16', 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'designer': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'designer_of'", 'null': 'True', 'to': "orm['catalog.Designer']"}),
            'glass_height': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'glass_width': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'main_image': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'products_main'", 'null': 'True', 'to': "orm['filer.Image']"}),
            'mood_image': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'products_mood'", 'null': 'True', 'to': "orm['filer.Image']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '256'}),
            'obj_key': ('django.db.models.fields.CharField', [], {'max_length': '16', 'null': 'True'}),
            'obj_no': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'price_msrp': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '7', 'decimal_places': '2', 'blank': 'True'}),
            'product_end': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'product_no': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'product_start': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'publish': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'name'", 'overwrite': 'True'}),
            'subline': ('django.db.models.fields.CharField', [], {'max_length': '256', 'null': 'True', 'blank': 'True'}),
            'total_width': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'web_width': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'weight': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'filer.file': {
            'Meta': {'object_name': 'File'},
            '_file_size': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'folder': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'all_files'", 'null': 'True', 'to': "orm['filer.Folder']"}),
            'has_all_mandatory_data': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '255', 'blank': 'True'}),
            'original_filename': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'owned_files'", 'null': 'True', 'to': u"orm['authtools.User']"}),
            'polymorphic_ctype': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'polymorphic_filer.file_set'", 'null': 'True', 'to': u"orm['contenttypes.ContentType']"}),
            'sha1': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '40', 'blank': 'True'}),
            'uploaded_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'filer.folder': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('parent', 'name'),)", 'object_name': 'Folder'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            u'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            u'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'filer_owned_folders'", 'null': 'True', 'to': u"orm['authtools.User']"}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['filer.Folder']"}),
            u'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            u'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'uploaded_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'filer.image': {
            'Meta': {'object_name': 'Image', '_ormbases': ['filer.File']},
            '_height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            '_width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'author': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'date_taken': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'default_alt_text': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'default_caption': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'file_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['filer.File']", 'unique': 'True', 'primary_key': 'True'}),
            'must_always_publish_author_credit': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'must_always_publish_copyright': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'subject_location': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '64', 'null': 'True', 'blank': 'True'})
        },
        u'shop.order': {
            'Meta': {'object_name': 'Order'},
            '_order_id': ('django.db.models.fields.CharField', [], {'max_length': '20', 'blank': 'True'}),
            'billing_address': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'billing_city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'billing_company': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'billing_country': ('django_countries.fields.CountryField', [], {'max_length': '2', 'blank': 'True'}),
            'billing_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'billing_zip_code': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'confirmed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'currency': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'data': ('plata.fields.JSONField', [], {'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'items_discount': ('django.db.models.fields.DecimalField', [], {'default': "'0.00'", 'max_digits': '18', 'decimal_places': '10'}),
            'items_subtotal': ('django.db.models.fields.DecimalField', [], {'default': "'0.00'", 'max_digits': '18', 'decimal_places': '10'}),
            'items_tax': ('django.db.models.fields.DecimalField', [], {'default': "'0.00'", 'max_digits': '18', 'decimal_places': '10'}),
            'language_code': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10', 'blank': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'paid': ('django.db.models.fields.DecimalField', [], {'default': "'0.00'", 'max_digits': '18', 'decimal_places': '10'}),
            'price_includes_tax': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'shipping_address': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'shipping_city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_company': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_cost': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '18', 'decimal_places': '10', 'blank': 'True'}),
            'shipping_country': ('django_countries.fields.CountryField', [], {'max_length': '2', 'blank': 'True'}),
            'shipping_discount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '18', 'decimal_places': '10', 'blank': 'True'}),
            'shipping_method': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'shipping_same_as_billing': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'shipping_tax': ('django.db.models.fields.DecimalField', [], {'default': "'0.00'", 'max_digits': '18', 'decimal_places': '10'}),
            'shipping_zip_code': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'default': '10'}),
            'total': ('django.db.models.fields.DecimalField', [], {'default': "'0.00'", 'max_digits': '18', 'decimal_places': '10'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'orders'", 'null': 'True', 'to': u"orm['authtools.User']"})
        },
        u'shop.orderitem': {
            'Meta': {'ordering': "('product',)", 'object_name': 'OrderItem'},
            '_line_item_discount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '18', 'decimal_places': '10', 'blank': 'True'}),
            '_line_item_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '18', 'decimal_places': '10'}),
            '_line_item_tax': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '18', 'decimal_places': '10'}),
            '_unit_price': ('django.db.models.fields.DecimalField', [], {'max_digits': '18', 'decimal_places': '10'}),
            '_unit_tax': ('django.db.models.fields.DecimalField', [], {'max_digits': '18', 'decimal_places': '10'}),
            'currency': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'data': ('plata.fields.JSONField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_sale': ('django.db.models.fields.BooleanField', [], {}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'order': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'to': u"orm['shop.Order']"}),
            'product': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['catalog.Combo']", 'null': 'True', 'on_delete': 'models.SET_NULL', 'blank': 'True'}),
            'quantity': ('django.db.models.fields.IntegerField', [], {}),
            'sku': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'tax_class': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['shop.TaxClass']", 'null': 'True', 'on_delete': 'models.SET_NULL', 'blank': 'True'}),
            'tax_rate': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '2'})
        },
        u'shop.orderpayment': {
            'Meta': {'ordering': "('-timestamp',)", 'object_name': 'OrderPayment'},
            'amount': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '2'}),
            'authorized': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'currency': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'data': ('plata.fields.JSONField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'order': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'payments'", 'to': u"orm['shop.Order']"}),
            'payment_method': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'payment_module': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'payment_module_key': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'default': '10'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'transaction_id': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'})
        },
        u'shop.orderstatus': {
            'Meta': {'ordering': "('created', 'id')", 'object_name': 'OrderStatus'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'order': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'statuses'", 'to': u"orm['shop.Order']"}),
            'status': ('django.db.models.fields.PositiveIntegerField', [], {'max_length': '20'})
        },
        u'shop.taxclass': {
            'Meta': {'ordering': "['-priority']", 'object_name': 'TaxClass'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'priority': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'rate': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '2'})
        }
    }

    complete_apps = ['shop']
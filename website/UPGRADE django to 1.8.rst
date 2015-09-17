

# manual steps, should be represented in requirements
pip install Django==1.8.3
pip install django-sekizai-0.8.2
pip install django-cms==3.1.2
pip install django-filer==0.9.11
pip install django-mptt==0.7.4
pip install django-hvad==1.2.2
pip uninstall South
pip install djangocms-text-ckeditor==2.5.3
pip install django-tastypie==0.12.2

pip install simplejson==3.8.0
pip install django_compressor==1.5
pip install celery==3.1.18



# after requirements install, somehow filer/polymorphic is broken!!
pip install django-filer==0.9.11




# replacements - should only be done in models!!!
from django.contrib.auth import get_user_model
from django.conf import settings




# migration steps


SQL "ALTER TABLE django_content_type DROP COLUMN name;"

./manage.py migrate cms 0004
./manage.py migrate cms 0003 --fake
./manage.py migrate cms 0004
./manage.py migrate cms



./manage.py migrate achat --fake
./manage.py migrate backfeed --fake
./manage.py migrate contentproxy --fake
./manage.py migrate easy_thumbnails --fake

./manage.py migrate --fake-initial
./manage.py migrate

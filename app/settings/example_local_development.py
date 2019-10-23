from .development import *

#######################################################################
# use this file to extend / override `settings.development`
# don't forget to specify this module like:
#     export DJANGO_SETTINGS_MODULE=app.settings.local_development
#######################################################################


##################################################################
# django default staticfiles storage
# (for simple testing without whitenoise/manifest)
##################################################################
# STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'


##################################################################
# db
##################################################################
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "ch_openbroadcast_local",
    }
}

from .development import *

#######################################################################
# use this file to extend / override `settings.development`
#######################################################################
DEBUG = True

##################################################################
# db
##################################################################
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ch_openbroadcast_local',
    },
}

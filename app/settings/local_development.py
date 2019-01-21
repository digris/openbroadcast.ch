from .development import *

#######################################################################
# use this file to extend / override `settings.development`
#######################################################################
DEBUG = True


API_BASE_AUTH = {
    'username': 'remote',
    'api_key': 'd65b075c593f27a42c26e65be74c047e5b50d215',
}

##################################################################
# db
##################################################################
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ch_openbroadcast_local',
    },
}

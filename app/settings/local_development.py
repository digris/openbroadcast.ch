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

MEDIA_ROOT = '/Users/ohrstrom/srv/openbroadcast.ch/media'
SENDFILE_ROOT = os.path.join(MEDIA_ROOT, 'private')

STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'


RAVEN_SENTRY_DSN = 'https://f63f7f43d43244dda24b38f2aa947965:ae4118b11737401a823902e55c17d2c7@sentry.pbi.io/8'

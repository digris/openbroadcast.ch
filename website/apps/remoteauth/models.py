# -*- coding: utf-8 -*-
import logging
import requests
import re
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core import validators
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, User, Group, UserManager, AbstractBaseUser, BaseUserManager, UserManager, AbstractUser
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ImproperlyConfigured

log = logging.getLogger(__name__)

AUTH_ENDPOINT = getattr(settings, 'REMOTE_AUTH_ENDPOINT', None)

if not AUTH_ENDPOINT:
    raise ImproperlyConfigured('REMOTE_AUTH_ENDPOINT in settings is required!')

class UserManager(BaseUserManager):
    pass

class User(AbstractUser):
    remote_id = models.IntegerField(null=True, blank=True)




def validate_registration(key, value):

    log.debug('validating %s "%s"' % (key, value))

    url = AUTH_ENDPOINT + 'validate-registration/'
    payload = {
        'key': key,
        'value': value
    }

    r = requests.post(url, payload)

    #print payload
    log.debug('%s %s' % (url, r.status_code))

    if not r.status_code == 200:
        log.warning('Unable to communicate with the remoteauth API')
        return {'error', 'Unable to communicate with the remoteauth API'}

    try:
        data = r.json()
    except:
        return {'error', 'Unable to decode API response'}


    return data


def register_user(username, email, password):

    log.debug('register %s %s %s' % (username, email, password))

    url = AUTH_ENDPOINT + 'register/'
    payload = {
        'username': username,
        'email': email,
        'password': password,
    }

    r = requests.post(url, payload)


    print r.text

    #print payload
    log.debug('%s %s' % (url, r.status_code))

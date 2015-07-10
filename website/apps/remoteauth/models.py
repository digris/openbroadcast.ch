# -*- coding: utf-8 -*-
import logging
import requests
import re
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core import validators
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch.dispatcher import receiver
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
    remote_uri = models.CharField(max_length=256, null=True, blank=True)
    profile_uri = models.CharField(max_length=256, null=True, blank=True)




@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):

    log.debug('user post-save: %s - created: %s' % (instance, created))
    #instance.emit_message()

    if not instance.remote_id:
        log.debug('no remote id for user %s with pk: %s' % (instance, instance.id))

        print '///////////////////////////////'
        print 'trying to get remote user'

        remote_user = get_social_user(instance)

        print '************************'
        print remote_user

        if remote_user and 'id' in remote_user:

            remote_id = remote_user['id']

            print 'remote id: %s' % remote_user['id']

            if remote_id:
                instance.remote_id = remote_id
                instance.save()








def validate_registration(key, value):

    log.debug('validating %s "%s"' % (key, value))

    url = AUTH_ENDPOINT + 'validate-registration/'
    payload = {
        'key': key,
        'value': value
    }

    r = requests.post(url, payload)

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

    log.debug('%s %s' % (url, r.status_code))


def get_social_user(user):

    log.debug('get_remote_user %s' % (user))


    if not user.social_auth.exists():
        log.warning('user does not have a social account associated')
        return None

    social_account = user.social_auth.all()[0]

    # print '///// social_account'
    # print social_account
    # print social_account.user
    # print social_account.provider
    # print social_account.uid
    # print social_account.extra_data




    url = AUTH_ENDPOINT + 'get-social-user/'
    payload = {
        'provider': social_account.provider,
        'uid': social_account.uid,
    }

    print url
    print payload

    r = requests.post(url, payload)

    if not r.status_code == 200:
        log.warning('Unable to communicate with the remoteauth API')
        print r.status_code
        print r.text

        return

    try:
        return r.json()
    except:
        return


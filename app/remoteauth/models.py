# -*- coding: utf-8 -*-
import logging
import requests
import json

from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch.dispatcher import receiver
from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.core.exceptions import ImproperlyConfigured

log = logging.getLogger(__name__)

AUTH_ENDPOINT = getattr(settings, "REMOTE_AUTH_ENDPOINT", None)

if not AUTH_ENDPOINT:
    raise ImproperlyConfigured("REMOTE_AUTH_ENDPOINT in settings is required!")


class UserManager(BaseUserManager):
    pass


class User(AbstractUser):

    remote_id = models.IntegerField(null=True, blank=True)
    remote_uri = models.CharField(max_length=256, null=True, blank=True)
    profile_uri = models.CharField(max_length=256, null=True, blank=True)

    # provided by remote models 'Profile'
    pseudonym = models.CharField(blank=True, null=True, max_length=250)

    class Meta(object):
        app_label = "remoteauth"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def get_display_name(self):

        if self.pseudonym:
            return self.pseudonym

        if self.get_full_name():
            return self.get_full_name()

        return self.username


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):

    log.debug("user post-save: %s - created: %s" % (instance, created))

    remote_user = None

    if not instance.remote_id:
        log.debug("no remote id for user %s with pk: %s" % (instance, instance.id))
        remote_user = get_or_create_social_user(instance)

        if remote_user:
            remote_id = remote_user["user"]["id"]
            print("remote id: %s" % remote_user["id"])
            if remote_id:
                instance.remote_id = remote_id
                instance.save()

    """
    check for updated profile data
    only needed if social enabled account ('default' accounts are updated via auth backend)
    """
    if instance.social_auth.exists():
        log.debug("social enabled account. will check for profile updates")

        if not remote_user:
            remote_user = get_or_create_social_user(instance)

        if instance.first_name != remote_user["user"]["first_name"]:
            log.debug('first_name changed -> update user "%s"' % instance.first_name)
            User.objects.filter(pk=instance.pk).update(
                first_name=remote_user["user"]["first_name"]
            )

        if instance.last_name != remote_user["user"]["last_name"]:
            log.debug('last_name changed -> update user "%s"' % instance.last_name)
            User.objects.filter(pk=instance.pk).update(
                last_name=remote_user["user"]["last_name"]
            )


def validate_registration(key, value):

    log.debug('validating %s "%s"' % (key, value))

    url = AUTH_ENDPOINT + "validate-registration/"
    payload = {"key": key, "value": value}

    r = requests.post(url, payload)

    log.debug("%s %s" % (url, r.status_code))

    if not r.status_code == 200:
        log.warning("Unable to communicate with the remoteauth API")
        return {"error", "Unable to communicate with the remoteauth API"}

    try:
        data = r.json()
    except:
        return {"error", "Unable to decode API response"}

    return data


def register_user(username, email, password):

    log.debug("register %s %s %s" % (username, email, password))

    url = AUTH_ENDPOINT + "register/"
    payload = {"username": username, "email": email, "password": password}

    r = requests.post(url, payload)

    log.debug("%s %s" % (url, r.status_code))


def get_or_create_social_user(user):

    log.debug("get_remote_user %s" % (user))

    if not user.social_auth.exists():
        log.warning("user does not have a social account associated")
        return None

    social_account = user.social_auth.all()[0]

    url = AUTH_ENDPOINT + "get-or-create-social-user/"
    payload = {
        "provider": social_account.provider,
        "uid": social_account.uid,
        "extra_data": json.dumps(social_account.extra_data),
        "user": json.dumps(
            {
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        ),
    }

    r = requests.post(url, payload)

    if not r.status_code == 200:
        log.warning(
            "Unable to communicate with the remoteauth API. status: %s" % r.status_code
        )
        return

    try:
        return r.json()
    except:
        return

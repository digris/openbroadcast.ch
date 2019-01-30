# -*- coding: utf-8 -*-
import logging
import requests
from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django.conf import settings
from django.contrib.auth.models import Group
from django.core.exceptions import ImproperlyConfigured
from django.contrib.auth import get_user_model

User = get_user_model()

log = logging.getLogger(__name__)

AUTH_ENDPOINT = getattr(settings, 'REMOTE_AUTH_ENDPOINT', None)

if not AUTH_ENDPOINT:
    raise ImproperlyConfigured('REMOTE_AUTH_ENDPOINT in settings is required!')


class RemoteUserBackend(ModelBackend):
    """
    Authenticates against remote API
    """
    def authenticate(self, username=None, password=None):
        log.info('remote login: %s | %s' % (username, '*******************'))
        return self.remote_auth(username, password)


    def get_group_permissions(self, user_obj, obj=None):
        """
        Returns a set of permission strings that this user has through his/her
        groups.
        """
        if not hasattr(user_obj, '_group_perm_cache'):
            # TODO: improve performances
            permissions = [u"%s.%s" % (p.content_type.app_label, p.codename) \
                                        for group in user_obj.groups.all() \
                                            for p in group.permissions.all()]
            user_obj._group_perm_cache = permissions
        return user_obj._group_perm_cache


    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


    def remote_auth(self, username=None, password=None):

        url = AUTH_ENDPOINT + 'login/'
        payload = {
            'username': username,
            'password': password
        }

        r = requests.post(url , payload)

        if not r.status_code == 200:
            return None

        data = r.json()

        import json
        print(json.dumps(data, indent=4))


        # print '///////////////////////////////////////'
        # print 'got user:     %s' % data['username']
        # print 'is_staff:     %s' % data['is_staff']
        # print 'is_superuser: %s' % data['is_superuser']
        # print 'is_active:    %s' % data['is_active']
        # print 'first_name:   %s' % data['first_name']
        # print 'last_name:    %s' % data['last_name']
        # print 'email:        %s' % data['email']
        # print 'groups:       %s' % data['groups']
        # print '///////////////////////////////////////'

        user, created = User.objects.get_or_create(username=data['username'], remote_id=data['id'])
        user.set_password(password)
        user.is_staff = data['is_staff']
        user.is_superuser = data['is_superuser']
        user.is_active = data['is_active']
        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.email = data['email']
        user.remote_uri = data['resource_uri']
        user.profile_uri = data['profile']['resource_uri']
        user.pseudonym = data['profile']['pseudonym']

        # dumb group assignment
        for group_name in data['groups'].split(','):
            g, c = Group.objects.get_or_create(name=group_name)
            g.user_set.add(user)

        user.save()


        return user

import re
import datetime
import os

from dateutil import relativedelta
from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.db.models import permalink
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save

from registration.signals import user_registered

#from invitation.signals import invitation_accepted



DEFAULT_GROUP = 'User'



class Profile(models.Model):

    #user = models.OneToOneField(User, unique=True, on_delete=models.CASCADE)

    user = models.OneToOneField(
        getattr(settings, 'AUTH_USER_MODEL', 'auth.User'),
        verbose_name=_('user'),
        related_name='profile', on_delete=models.CASCADE)

    # auto-update
    created = models.DateTimeField(auto_now_add=True, editable=False)
    updated = models.DateTimeField(auto_now=True, editable=False)
    

    
    address1 = models.CharField(_('address'), null=True, blank=True, max_length=100)
    address2 = models.CharField(_('address (secondary)'), null=True, blank=True, max_length=100)
    # state = models.CharField(_('state'), null=True, blank=True, max_length=100)
    city = models.CharField(_('city'), null=True, blank=True, max_length=100)
    zip = models.CharField(_('zip'), null=True, blank=True, max_length=10)
    #country = models.CharField(_('country'), null=True, blank=True, max_length=100)
    #country = CountryField(blank=True, null=True)


    class Meta:
        app_label = 'profiles'
        verbose_name = _('user profile')
        verbose_name_plural = _('user profiles')
        db_table = 'user_profiles'
        ordering = ('-user__last_login',)


    def __unicode__(self):
        return u"%s" % self.user.email



    @permalink
    def get_absolute_url(self):
        return ('profiles-profile-detail', None, { 'slug': self.user.username })


    @models.permalink
    def get_edit_url(self):
        return ('profiles-profile-edit',)

    def get_admin_url(self):

        return ''



        

    def save(self, *args, **kwargs):

        super(Profile, self).save(*args, **kwargs)







#def create_profile(sender, instance, created, **kwargs):
#
#    if created:
#       profile, created = Profile.objects.get_or_create(user=instance)
#
#       default_group, created = Group.objects.get_or_create(name=DEFAULT_GROUP)
#       instance.groups.add(default_group)
#       instance.save()
#
#post_save.connect(create_profile, sender=User)


def user_registered_callback(sender, user, request, **kwargs):
    profile, created = Profile.objects.get_or_create(user=user)

user_registered.connect(user_registered_callback)


        
        
        
        
        
        
import logging
from django.db import models
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from django.utils import timezone
from django.dispatch import receiver
import emailit.api
from registration.signals import user_registered, user_accepted, user_rejected, user_activated


INSPECTOR_EMAIL = getattr(settings, 'INSPECTOR_EMAIL', None)

log = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL

class Invitation(models.Model):

    token = models.CharField(max_length=6, null=True, blank=True, help_text='Will be generated if empty')
    user = models.OneToOneField(
        getattr(settings, 'AUTH_USER_MODEL', 'auth.User'),
        related_name='token',
        null=True, on_delete=models.CASCADE)

    expires = models.DateTimeField()
    claimed = models.DateTimeField(null=True, blank=True)

    def __unicode__(self):
        if self.token and len(self.token) == 6:
            return "%s-%s-%s" % (self.token[0:2], self.token[2:4], self.token[4:6], )
        return "%s" % self.token

    @property
    def valid(self):
        if self.claimed:
            return False
        if self.expires < timezone.now():
            return False
        return True

    def claim(self):
        self.claimed = timezone.now()
        self.save()
        return

    def save(self, *args, **kwargs):

        if not self.expires:
            self.expires = datetime.now() + timedelta(days=3)

        if not self.token or not len(self.token) == 6:
            # TODO: avoid duplicates!
            import random
            valid_letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
            self.token = ''.join((random.choice(valid_letters) for i in xrange(6)))

        super(Invitation, self).save(*args, **kwargs)




# hook into registration/confirmation flow
@receiver(user_registered)
def on_user_registered(sender, *args, **kwargs):

    registration_profile = kwargs['profile']
    log.info('new user registered: %s' % registration_profile.user.email)
    # notify site owners about this happening :) !
    context = {
        'user': registration_profile.user,
        'profile': registration_profile,
    }
    emailit.api.mail_managers(context, 'email/admin/user_registered')





    #if obj.user:
    #    obj.user.delete()


@receiver(user_accepted)
def on_user_accepted(sender, *args, **kwargs):

    registration_profile = kwargs['profile']
    log.info('user accepted: %s' % registration_profile.user.email)

    from bshop.models import Contact
    from wholesale.models import DealerRegistration
    contact, created = Contact.objects.get_or_create(user=registration_profile.user)

    # not so nice... but does the job for the moment.
    if registration_profile.supplement_class == DealerRegistration:

        contact.billing_company = registration_profile.supplement.company
        contact.billing_name = registration_profile.supplement.name
        contact.save()

        registration_profile.user.name = registration_profile.supplement.name
        registration_profile.user.save()


    #obj = kwargs['instance']
    #print obj



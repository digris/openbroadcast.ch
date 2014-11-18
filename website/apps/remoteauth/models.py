import re
from django.db import models
from django.utils import timezone
from django.core import validators
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, User, Group, UserManager, AbstractBaseUser, BaseUserManager, UserManager, AbstractUser
from django.utils.translation import ugettext_lazy as _



class UserManager(BaseUserManager):
    pass


class User(AbstractUser):

    #username = models.CharField(max_length=64, unique=True)
    #USERNAME_FIELD = 'username'

    remote_id = models.IntegerField(null=True, blank=True)

    #objects = UserManager()

    pass
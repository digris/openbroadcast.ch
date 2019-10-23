# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# from django.conf import settings

from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(UserAdmin):

    list_display = UserAdmin.list_display + ("remote_id",)
    date_hierarchy = "last_login"

    fieldsets = UserAdmin.fieldsets + (
        ("Extras", {"fields": ["remote_id", "remote_uri", "profile_uri", "pseudonym"]}),
    )

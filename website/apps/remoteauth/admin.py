from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.conf import settings

from django.contrib.auth import get_user_model

User = get_user_model()

class UserAdmin(UserAdmin):

    list_display = UserAdmin.list_display + ('remote_id', )
    date_hierarchy = 'last_login'

    fieldsets =  UserAdmin.fieldsets + (
        ('Extras',  {'fields': [
            'remote_id',
            'remote_uri',
            'profile_uri',
            'pseudonym',
            ]}
         ),
    )

    #inlines = (EmployeeInline, )

# Re-register UserAdmin
#admin.site.unregister(User)
admin.site.register(User, UserAdmin)
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

#from remoteauth.models import User



# Define a new User admin
class UserAdmin(UserAdmin):
    pass
    #inlines = (EmployeeInline, )

# Re-register UserAdmin
#admin.site.unregister(User)
admin.site.register(User, UserAdmin)
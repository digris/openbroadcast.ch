from django.contrib import admin
from models import Colorset




class ColorestAdmin(admin.ModelAdmin):

    def has_add_permission(self, request):
        return False if self.model.objects.count() > 0 else True

admin.site.register(Colorset, ColorestAdmin)
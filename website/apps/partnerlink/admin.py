from django.contrib import admin
from .models import Partnerlink, SponsorCategory

from django.contrib import admin





class PartnerlinkAdmin(admin.ModelAdmin):

    list_display = ['name', 'url', 'category',]
    list_filter = ['category',]
    #date_hierarchy = 'published'
    save_on_top = True


    """
    fieldsets = [
        (None,               {'fields': ['name', 'slug', 'folder']}),
        ('Relations', {'fields': ['parent'], 'classes': ['']}),
        ('Other content', {'fields': ['first_placeholder'], 'classes': ['plugin-holder', 'plugin-holder-nopage']}),
    ]
    """

admin.site.register(Partnerlink, PartnerlinkAdmin)
admin.site.register(SponsorCategory)

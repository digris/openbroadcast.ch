from django.contrib import admin
from django.utils.text import Truncator
from achat.models import Message


class MessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'created', 'text_display']
    date_hierarchy = 'created'
    search_fields = ['user__username',]

    def text_display(self, obj):
        return Truncator(obj.text).words(16, html=True, truncate=' ...')

    text_display.short_description = 'Text'
    text_display.allow_tags = False


admin.site.register(Message, MessageAdmin)

# Register your models here.

from django.contrib import admin
from django.contrib.contenttypes.generic import GenericTabularInline
from django.utils.text import Truncator
from achat.models import Message, MentionedUser


class MentionedUserInline(admin.TabularInline):
    model = MentionedUser
    raw_id_fields = ['user',]
    extra = 0


class MessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'created', 'text_display']
    date_hierarchy = 'created'
    search_fields = ['user__username',]

    def text_display(self, obj):
        return Truncator(obj.text).words(16, html=True, truncate=' ...')

    text_display.short_description = 'Text'
    text_display.allow_tags = False

    inlines = [
        MentionedUserInline,
    ]


admin.site.register(Message, MessageAdmin)

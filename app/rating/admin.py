from django.contrib import admin

from .models import AnonymousVote


@admin.register(AnonymousVote)
class AnonymousVoteAdmin(admin.ModelAdmin):
    list_display = ["__str__", "session_key", "value", "obj_ct", "obj_uuid"]

    list_filter = ["value"]

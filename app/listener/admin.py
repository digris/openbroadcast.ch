from django.contrib import admin

from .models import StreamEvent


@admin.register(StreamEvent)
class StreamEventAdmin(admin.ModelAdmin):

    date_hierarchy = "time_start"

    list_filter = ["time_start"]

    list_display = [
        "path",
        "ip",
        "method",
        "status",
        "bytes_sent",
        "seconds_connected",
        "time_start",
        "time_end",
        "referer",
        "user_agent",
    ]

import time
from django.db.models import Q
from django.contrib import admin
from django.utils.html import format_html

from .models import StreamEvent


class SecondsConnectedFilter(admin.SimpleListFilter):
    title = "Time connected"
    parameter_name = "seconds_connected"

    def lookups(self, request, model_admin):
        return [
            ("60-300", "1 - 5 minutes"),
            ("300-900", "5 - 15 minutes"),
            ("900-1800", "15 - 30 minutes"),
            ("1800-3600", "30 - 60 minutes"),
            ("3600-7200", "60 - 120 minutes"),
            ("7200-9999999", "120+ minutes"),
        ]

    def queryset(self, request, queryset):
        if self.value():
            _range = list(map(int, [f for f in self.value().split("-")]))
            return queryset.distinct().filter(seconds_connected__range=_range)

        return queryset.distinct().all()


class BANConnectionFilter(admin.SimpleListFilter):
    title = "BAN connections"
    parameter_name = "is_ban"

    def lookups(self, request, model_admin):
        return [("y", "only BAN clients"), ("n", "hide BAN clients")]

    def queryset(self, request, queryset):

        _ban_ua = Q(user_agent__istartswith='DABplayer') | Q(user_agent__istartswith='Liquidsoap')

        if self.value() == "y":
            return queryset.distinct().filter(_ban_ua)
        if self.value() == "n":
            return queryset.distinct().exclude(_ban_ua)

        return queryset.distinct().all()


@admin.register(StreamEvent)
class StreamEventAdmin(admin.ModelAdmin):
    ordering = ("-time_end",)
    date_hierarchy = "time_start"

    list_filter = [SecondsConnectedFilter, BANConnectionFilter,  "time_start", "method", "status"]

    search_fields = ["path", "ip", "user_agent", "referer"]

    list_display = [
        "method",
        "time_connected",
        "connected",
        "disconnected",
        "ip",
        "path",
        "referer",
        "user_agent_display",
        "status",
        "bytes_sent",
    ]

    def connected(self, obj):
        if not obj.time_start:
            return "-"
        return "{:%H:%M:%S}".format(obj.time_start)
        # return '{:%H:%M:%S %Y/%m/%d}'.format(obj.time_start)

    connected.admin_order_field = "time_start"
    connected.short_description = "Connected"

    def disconnected(self, obj):
        if not obj.time_end:
            return "-"
        return "{:%H:%M:%S}".format(obj.time_end)
        # return '{:%H:%M:%S %Y/%m/%d}'.format(obj.time_end)

    disconnected.admin_order_field = "time_start"
    disconnected.short_description = "Disconnected"

    def time_connected(self, obj):

        if not obj.seconds_connected:
            return "-"

        return format_html(
            '<span style="display: block; text-align: right;">{}</span>',
            time.strftime("%H:%M:%S", time.gmtime(obj.seconds_connected)),
        )

    time_connected.admin_order_field = "seconds_connected"

    def user_agent_display(self, obj):

        if not obj.user_agent:
            return "-"

        return obj.user_agent[0:80]

    user_agent_display.admin_order_field = "user_agent"

from django.apps import AppConfig


class OnairConfig(AppConfig):
    name = "onair"
    verbose_name = "On-Air App"

    def ready(self):
        from . import signals  # noqa

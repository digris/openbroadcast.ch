from django.apps import AppConfig


class ChatConfig(AppConfig):
    name = 'chat'
    verbose_name = 'Chat App'

    def ready(self):
        import chat.signals #noqa

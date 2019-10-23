from django.db import models

# TODO: refactor to mixins


class TimestampedModel(models.Model):

    created = models.DateTimeField(auto_now_add=True, editable=False)
    updated = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

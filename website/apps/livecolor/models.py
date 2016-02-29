# -*- coding: utf-8 -*-
import logging
from django.db import models
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch.dispatcher import receiver
from livecolor.util import Livecolor

log = logging.getLogger(__name__)


class Colorset(models.Model):

    bg_color = models.CharField(max_length=7, null=True, blank=True, default='#000000')
    fg_color = models.CharField(max_length=7, null=True, blank=True, default='#ffffff')
    duration = models.PositiveIntegerField(null=True, blank=True, default=10000)

    class Meta(object):
        app_label = 'livecolor'
        verbose_name = 'Colorset'
        verbose_name_plural = 'Colorset'

    def __unicode__(self):
        return '%s %s' % (self.bg_color, self.fg_color)

    def save(self, *args, **kwargs):
        super(Colorset, self).save(*args, **kwargs)

@receiver(post_save, sender=Colorset)
def message_post_save(sender, instance, **kwargs):
    log.debug('Post-save action: %s' % (instance))
    #instance.emit_message()

    lc = Livecolor()
    lc.set_color(
            bg_color=instance.bg_color,
            fg_color=instance.fg_color,
            duration=instance.duration
    )
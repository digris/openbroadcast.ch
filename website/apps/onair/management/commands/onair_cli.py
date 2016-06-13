#-*- coding: utf-8 -*-
from __future__ import absolute_import
from optparse import make_option
import datetime
from django.core.management.base import BaseCommand, NoArgsCommand, CommandError
from django.utils import translation
from onair.models import ScheduledItem

from onair.util import schedule

DEFAULT_RANGE = 600

class Process(BaseCommand):

    def __init__(self, * args, **kwargs):
        super(Process, self).__init__()
        self.action = kwargs.get('action')
        self.verbosity = int(kwargs.get('verbosity', 1))

    def update_schedule(self, *args, **options):
        result = schedule.fetch_from_api(range_start=DEFAULT_RANGE, range_end=DEFAULT_RANGE)
        self.stdout.write('Processed {0} items'.format(len(result)))


    def reset_schedule(self, *args, **options):
        result = ScheduledItem.objects.all().delete()


class Command(BaseCommand):

    help = 'On-Air CLI'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            help="update_schedule, reset_schedule"
        )

    def handle(self, *args, **options):

        p = Process(**options)

        p_func = getattr(p, options.get('action'))
        p_func()


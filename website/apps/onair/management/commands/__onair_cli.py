#-*- coding: utf-8 -*-
from __future__ import absolute_import
from optparse import make_option
import datetime
from django.core.management.base import BaseCommand, NoArgsCommand
from django.utils import translation
from onair.models import ScheduledItem

from onair.util import schedule

DEFAULT_RANGE = 600

class Process(object):
    def __init__(self, * args, **kwargs):
        self.action = kwargs.get('action')
        self.verbosity = int(kwargs.get('verbosity', 1))
        
    def run(self):

        if self.action == 'update_schedule':
            result = schedule.fetch_from_api(range_start=DEFAULT_RANGE, range_end=DEFAULT_RANGE)
            print 'num items processed: %s' % len(result)

        if self.action == 'reset_schedule':
            result = ScheduledItem.objects.all().delete()

class Command(NoArgsCommand):

    option_list = BaseCommand.option_list + (
        make_option('--action',
            action='store',
            dest='action',
            default=False,
            help='Fill up the scheduler!!'),
        )

    def handle_noargs(self, **options):
        p = Process(**options)
        p.run()

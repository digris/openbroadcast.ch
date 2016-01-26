#-*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging
import argparse
import textwrap
from django.core.management.base import BaseCommand
from django.conf import settings
from livecolor.util import Livecolor

log = logging.getLogger(__name__)

DEFAULT_DURATION = 1000


COMMAND_DESCRIPTION = ''''''
COMMAND_EXAMPLE = '''\
Example uf use:
--------------------------

    python manage.py livecolor_cli update -f 330077 -b 889977 -d 5000

.
'''


class Command(BaseCommand):

    def add_arguments(self, parser):

        parser.formatter_class=argparse.RawDescriptionHelpFormatter
        #parser.description=textwrap.dedent(COMMAND_DESCRIPTION)
        parser.epilog=textwrap.dedent(COMMAND_EXAMPLE)

        parser.add_argument(
                'action',
                type=str,
                choices=[
                    'set_color',
                ]
        )

        parser.add_argument('-b', '--bg_color',
            action='store',
            required=True,
            dest='bg_color',
            help='Background color in hex. format. E.g. 00FFFF'
        )

        parser.add_argument('-f', '--fg_color',
            action='store',
            dest='fg_color',
            default=None,
            help='Foreground color in hex. format. E.g. 00FFFF'
        )

        parser.add_argument('-d', '--duration',
            action='store',
            type=int,
            dest='duration',
            default=DEFAULT_DURATION,
            help='Duration of transition [{:}]'.format(DEFAULT_DURATION)
        )



    def handle(self, *args, **options):

        self.stdout.write('\n\n\nRunning Livecolor')


        lc = Livecolor()

        ap_action = getattr(lc, options['action'])
        ap_action(
                bg_color=options['bg_color'],
                fg_color=options['fg_color'],
                duration=options['duration'],
        )

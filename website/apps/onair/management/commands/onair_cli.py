#-*- coding: utf-8 -*-
from __future__ import absolute_import

from django.utils import timezone
import djclick as click
import sys

from onair.models import ScheduledItem
from onair.util import schedule

DEFAULT_RANGE = 600

@click.group()
def cli():
    pass


@cli.command()
def reset_schedule():
    """
    fetch schedule data from openbroadcast.org API
    """
    result = ScheduledItem.objects.all().delete()
    click.echo('Resetted schedule {}'.format(result))


@cli.command()
def update_schedule():
    """
    reset locally cached schedule data
    """
    result = schedule.fetch_from_api(range_start=DEFAULT_RANGE, range_end=DEFAULT_RANGE)
    click.echo('Processed {0} items'.format(len(result)))

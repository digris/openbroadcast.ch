# -*- coding: utf-8 -*-
from __future__ import absolute_import

import djclick as click

from ...schedule import scheduler

DEFAULT_RANGE = (-3600, 3600)
DEFAULT_MAX_AGE = 3600


@click.group()
def cli():
    pass


@cli.command()
def update_schedule():
    """
    fetch schedule data from openbroadcast.org API
    """
    result = scheduler.fetch_schedule_from_remote_api(time_range=DEFAULT_RANGE)
    click.echo("Processed {} items".format(len(result)))


@cli.command()
def cleanup_schedule():
    """
    clean local schedule cache
    """
    result = scheduler.cleanup_local_schedule(max_age=DEFAULT_MAX_AGE)
    click.echo("Cleaned schedule {}".format(result))


@cli.command()
def reset_schedule():
    """
    reset locally cached schedule data
    """
    result = scheduler.reset_local_schedule()
    click.echo("Reset schedule {}".format(result))

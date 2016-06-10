# -*- coding: utf-8 -*-
from __future__ import absolute_import

from livecolor.models import Colorset
import random


TRANSITION_DURATION = 10000
COLOR_MODES = {
    'day': {
          'bg': '#fafafa',
          'fg': '#000000',
    },
    'night': {
          'bg': '#222222',
          'fg': '#ffffff',
    },
}


def set_colors_by_daytime():

    r = lambda: random.randint(120,255)

    qs = Colorset.objects.all()

    if not qs.exists():
        cs = Colorset()
    else:
        cs = qs[0]

    cs.bg_color = '#%02X%02X%02X' % (r(), r(), r())
    cs.fg_color = '#000000'

    cs.duration = 5000

    cs.save()




def set_colors_by_mode(mode):

    qs = Colorset.objects.all()

    if not qs.exists():
        cs = Colorset()
    else:
        cs = qs[0]

    colors = COLOR_MODES[mode]

    cs.bg_color = colors['bg']
    cs.fg_color = colors['fg']

    cs.duration = TRANSITION_DURATION

    cs.save()

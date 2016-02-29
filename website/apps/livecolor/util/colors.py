
from livecolor.models import Colorset
import random




def set_colors_by_daytime():

    r = lambda: random.randint(120,255)

    cs = Colorset.objects.all()[0]

    cs.fg_color = '#000000'
    cs.bg_color = '#%02X%02X%02X' % (r(),r(),r())

    cs.duration = 5000

    cs.save()

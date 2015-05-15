import json
import datetime
from django.conf import settings
from django.http import HttpResponse

TIME_ZONE = getattr(settings, 'TIME_ZONE', None)

def current_time(request):
    now = datetime.datetime.now()
    data = {
        'time': now.strftime("%Y-%m-%d %H:%M:%S"),
        'timezone': u'%s' % TIME_ZONE
    }
    return HttpResponse(json.dumps(data), mimetype="application/json")
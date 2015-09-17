import json
import datetime
from django.conf import settings
from django.http import HttpResponse

TIME_ZONE = getattr(settings, 'TIME_ZONE', None)

def current_time(request):
    now = datetime.datetime.now()
    data = {
        'time': now.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
        'timezone': u'%s' % TIME_ZONE
    }
    return HttpResponse(json.dumps(data), content_type="application/json")
import json
import datetime
from django.http import  HttpResponse

def current_time(request):

    data = {
        'time': datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }

    return HttpResponse(json.dumps(data), mimetype="application/json")

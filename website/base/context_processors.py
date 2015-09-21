from __future__ import unicode_literals

from django.conf import settings

def cms_toolbar(request):

    toolbar_disabled = False
    if 'cms_toolbar_disabled' in request.session and request.session['cms_toolbar_disabled']:
        toolbar_disabled = True

    return {'cms_toolbar_disabled': toolbar_disabled}


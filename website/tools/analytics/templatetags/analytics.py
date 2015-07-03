from django import template
from django.conf import settings

DEBUG = getattr(settings, 'DEBUG', True)
ANALYTICS_CODE = getattr(settings, 'ANALYTICS_CODE', None)
ANALYTICS_SITE = getattr(settings, 'ANALYTICS_SITE', None)

register = template.Library()

@register.inclusion_tag('analytics/template.html', takes_context=True)
def analytics(context, *args, **kwargs):

    try:
        request = context['request']

        if DEBUG and not (ANALYTICS_CODE and ANALYTICS_SITE):
            from django.core.exceptions import ImproperlyConfigured
            raise ImproperlyConfigured("ANALYTICS_CODE and/or ANALYTICS_SITE not in settings.")

        # check if multi-language version
        if isinstance(ANALYTICS_CODE, dict):
            try:
                code = ANALYTICS_CODE[request.LANGUAGE_CODE]
            except:
                code = None
        else:
            code = ANALYTICS_CODE


        return {
            'request': request,
            'analytics_code': code,
            'analytics_site': ANALYTICS_SITE,
        }
    except:
        return {
            'request': None,
            'analytics_code': None,
            'analytics_site': None,
        }

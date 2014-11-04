import django
from django.conf.urls import patterns, url

urlpatterns = patterns('invitation.views',
    url(r'^invitation/check/$',
        'check_token',
        name='invitation_check_token'),
    url(r'^invitation/claim/(?P<token>[0-9A-Za-z]{6})/$',
        'claim_token_and_login',
        name='invitation_claim_token'),
)
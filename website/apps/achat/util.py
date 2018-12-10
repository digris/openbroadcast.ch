# -*- coding: utf-8 -*-
import logging
from bs4 import BeautifulSoup
from django.conf import settings
from django.contrib.auth import get_user_model
from achat.cleantalk import CleanTalk

CLEANTALK_KEY = 'a8yruqe6esy8'
CLEANTALK_SERVER_URL = 'https://moderate5.cleantalk.org'

log = logging.getLogger(__name__)
User = get_user_model()

def parse_text(html_text):

    soup = BeautifulSoup(html_text)

    # not so nice - nbsp to space
    text = soup.get_text().replace(u'\xa0', u' ')

    # strip all tags
    stripped_text = BeautifulSoup(text).text

    return stripped_text

def extract_mentioned_users(html_text):

    soup = BeautifulSoup(html_text)
    rels = []
    user_rels = soup.find_all(attrs={'data-ct': 'user'})

    log.debug('extracting user relations')

    for rel in user_rels:
        username = rel.text.strip().replace('@', '')
        user = User.objects.get(username=username)
        log.debug(u'%s with pk %s for %s' % (user.email, user.pk, username))
        rels.append(user)

    return rels

def is_spam(text, request=None):

    try:
        sender_ip = request.META.get('REMOTE_ADDR', None)
        sender_email = request.user.email
        sender_nickname = request.user.username

        ct = CleanTalk(
            auth_key=CLEANTALK_KEY,
            server_url=CLEANTALK_SERVER_URL
        )

        ct_result = ct.request(
                        message = text,
                        sender_ip = sender_ip,
                        sender_email = sender_email,
                        sender_nickname = sender_nickname,
                        js_on = None,
                        submit_time = None
                )

        log.debug('cleantalk: account_status: %(account_status)s - spam: %(spam)s - blacklisted: %(blacklisted)s' % ct_result)

        if not ct_result['allow']:
            return True, ct_result['comment'].replace('***', '')
    except Exception as e:
        log.warning('unable to access cleantalk api: %s' % e)

    if 'spam3000' in text:
        return True, 'dummy sting "spam3000" in text'

    return False, None

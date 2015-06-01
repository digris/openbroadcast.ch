# -*- coding: utf-8 -*-
import logging
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
#from feincms_cleanse import cleanse_html

log = logging.getLogger(__name__)
User = get_user_model()

def parse_text(html_text):

    soup = BeautifulSoup(html_text)

    # not so nice - nbsp to space
    text = soup.getText().replace(u'\xa0', u' ')

    return text

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


def message_to_html(text):

    html = u''
    bits = []

    for bit in text.split(' '):
        rendered_bit = bit
        if bit[0:1] == '@':
            rendered_bit = u"""<span data-ct="user">{username}</span>""".format(username=bit[1:])

        bits.append(rendered_bit)

    return u' '.join(bits)



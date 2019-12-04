# -*- coding: utf-8 -*-

import logging
import requests

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from .models import AnonymousVote

API_BASE_URL = getattr(settings, "API_BASE_URL", None)
API_BASE_AUTH = getattr(settings, "API_BASE_AUTH", None)

REMOTE_BASE_URL = getattr(settings, "REMOTE_BASE_URL", None)
REMOTE_API_AUTH_TOKEN = getattr(settings, "REMOTE_API_AUTH_TOKEN", None)

REQUEST_HEADERS = {
    "User-Agent": "openbroadcast.ch",
    "Authorization": "Token {auth_token}".format(auth_token=REMOTE_API_AUTH_TOKEN),
}

log = logging.getLogger(__name__)


def get_consolidated_votes(obj_ct, obj_uuid, request):
    """
    consolidate 'local' anonymous ratings with platform ratings
    """
    user = request.user

    if user and user.is_authenticated:
        user_remote_id = user.remote_id
        session_key = None
    else:
        user_remote_id = None
        session_key = request.session.session_key

    remote_votes, status_code = get_remote_votes(obj_ct, obj_uuid, user_remote_id)

    vote_qs = AnonymousVote.objects.filter(obj_ct=obj_ct, obj_uuid=obj_uuid)
    user_vote = None
    if session_key:
        try:
            _q = vote_qs.get(session_key=session_key)
            user_vote = _q.value
        except ObjectDoesNotExist:
            pass

    local_votes = {
        "ct": obj_ct,
        "uuid": obj_uuid,
        "upvotes": vote_qs.filter(value__gt=0).count(),
        "downvotes": vote_qs.filter(value__lt=0).count(),
        "user_vote": user_vote,
    }

    combined_votes = {
        "ct": obj_ct,
        "uuid": obj_uuid,
        "upvotes": remote_votes.get("upvotes", 0) + local_votes.get("upvotes", 0),
        "downvotes": remote_votes.get("downvotes", 0) + local_votes.get("downvotes", 0),
        "user_vote": remote_votes.get("user_vote")
        if user and user.is_authenticated
        else local_votes.get("user_vote"),
    }

    return combined_votes


def set_vote(obj_ct, obj_uuid, value, request):
    """
    add 'local' rating for anonymous user, or 'remote' vote for logged in user.
    """
    user = request.user

    if user and user.is_authenticated:
        log.debug("authenticated vote: {} {} {}".format(obj_ct, obj_uuid, value))
        votes, status_code = put_remote_vote(obj_ct, obj_uuid, value, user.remote_id)

    else:
        log.debug("anonymous vote: {} {} {}".format(obj_ct, obj_uuid, value))
        vote, _c = AnonymousVote.objects.get_or_create(
            session_key=request.session.session_key, obj_ct=obj_ct, obj_uuid=obj_uuid
        )

        if vote.value == value:
            vote.delete()
        else:
            vote.value = value
            vote.save()

    return get_consolidated_votes(obj_ct, obj_uuid, request)


def get_remote_votes(obj_ct, obj_uuid, user_remote_id=None):
    """
    get votes from platform rating
    """
    url = "{base_url}/api/v2/rating/rating/{obj_ct}:{obj_uuid}/".format(
        base_url=REMOTE_BASE_URL, obj_ct=obj_ct, obj_uuid=obj_uuid
    )

    params = {}
    if user_remote_id:
        params.update({"user_id": user_remote_id})

    log.debug(
        "get votes - ct: {} - pk: {} - url: {} - params: {}".format(
            obj_ct, obj_uuid, url, params
        )
    )

    r = requests.get(url, params=params, headers=REQUEST_HEADERS, verify=True)

    try:
        data = r.json()
    except:
        data = []

    return data, r.status_code


def put_remote_vote(obj_ct, obj_uuid, value, user_remote_id):
    """
    put vote to platform rating
    """
    url = "{base_url}/api/v2/rating/rating/{obj_ct}:{obj_uuid}/".format(
        base_url=REMOTE_BASE_URL, obj_ct=obj_ct, obj_uuid=obj_uuid
    )

    log.debug("update vote - ct: {} - uuid: {} - url: {}".format(obj_ct, obj_uuid, url))

    payload = {"vote": value, "impersonate_user_id": user_remote_id}

    r = requests.put(url, headers=REQUEST_HEADERS, json=payload, verify=True)

    try:
        data = r.json()
    except:
        data = None

    return data, r.status_code

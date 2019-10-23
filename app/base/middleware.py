# -*- coding: utf-8 -*-
from django import http
from django.conf import settings
import logging

log = logging.getLogger(__name__)


def remove_slash(path):
    return path[: path.rfind("/")] + path[path.rfind("/") + 1 :]


def remove_query(path):
    return path.split("?", 1)[0]


class AJAXLoaderRedireckMiddleware(object):
    def process_request(self, request):

        if request.current_page:

            path = remove_query(request.get_full_path())

            if path == "/":
                log.debug('request for index "/"')

            else:

                page = request.current_page

                log.debug("path: %s" % path)
                log.debug("ajax: %s" % request.is_ajax())
                log.debug("current_page: %s" % page)
                log.debug("get_absolute_url: %s" % page.get_absolute_url())

                if page and not request.is_ajax():

                    redirect_required = True

                    new_path = "/#%s" % path

                    log.info("new_path: %s" % new_path)

                    if request.toolbar.edit_mode:
                        redirect_required = False

                    if (
                        "cms_toolbar_disabled" in request.session
                        and request.session["cms_toolbar_disabled"]
                    ):
                        redirect_required = True

                    if redirect_required:
                        return http.HttpResponseRedirect(new_path)

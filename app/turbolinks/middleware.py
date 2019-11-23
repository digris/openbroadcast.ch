# -*- coding: utf-8 -*-
from __future__ import unicode_literals

try:
    from django.utils.deprecation import MiddlewareMixin
except ImportError:
    MiddlewareMixin = object


class TurbolinksMiddleware(MiddlewareMixin):
    """
    Send the `Turbolinks-Location` header in response to a visit that was redirected,
    and Turbolinks will replace the browser’s topmost history entry.
    """

    def __init__(self, *args, **kwargs):
        super(TurbolinksMiddleware, self).__init__(*args, **kwargs)

    def process_response(self, request, response):

        is_turbolinks = request.META.get("HTTP_TURBOLINKS_REFERRER")
        is_response_redirect = response.has_header("Location")

        # if is_turbolinks:
        #
        #     if is_response_redirect:
        #         location = response["Location"]
        #         prev_location = request.session.pop(
        #             "_redirect_to", None
        #         )
        #         if prev_location is not None:
        #             # relative subsequent redirect
        #             if location.startswith("."):
        #                 location = prev_location.split("?")[0] + location
        #         request.session["_redirect_to"] = location
        #
        #     else:
        #         if request.session.get("_redirect_to"):
        #             location = request.session.pop("_redirect_to")
        #             response["Turbolinks-Location"] = location

        """
        we have to use cookies for 'caching' as session is deleted during
        login/logout.
        """
        if is_turbolinks:

            if is_response_redirect:
                location = response["Location"]
                prev_location = request.COOKIES.pop("_redirect_to", None)
                if prev_location is not None:
                    # relative subsequent redirect
                    if location.startswith("."):
                        location = prev_location.split("?")[0] + location
                response.set_cookie("_redirect_to", location)

            else:
                if request.COOKIES.get("_redirect_to"):
                    location = request.COOKIES.get("_redirect_to")
                    response.delete_cookie("_redirect_to")
                    response["Turbolinks-Location"] = location

        return response

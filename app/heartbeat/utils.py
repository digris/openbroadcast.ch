from .models import Beat


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def heartbeat_for_request(request):

    if request.user.is_authenticated:
        beat, beat_created = Beat.objects.get_or_create(user=request.user)
    else:
        beat, beat_created = Beat.objects.get_or_create(
            session_key=request.session.session_key
        )

    beat.ip = get_client_ip(request)
    beat.save()

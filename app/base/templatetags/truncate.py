from django import template

register = template.Library()


@register.filter
def truncate_chars(value, max_length):
    if len(value) <= max_length:
        return value

    truncd_val = value[:max_length]
    if value[max_length] != " ":
        rightmost_space = truncd_val.rfind(" ")
        if rightmost_space != -1:
            truncd_val = truncd_val[:rightmost_space]

    return truncd_val + "..."


@register.filter
def truncate_chars_inner(value, max_length):
    try:
        if len(value) - 3 <= max_length:  # suptract the "..."
            return value
    except Exception as e:
        return False

    offset = 0
    if value[0:7] == "http://":
        offset = 7
    if value[0:8] == "https://":
        offset = 8
    offset = 0

    truncd_str = "%s...%s" % (
        value[offset : int(max_length / 2) + offset],
        value[-int(max_length / 2) :],
    )

    return truncd_str


@register.filter
def strip_http(value):

    s = 0
    if value[0:7] == "http://":
        s = 7
    if value[0:8] == "https://":
        s = 8

    e = 0
    if value[-1:] == "/":
        e = -1

    return value[s:e]

import xhtml2pdf.pisa as pisa
import cStringIO as StringIO


def render_html(html):

    result = StringIO.StringIO()
    pdf = pisa.pisaDocument(StringIO.StringIO(html.encode("ISO-8859-1")), result)

    if not pdf.err:
        return result.getvalue()
    else:
        raise Exception("%s" % pdf.err)

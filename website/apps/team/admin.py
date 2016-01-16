from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from easy_thumbnails.files import get_thumbnailer
from hvad.admin import TranslatableAdmin
from models import Profile

THUMBNAIL_OPT = dict(size=(120, 120), crop=True, bw=False, quality=80)


class ProfileAdmin(TranslatableAdmin):

    list_display = ['key_image', 'name', 'email',]
    search_fields = ['name', 'title', 'email']
    save_on_top = True


    def key_image(self, obj):
        if obj.image:
            #return u'<img src="%s" />' % obj.key_image.url
            return u'<img src="%s" />' % (get_thumbnailer(obj.image)
                                                .get_thumbnail(THUMBNAIL_OPT).url)
        else:
            return u'%s<br>%s' % (_('No Image'), obj.name)
    key_image.short_description = _('Image')
    key_image.allow_tags = True

admin.site.register(Profile, ProfileAdmin)
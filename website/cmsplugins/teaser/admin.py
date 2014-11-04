from django.contrib import admin
from models import Teaser,Slide
from django.utils.translation import ugettext as _


class SlideInline(admin.TabularInline):
    model = Teaser.slides.through


class SlideAdmin(admin.ModelAdmin):
    pass





class TeaserAdmin(admin.ModelAdmin):
    inlines = [SlideInline]


admin.site.register(Teaser, TeaserAdmin)
admin.site.register(Slide, SlideAdmin)
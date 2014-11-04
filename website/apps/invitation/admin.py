from django.contrib import admin
from django import forms
from invitation.models import Invitation


class InvitationInline(admin.TabularInline):
    readonly_fields = ['claimed',]
    model = Invitation

class InvitationForm(forms.ModelForm):
    token = forms.CharField(max_length=6, min_length=6, required=False, help_text='Will be generated if empty')
    class Meta:
        model = Invitation


class InvitationAdmin(admin.ModelAdmin):
    form = InvitationForm
    readonly_fields = ['claimed', 'expires',]
    date_hierarchy = 'claimed'

    list_display = ['__unicode__', 'user', 'expires', 'claimed', 'valid']
    list_filter = ['claimed', 'expires']


admin.site.register(Invitation, InvitationAdmin)





from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import Http404, HttpResponseRedirect
from django.http import HttpResponse
from django.views.generic import DetailView, ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from profiles.models import Profile



#PAGINATE_BY = getattr(settings, 'PROFILES_PAGINATE_BY', (12,24,36))
#PAGINATE_BY_DEFAULT = getattr(settings, 'PROFILES_PAGINATE_BY_DEFAULT', 12)



class ProfileDetailView(DetailView):

    context_object_name = "profile"
    model = Profile
    slug = None
    
    def get_object(self, queryset=None):
        return Profile.objects.filter(user__pk=self.request.user.pk)




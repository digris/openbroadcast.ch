from tastypie.resources import ModelResource
from django.contrib.auth import get_user_model

User = get_user_model()

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'auth/user'
        fields = ['username', 'email']
        allowed_methods = ['get']
        filtering = {
            'username': ['icontains', ],
        }
from tastypie.resources import ModelResource
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class UserResource(ModelResource):

    class Meta:

        queryset = User.objects.all()
        resource_name = 'auth/user'
        #fields = ['username', 'email']
        fields = [
            'username',
            'first_name',
            'last_name',
            'remote_uri',
            'profile_uri',
        ]
        allowed_methods = ['get']
        filtering = {
            'username': ['icontains', ],
            'first_name': ['istartswith', ],
            'last_name': ['istartswith', ],
        }

    def build_filters(self, filters=None):

        if filters is None:
            filters = {}

        orm_filters = super(UserResource, self).build_filters(filters)

        if "q" in filters:
            print filters['q']
            query = filters['q']
            qset = (
                    Q(username__icontains=query) |
                    Q(first_name__istartswith=query) |
                    Q(last_name__istartswith=query)
                    )
            orm_filters.update({'custom': qset})

        return orm_filters

    def apply_filters(self, request, applicable_filters):

        if 'custom' in applicable_filters:
            custom = applicable_filters.pop('custom')

        else:
            custom = None

        semi_filtered = super(UserResource, self).apply_filters(request, applicable_filters)

        return semi_filtered.filter(custom) if custom else semi_filtered
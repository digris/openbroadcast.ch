from tastypie.resources import ModelResource
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class UserResource(ModelResource):

    class Meta:

        queryset = User.objects.all()
        resource_name = 'auth/user'
        fields = [
            'username',
            'first_name',
            'last_name',
            'pseudonym',
            'remote_uri',
            'profile_uri',
        ]
        allowed_methods = ['get']
        filtering = {
            'username': ['istartswith', ],
            'first_name': ['istartswith', ],
            'last_name': ['istartswith', ],
            'pseudonym': ['istartswith', ],
        }

    def dehydrate(self, bundle):

        bundle.data['display_name'] = bundle.obj.get_display_name()

        return bundle


    def build_filters(self, filters=None):

        if filters is None:
            filters = {}

        orm_filters = super(UserResource, self).build_filters(filters)

        if "q" in filters:
            query = filters['q']
            qset = (
                    Q(username__istartswith=query) |
                    Q(first_name__istartswith=query) |
                    Q(last_name__istartswith=query) |
                    Q(pseudonym__istartswith=query)
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
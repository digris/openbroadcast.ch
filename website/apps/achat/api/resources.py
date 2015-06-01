from django.contrib.auth import get_user_model
from tastypie.resources import ModelResource
from tastypie.authentication import SessionAuthentication, Authentication, MultiAuthentication
from tastypie.authorization import Authorization
from achat.models import Message, MentionedUser
from achat.util import parse_text, extract_mentioned_users, message_to_html

User = get_user_model()

class MessageResource(ModelResource):

    class Meta:
        queryset = Message.objects.all()
        resource_name = 'chat/message'
        detail_allowed_methods = ['get',]
        list_allowed_methods = ['get', 'post']
        include_resource_uri = False
        authentication = MultiAuthentication(SessionAuthentication(), Authentication())
        authorization = Authorization()
        excludes = ['id', 'rendered_text',]

    def obj_create(self, bundle, **kwargs):
        print 'obj_create MessageResource'

        html_text = bundle.data['text']
        parsed_text = parse_text(html_text)
        bundle.data['text'] = parsed_text

        # creation needed here to get pk for assignment
        bundle = super(MessageResource, self).obj_create(bundle, user=bundle.request.user)


        mentioned_users = extract_mentioned_users(html_text)
        for user in mentioned_users:
            MentionedUser.objects.get_or_create(user=user, message=bundle.obj)

        # TODO: ugly!
        bundle.obj.emit_message()

        return bundle



    def hydrate(self, bundle):
        # strip & parse text
        #bundle.data['text'] = parse_text(bundle.data['text'])
        return bundle

    def dehydrate(self, bundle):

        bundle.data['options'] = bundle.obj.options if bundle.obj.options else {}

        bundle.data['text'] = bundle.obj.html

        bundle.data['user'] = {
            'username': bundle.obj.user.username,
            'name': bundle.obj.user.get_full_name(),
            'profile_uri': bundle.obj.user.profile_uri,
            #'id': bundle.obj.user.pk,
        }

        # temporary, dehydrate mentions

        mentions = [{
                        'username': mention.user.username,
                        'name': mention.user.get_full_name(),
                        'profile_uri': mention.user.profile_uri,
                    } for mention in bundle.obj.mentioned_users.all()]

        bundle.data['mentions'] = mentions


        # temporary, should be done on creation!
        # bundle.data['text'] = parse_text(bundle.data['text'])

        return bundle

    def get_object_list(self, request):
        return super(MessageResource, self).get_object_list(request).order_by('-created').all()


from django.conf.urls import url, patterns


urlpatterns = patterns('',
    url(r'^login/$', 'ajaxlogin.views.ajax_login', name='auth_login_ajax'),
    url(r'^register/$', 'ajaxlogin.views.ajax_registration', name='auth_register_ajax'),
)
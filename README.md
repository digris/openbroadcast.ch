# Open Broadcast - Radio Website


### Docker

#### build image

    docker build -t ch-openbroadcast:latest .


#### load image to dokku

    docker save ch-openbroadcast:latest | ssh root@68.183.15.228 "docker load"
    
    # on dokku host
    docker tag ch-openbroadcast:latest dokku/ch-openbroadcast:latest
    dokku tags:deploy ch-openbroadcast latest


### dokku settings

dokku config:set --no-restart ch-openbroadcast \
    SITE_ID=1 \
    CMS_CACHE_PREFIX=cms_ch_openbroadcast_ \
    DEBUG=True \
    DJANGO_MANAGE_COLLECTSTATIC=on \
    GANALYTICS_TRACKING_CODE=UA-xxxxxx-X

dokku config:set --no-restart ch-openbroadcast \
    SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=902566650308-cj6dipb2kcb3b7sl32ms36esousrjr0q.apps.googleusercontent.com \
    SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=Rf4Um7pgjnIcSu0mB_bAICek \
    SOCIAL_AUTH_FACEBOOK_KEY=746436298732388 \
    SOCIAL_AUTH_FACEBOOK_SECRET=47f8e5a7e926521a78bb13fce12d89bc \
    REMOTE_API_AUTH_USER=remote \
    REMOTE_API_AUTH_KEY=d65b075c593f27a42c26e65be74c047e5b50d215


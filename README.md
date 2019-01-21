# Open Broadcast - Radio Website


### Docker

#### build image

    docker build -t ch-openbroadcast:latest .


#### load image to dokku

    docker save ch-openbroadcast:latest | ssh root@68.183.15.228 "docker load"
    
    # on dokku host
    docker tag ch-openbroadcast:latest dokku/ch-openbroadcast:latest
    dokku tags:deploy ch-openbroadcast latest


### dokku app

    dokku apps:create ch-openbroadcast
    dokku postgres:create ch-openbroadcast
    dokku postgres:link ch-openbroadcast ch-openbroadcast
    dokku redis:create ch-openbroadcast 
    dokku redis:link ch-openbroadcast ch-openbroadcast

    # initial config
    dokku config:set --no-restart ch-openbroadcast DJANGO_MANAGE_MIGRATE=on
    dokku config:set --no-restart ch-openbroadcast DJANGO_MANAGE_COLLECTSTATIC=on

    # storage
    mkdir /data/openbroadcast.ch
    chown -R dokku:dokku /data/openbroadcast.ch
    dokku storage:mount ch-openbroadcast /data/openbroadcast.ch:/data/openbroadcast.ch
    
    dokku ps:scale ch-openbroadcast web=1 worker=1


### dokku settings

dokku config:set --no-restart ch-openbroadcast \
    SITE_ID=1 \
    CMS_CACHE_PREFIX=cms_ch_openbroadcast_ \
    DEBUG=True \
    DJANGO_MANAGE_COLLECTSTATIC=on \
    GANALYTICS_TRACKING_CODE=UA-xxxxxx-X



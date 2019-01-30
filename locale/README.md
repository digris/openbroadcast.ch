
    UPDATE cms_page SET languages='de' WHERE languages='de-ch';
    UPDATE cms_title SET language='de' WHERE language='de-ch';
    UPDATE menus_cachekey SET language='de' WHERE language='de-ch';
    UPDATE cms_cmsplugin SET language='de' WHERE language='de-ch';
    
    
    ./manage.py makemessages \
        --ignore="app/cmsplugin_youtube/*" \
        --ignore="app/contentproxy/*" \
        --ignore="app/heartbeat/*" \
        -d django \
        -l de

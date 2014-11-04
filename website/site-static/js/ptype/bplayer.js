//var lb = new LevelBridge();
//lb.init();


bplayer = new BPlayerApp();
bplayer.mode = 'inline';
bplayer.static_url = '{{ STATIC_URL }}';

setTimeout(function () {
    bplayer.init();
}, 200)




// chat
var achat = new AchatApp();
setTimeout(function () {
    achat.container = $('#achat_container');
    achat.init();
    achat.dummy();
}, 1000)
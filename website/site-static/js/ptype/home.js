//var lb = new LevelBridge();
//lb.init();



$(function(){

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
        achat.username = settings.username;
        achat.init();
        //achat.dummy();
        achat.load();
    }, 1000)

    onair = new OnAirApp();
    onair.init();


    setTimeout(function(){


            var socket = io.connect('http://127.0.0.1:8088/');
            socket.on('push', function (data, channel) {

                if(channel == 'levelbridge_achat') {
                    console.log(data, channel);
                    achat.push_message(data);
                };

            });
    }, 500);


});














// load playing data
var data = {

}
//.html(nj.render('bplayer/nj/waveform.html', { object: data }));



//$('.info-container .current').addClass('flipped')








































// dummy implementation to switch items


/*
$('#media_prev_next').on('click', 'a', function(e){
    e.preventDefault();

    var direction = $(this).data('direction');



    $('.info-container .items .item').each(function(i, el){
        var el = $(this);

        if(el.hasClass('next-1')) {

            if(direction == 'previous') {
                el.removeClass('next-1').addClass('next-2');
            }
            if(direction == 'next') {
                el.removeClass('next next-2').addClass('current');
            }
            return;
        }

        if(el.hasClass('current')) {
            if(direction == 'previous') {
                el.removeClass('current').addClass('next next-1');
            }
            if(direction == 'next') {
                el.removeClass('current').addClass('previous previous-1');
            }
            return;
        }

        if(el.hasClass('previous-1')) {

            if(direction == 'previous') {
                el.removeClass('previous previous-1').addClass('current');
            }
            if(direction == 'next') {
                el.removeClass('previous-1').addClass('previous previous-2');
            }
            return;


        }

        if(el.hasClass('previous-2')) {

            if(direction == 'previous') {
                el.removeClass('previous-2').addClass('previous-1');
            }
            if(direction == 'next') {
                el.removeClass('previous-2').addClass('previous-x');
            }
            return;
        }

    });


});

*/




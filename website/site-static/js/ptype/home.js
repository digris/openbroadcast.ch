//var lb = new LevelBridge();
//lb.init();



$(function(){

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


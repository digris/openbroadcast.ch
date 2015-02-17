var LevelBridge = function () {

    var self = this;

    //this.socket_url = 'http://172.20.10.201:8088/'
    this.socket_url = 'http://127.0.0.1:8088/'
    this.socket;
    this.debug = false;
    this.subscriptions = [];

    this.container = $('#levelbridge  ul');
    this.icon_container = $('#levelbridge_icon  ul');

    this.counter = 0;

    this.init = function () {
        console.log('LevelBridge - init');
        setTimeout(function () {
            //self.connect()
        }, 100);

        pushy_client.subscribe('level', function(data){
            if (data.peak != undefined) {
                self.draw(data.peak);
                self.draw_icon(data.peak);
            }
        });



    };

    this.connect = function () {

        console.log('LevelBridge - connect');

        try {

            self.socket = io.connect(self.socket_url);
            self.socket.on('push', function (data) {

                if (self.debug) {
                    console.log('PushyApp - push:', data);
                }

                if (data.peak != undefined) {
                    if (self.debug) {
                        console.log(data.peak);
                    }
                    self.draw(data.peak);
                    self.draw_icon(data.peak);
                }

            });

        } catch (err) {
            //alert('Unable to connect to socket-server');
            console.warn(err.message);
        }
    };

    this.draw = function(level) {

        var max_element = 410;
        var num_element = $('li', self.container).length;

        var height = Number(level * 0.4);


        if(level < 90) {
            var html = '<li style="height: ' + height + 'px; opacity:' + (level / 80 + 0.1).toFixed(2) + ';"></li>'
        } else {
            var html = '<li style="height: ' + height + 'px;"></li>'
        }


        if($('#bplayer_container').hasClass('playing')) {
            self.container.prepend(html)
        }

        // pop elements
        if(num_element > max_element) {
            $('li', self.container).last().remove()
        }

    };

    this.draw_icon = function(level) {

        var max_element = 7;
        var num_element = $('li', self.icon_container).length;

        var html = '<li><span style="height: ' + level + '%;"></span></li>'


        if(self.counter % 2 == 0) {
            if($('#bplayer_container').hasClass('playing')) {
                self.icon_container.prepend(html)
            }
        }
        self.counter++;

        // pop elements
        if(num_element > max_element) {
            $('li', self.icon_container).last().remove()
        }

    };



};


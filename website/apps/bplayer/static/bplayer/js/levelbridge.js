var LevelBridge = function () {

    var self = this;

    //this.socket_url = 'http://172.20.10.201:8088/'
    this.socket_url = 'http://127.0.0.1:8181/'
    this.socket;
    this.debug = true;
    this.subscriptions = [];

    this.container = $('#levelbridge  ul');
    this.icon_container = $('#levelbridge_icon  ul');

    this.counter = 0;

    this.init = function () {

        console.log('LevelBridge - init');

        pushy_client.subscribe('level', function(data){

            if (data.peak != undefined && $('body').hasClass('playing')) {
                self.draw(data.peak);
                self.draw_icon(data.peak);

            }
        });



    };



    this.draw = function(level) {


        var container = $('.item.onair .level');
        var max_element = 120;
        var num_element = $('li', container).length;

        var height = Number(level * 0.4);

        /*
        if(level < 90) {
            var html = '<li style="height: ' + height + 'px; opacity:' + (level / 80 + 0.1).toFixed(2) + ';"></li>'
        } else {
            var html = '<li style="height: ' + height + 'px;"></li>'
        }
        */

        var html = '<li style="height: ' + height + 'px;"></li>'

        container.prepend(html)

        // pop elements
        if(num_element > max_element) {
            $('li', container).last().remove()
        }

    };

    this.draw_icon = function(level) {

        var container = $('#levelbridge_icon  ul');
        var max_element = 7;
        var num_element = $('li', container).length;

        var html = '<li><span style="height: ' + level + '%;"></span></li>'

        container.prepend(html)

        // pop elements
        if(num_element > max_element) {
            $('li', container).last().remove()
        }

    };



};


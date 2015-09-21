;
StationTimeApp = function () {

    var self = this;
    this.debug = false;
    this.container;
    this.api_url;
    this.current_time;
    this.interval = false;
    this.interval_duration = 1000;
    this.resync_interval_duration = 120000;

    this.init = function () {

        if(self.debug) {
            console.debug('StationTimeApp: init');
        }

        self.sync_time();

        // re-sync time from time to time :)
        setInterval(function(){
            self.sync_time();
        }, self.resync_interval_duration);

        self.bindings();

    };

    this.bindings = function() {

        // TODO: hakish implementation - show logo on station-time hover

        self.container.on('mouseover', '.wrapper', function(){

            if(self.debug) {
                console.debug('StationTimeApp: mouseover');
            }


            if ($('#onair_container').hasClass('onair')) {
                //$('.switch-panel.offline').fadeIn(500);
                //$('.switch-panel.online').fadeOut(500);
                $('.switch-panel.offline').css('opacity', 1.0);
                $('.switch-panel.online').css('opacity', 0.0);
                $('.switch-panel.offline .controls').hide();
            }

            //$('.logo-container', self.container).fadeIn(500);
        })
        self.container.on('mouseout', '.wrapper', function(){

            if(self.debug) {
                console.debug('StationTimeApp: mouseout');
            }

            if ($('#onair_container').hasClass('onair')) {
                $('.switch-panel.offline').css('opacity', 0.0);
                $('.switch-panel.online').css('opacity', 1.0);
                $('.switch-panel.offline .controls').show();
            } else {
                $('.switch-panel.offline').css('opacity', 1.0);
                $('.switch-panel.online').css('opacity', 0.0);
                $('.switch-panel.offline .controls').show();
            }


            //$('.logo-container', self.container).fadeOut(500);
        }, 100);
    };


    this.sync_time = function() {
        $.get(self.api_url, function(data){
            self.run_clock(data.time);
        });
    };

    this.run_clock = function(time) {

        if(self.debug) {
            console.debug('StationTimeApp: run_clock', time);
        }

        if(time != undefined) {
            self.current_time = new Date(time); // '2014-01-01 10:11:55'
            self.current_time = self.tz_offset(self.current_time);
            self.display_clock();
        }

        if(!self.interval) {
            self.interval = setInterval(function() {

                self.current_time = new Date(self.current_time.getTime() + self.interval_duration);
                self.display_clock();

            }, self.interval_duration);
        }

    };

    this.tz_offset = function(date) {

        var offset = date.getTimezoneOffset();
        date.setTime( date.getTime() + (offset * 60 * 1000));

        return date;
    };

    this.display_clock = function() {

        var time_string = [
            self.pad(self.current_time.getHours()),
            self.pad(self.current_time.getMinutes()),
            self.pad(self.current_time.getSeconds())
        ].join(':');

        $('input', self.container).val(time_string);
    };

    this.pad = function(n) {
        return (n < 10) ? ('0' + n) : n;
    }

};


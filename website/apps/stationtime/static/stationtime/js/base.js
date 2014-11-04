;
StationTimeApp = function () {

    var self = this;
    this.container;
    this.api_url;
    this.current_time;
    this.interval = false;
    this.interval_duration = 1000;
    this.resync_interval_duration = 60000;

    this.init = function () {

        debug.debug('StationTimeApp: init');

        self.sync_time();

        // re-sync time from time to time :)
        setInterval(function(){
            self.sync_time();
        }, self.resync_interval_duration);

    };

    this.sync_time = function() {
        $.get(self.api_url, function(data){
            self.run_clock(data.time);
        });
    };

    this.run_clock = function(time) {

        if(time != undefined) {
            self.current_time = new Date(time); // '2014-01-01 10:11:55'
            self.display_clock();
        };

        if(!self.interval) {
            self.interval = setInterval(function() {

                self.current_time = new Date(self.current_time.getTime() + self.interval_duration);
                self.display_clock();

            }, self.interval_duration);
        };

    };

    this.display_clock = function() {

        var time_string = [
            self.pad(self.current_time.getHours()),
            self.pad(self.current_time.getMinutes()),
            self.pad(self.current_time.getSeconds())
        ].join(':')

        self.container.html('<span>' + time_string + '</span>');
    };

    this.pad = function(n) {
        return (n < 10) ? ("0" + n) : n;
    }

};


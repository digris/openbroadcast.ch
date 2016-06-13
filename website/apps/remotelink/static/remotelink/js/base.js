;
var RemotelinkApp = function () {

    var self = this;
    this.debug = false;
    this.dialog_url = false;
    this.user = false;
    this.current_url;
    this.reveal_container = $('#reveal_container');

    this.init = function () {
        if (self.debug) {
            console.log('RemotelinkApp - init');
        }
        self.bindings();
    };

    this.bindings = function() {

        $(document).on('click', 'a[target="_blank"]', function(e){
            e.preventDefault();

            self.current_url = $(this).attr('href');

            if(Cookies.get('remotelink-ignore') == 1) {
                window.open(self.current_url);
            } else {
                self.show_dialog(self.dialog_url);
            }


        });

        // action handling
        self.reveal_container.on('click', '[data-remotelink-ignore]', function(e){
            e.preventDefault();
            Cookies.set('remotelink-ignore', 1);
            //self.set_cookie('remotelink-ignore', true);
            self.hide_dialog();
            window.open(self.current_url);
        });
        self.reveal_container.on('click', '[data-remotelink-cancel]', function(e){
            e.preventDefault();
            self.hide_dialog();
        });


    };

    
    this.hide_dialog = function() {
        self.reveal_container.foundation('reveal', 'close');
    };

    this.show_dialog = function(uri) {
        self.hide_dialog();
        self.reveal_container.foundation('reveal', 'open', {
            url: uri,
            type: 'GET',
            success: function(data) {
                // pass
            },
            error: function() {
                alert('error processing request');
            }
        });
    };

};

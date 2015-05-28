;
var AloginApp = function () {

    var self = this;
    this.debug = true;
    this.login_url;
    this.user = false;
    this.reveal_container = $('#reveal_container');

    this.init = function () {
        self.bindings();
    };

    this.bindings = function () {

        // login actions
        $('body').on('click', 'a[data-alogin-action]', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = $(this).data('alogin-action');
            var uri = $(this).attr('href');

            switch(action) {
                case 'login':
                    self.dialog_response(uri);
                    break;

                case 'register':
                    self.dialog_response(uri);
                    break;

                case 'logout':
                    self.silent_response(uri);
                    break;

                default:
                    self.dialog_response(uri);

            }

        });

        // form handling
        self.reveal_container.on('submit', 'form', function(e){
            e.preventDefault();

            var form = $(this);
            var form_action = form.attr('action');
            var data = form.serialize();
            self.dialog_response(form_action, data);

        });



        // auth-required elements
        // present login-dialog on click
        $('body').on('click', '[data-login-required]', function(e){

            if(!self.user || self.user == undefined) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                self.dialog_response(self.login_url);
            }
        });

    };


    this.set_authentication_state = function (user) {

        console.log('set_authentication_state', user);

        var user = typeof data != undefined ? user : false;
        self.user = user;
        if(self.debug) {
            console.debug('AloginApp - set_authentication_state', self.user)
        }
        if(!self.user) {
            $('html').removeClass('is-authenticated')
        } else {
            $('html').addClass('is-authenticated')
        }

        $(document).trigger('alogin', ['auth-state-change', self.user]);
    };


    this.dialog_response = function (uri, data) {

        var data = typeof data !== 'undefined' ? data : false;
        var request_type;

        if(data) {
            request_type = 'POST';
        } else {
            request_type = 'GET';
        }

        self.reveal_container.foundation('reveal', 'close');
        self.reveal_container.foundation('reveal', 'open', {
            url: uri,
            type: request_type,
            data: data,
            success: function(data) {
                // not soo nice. in case of successfull login/registration we get back a json object
                // else html, to re-display the form with eventual errors.
                if (data instanceof Object == true) {
                    if(data.success) {
                        self.set_authentication_state(data.user);
                        setTimeout(function(){
                            self.reveal_container.foundation('reveal', 'close');
                        }, 1)
                    }
                }
            },
            error: function() {
                alert('error processing request');
            }
        });

    };

    this.silent_response = function (uri, data) {

        var data = typeof data !== 'undefined' ? data : false;
        var request_type;

        if(data) {
            request_type = 'POST';
        } else {
            request_type = 'GET';
        }

        $.ajax({
            url: uri,
            type: request_type,
            data: data,
            success: function(data) {
                if(data.success) {
                    self.set_authentication_state(data.user);
                    //$.address.value(next_url);
                }
            },
            error: function() {
                alert('error processing request');
            }
        });

    };

};

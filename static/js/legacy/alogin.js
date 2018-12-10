;
var AloginApp = function () {

    var self = this;
    this.debug = true;
    this.login_url;
    this.user = false;

    this.init = function () {
        self.bindings();
    };

    this.bindings = function () {

        // login actions
        $(document).on('click', 'a[data-alogin-action]', function (e) {
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
        $(document).on('submit', '#reveal_container form', function(e){
            e.preventDefault();

            var form = $(this);
            var form_action = form.attr('action');
            var data = form.serialize();
            self.dialog_response(form_action, data);

        });



        // auth-required elements
        // present login-dialog on click
        $(document).on('click', '[data-login-required]', function(e){

            if(!self.user || self.user == undefined) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                self.dialog_response(self.login_url);
            }
        });

    };


    this.set_authentication_state = function (user) {

        user = typeof data != undefined ? user : false;

        if(self.debug) {
            console.log('set_authentication_state', user);
        }

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

        if(self.debug) {
            console.debug('AloginApp - dialog_response', uri, data)
        }


        data = typeof data !== 'undefined' ? data : false;
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
                if (data instanceof Object == true) {
                    if(data.success) {
                        self.set_authentication_state(data.user);
                        setTimeout(function(){
                            try {
                                $('#reveal_container').foundation('close');
                            } catch(e) {

                            }
                        }, 1)
                    }
                } else {
                    try {
                        $('#reveal_container').foundation('close');
                    } catch(e) {

                    }
                    $('#reveal_container').html(data).foundation('open');
                }

            },
            error: function() {
                alert('error processing request');
                try {
                    $('#reveal_container').foundation('close');
                } catch(e) {

                }
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
                }
            },
            error: function() {
                alert('error processing request');
                $('#reveal_container').foundation('close');
            }
        });

    };

};


module.exports = AloginApp;

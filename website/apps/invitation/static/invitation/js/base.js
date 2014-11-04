/***************************************************************
 * invitation handling
 ***************************************************************/

var InvitationApp = function () {
    var self = this;
    this.api_url;
    this.container;
    this.token_status = 0; // 0: unknown, 1: valid, 99: error
    this.claim_url;
    this.message;

    this.init = function () {
        self.container.show();
        self.bindings();

        // check for token in url
        if(window.location.hash) {
            var url = window.location.hash;
            var hash = url.substring(url.indexOf('#')+1).split('-');
            if(hash.length == 3) {
                $(hash).each(function (i, val){
                    $('#split_token input[data-token=' + i + ']', self.container).val(val)
                });
                self.parse_token();

            }

        } else {
          // Fragment doesn't exist
        }

    };

    this.bindings = function () {

        // form input
        $('#split_token', self.container).on('input', 'input[type=text]', function () {

            if ($(this).val().length == $(this).attr('maxlength')) {

                // handle auto-tab
                var token_id = $(this).data('token');
                if (token_id < 2) {
                    $('#split_token input[data-token=' + (token_id + 1) + ']', self.container).focus();
                }
            }
            // handle token
            self.parse_token();
        });

        // form submit
       self.container.on('submit', 'form', function (e) {
            e.preventDefault();
            if(self.claim_url) {
                // redirect to claim-page
                document.location = self.claim_url;
            };
        });

    };

    this.parse_token = function () {

        var token = '';
        $('#split_token input[type=text]', self.container).each(function (i, el) {
            token += $(el).val();
        });

        if (token.length == 6) {
            self.check_token(token);
        } else {
            self.token_status = 0;
            self.update_display();
        }
    };

    this.check_token = function (token) {

        $.ajax({
            type: "POST",
            url: self.api_url,
            data: JSON.stringify({'token': token}),
            async: true,
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {

                if (data.valid) {
                    self.token_status = 1;
                    self.claim_url = data.claim_url;
                    self.message = data.message;
                } else {
                    self.token_status = 99;
                    self.claim_url = false;
                    self.message = data.message;
                }
                self.update_display();

            },
            error: function (xhr, status, e) {
                self.token_status = 99;
                self.claim_url = false;
                self.message = e;
                self.update_display();
            }
        });

    };


    this.update_display = function () {

        self.container.removeClass('token-error token-valid');

        $('.message', self.container).hide();
        $('.message p', self.container).html(self.message);
        $('button', self.container).prop('disabled', true);



        if (self.token_status == 1) {
            self.container.addClass('token-valid');
            $('button', self.container).prop('disabled', false);
            $('button[type=submit]', self.container).focus();

            setTimeout(function(){
                //document.location = self.claim_url;
            }, 1000)


        }

        if (self.token_status == 99) {
            self.container.addClass('token-error');
            $('.message', self.container).show();
        }


    };
};


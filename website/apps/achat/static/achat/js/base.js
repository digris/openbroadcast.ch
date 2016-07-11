;
AchatApp = function () {

    var self = this;
    this.debug = false;
    this.container;
    this.user;
    this.messages_container;
    this.warning_container;
    this.max_messages = 24;
    this.static_url;
    this.base_url;

    this.packery_container;

    this.init = function () {

        if(self.debug) {
            console.debug('AchatApp: init');
        }
        self.messages_container = $('.messages-container', self.container);
        self.warning_container = $('.warning-container', self.container);
        self.bindings();

        pushy_client.subscribe('achat', function(message){
            self.add_message(message);
        });
        
        self.packery_container = $('.messages-container');
        self.packery_container.packery({
                itemSelector: '.item.message',
                gutter: 0,
                transitionDuration: 0
        });

    };

    this.bindings = function () {

        self.container.on('click', 'a[data-action="submit"]', function (e) {
            e.preventDefault();
            // don't act on 'span' click (used to toggle dropdown)
            if(! $(e.toElement).is('span')) {
                var options = {
                    extra: $(this).data('message_extra') || false
                };
                self.create_message($('.chat-message', self.container).html(), options)
            }
        });


        self.container.on('submit', 'form', function (e) {

            e.preventDefault();
            self.create_message($('.chat-message', self.container).html())

        });

        self.container.on('keydown', '.chat-message > p', function (e) {

            if(!$('ul.dropdown-menu').is(":visible")) {
                if (e.keyCode === 13 && !e.shiftKey) {
                        e.preventDefault();
                        $('form', self.container).submit();
                        return false;
                }
            }

        });

        // clean pasted in content-editable
        self.container.on('paste', '.chat-message > p', function (e) {
            var el = $(this)
            setTimeout(function(){
                el.html(el.text())
            }, 1)

        });

        // show all text in case that truncated
        self.messages_container.on('click', 'a.show-full-text', function(e){
            e.preventDefault();
            var message_body = $(this).parents('.body');
            $('.truncated', message_body).toggleClass('hide');
            $('.full', message_body).toggleClass('hide');

            // TODO: hakish - layout needs reflow

            self.packery_container.packery('reloadItems');
            self.packery_container.packery();

        });

        self.container.on('focus', '.chat-message > p', function (e) {
            $(this).parents('form').addClass('focus');
        });
        self.container.on('blur', '.chat-message > p', function (e) {
            $(this).parents('form').removeClass('focus');
        });

        // user login/logout handling ?
        // update user data on auth changes
        $(document).on('alogin', function(e, type, user){
            if(type == 'auth-state-change') {
                if(user != undefined) {
                    self.user = user;
                    // reload chat messages
                    self.messages_container.html('')
                    self.load();
                }
            }
        });

        // TODO: check if good implementation...
        $('span.timestamp', self.messages_container).timeago();

        // message input lookup strategies
        var strategies = [
            // user 'mention' strategy
            // matches @ + min. 2 chars
            {
                match: /(^|\s)@(\w{2,})$/,
                search: function (term, callback) {
                    //callback(cache[term], true);
                    var data = {
                        q: term
                    };
                    $.getJSON('/api/v1/auth/user/', data)
                        .done(function (resp) {
                            callback(resp.objects);
                        })
                        .fail(function () {
                            callback([]);
                        });
                },
                template: function (value) {

                    var html = '<div class="row collapse">';
                    html += '<div class="column display-name">' + value.display_name + '</div>';
                    html += '<div class="column username">' + value.username + '</div>';
                    html += '</div>';
                    return html;

                },
                replace: function (value) {
                    //return '$1' + '@' + value.username + ' ';
                    return '$1<span data-ct="user">' + '@' + value.username + '</span> ';
                },
                cache: true
            }
        ];

        // textcomplete options
        // https://github.com/yuku-t/jquery-textcomplete
        var option = {
            appendTo: $('body')
        };

        // bind auto-complete / object linking
        try {
            $('#chat_input', self.container).textcomplete(strategies, option);
        } catch(e) {

        }
        

    };

    this.load = function () {
        var url = '/api/v1/chat/message/' + '?limit=' + self.max_messages;
        $.get(url, function (data) {
            $.each(data.objects.reverse(), function (i, message) {
                self.add_message(message);
            });

            self.packery_container.packery('reloadItems');
            self.packery_container.packery();

        });

    };

    // add messages to the container
    // called from load & push callbacks
    this.add_message = function (message) {

        if(self.debug) {
            console.debug('AchatApp: add_message', message);
        }


        // fix some values
        //message.created = message.created.substr(11, 8);
        if (self.user && message.user.username == self.user.username) {
            message.user.is_me = true;
        }

        if (message.options && message.options.extra ) {
            message.extra_classes = message.options.extra
        }

        var html = $(nj.render('achat/nj/message.html', {message: message}));
        setTimeout(function () {
            html.removeClass('new');
        }, 100);

        self.messages_container.prepend(html);
        self.messages_container.find('.item.message:gt(' + self.max_messages + ')').remove()


        // 'dynamic' timestamps
        $('span.timestamp', self.messages_container).timeago('updateFromDOM');


        var dom_el = $(html);

        // check if user mentioned in message
        // console.log('current user', self.user)
        // console.log('mentioned users', message.mentions)

        if(self.user) {
            var is_mentioned = false;
            var username = self.user.username;
            $.each(message.mentions, function(i, item){
                if(item.username == username) {
                    is_mentioned = true;
                }
            });
            if(is_mentioned) {
                dom_el.addClass('mentioned')
            }
        }

        self.message_bindings(dom_el);

        self.packery_container.packery('reloadItems');
        self.packery_container.packery();

    };


    this.message_bindings = function(el) {

        $('a', el).each( function(i, item){
            var uri = $(item).data('profile_uri');
            if(uri) {
                $(item).tipso({
                    delay: 50,
                    speed: 100,
                    width: 450,
                    position: 'bottom',
                    background: '#000',
                    color: '#ffffff',
                    useTitle: false,
                    content : function(inner) {
                        var inner = $(this);
                        $.get(uri, function(profile){
                            inner.html(nj.render('achat/nj/profile.html', {
                                object: profile,
                                base_url: self.base_url
                            }))
                        })
                    }
                });
            }
        })

    };


    this.create_message = function (text, options) {

        if ($(text).html().length > 2) {

            var data = JSON.stringify({
                "text": $(text).html(),
                "options": options
            });

            $.ajax({
                url: '/api/v1/chat/message/',
                type: 'POST',
                contentType: 'application/json',
                data: data,
                dataType: 'json',
                processData: false
            }).always(function(response){

                if(response.status >= 300) {
                    var text = response.responseText;
                    var status = response.status;
                    self.show_warning(status, text)
                } else {
                    self.hide_warning()
                }
            });

        }
        $('.chat-message > p', self.container).html('')


    };


    this.show_warning = function(status, text) {
        self.warning_container.html(text);
    };

    this.hide_warning = function() {
        self.warning_container.html('');
    };



    this.create_dummy_message = function(){

        var data = JSON.stringify({
            "text":"hallo <span data-ct=\"user\">@peter001</span>&nbsp;und 123<span></span><span></span><span></span>",
            "options":{"extra":false}
        });

        $.ajax({
            url: '/api/v1/chat/message/',
            type: 'POST',
            contentType: 'application/json',
            data: data,
            dataType: 'json',
            processData: false
        })

    }

};


;
AchatApp = function () {

    var self = this;
    this.container;
    this.username;
    this.messages_container;
    this.max_messages = 12;

    this.init = function () {

        debug.debug('AchatApp: init');
        self.messages_container = $('.messages-container', self.container);
        self.bindings();

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


        self.container.on('keyup', '.chat-message > p', function (e) {

            e = e || event;
            if (e.keyCode === 13 && !e.shiftKey) {

                console.log(e);


                $('form', self.container).submit();

                e.preventDefault();
                //self.create_message($(this).val())
                return false;
            }
            return true;


        });

        self.container.on('focus', '.chat-message > p', function (e) {
            $(this).parents('form').addClass('focus');
        });
        self.container.on('blur', '.chat-message > p', function (e) {
            $(this).parents('form').removeClass('focus');
        });


        var strategies = [
            { // mention strategy
                match: /(^|\s)@(\w*)$/,
                search: function (term, callback) {
                    //callback(cache[term], true);
                    $.getJSON('/api/v1/auth/user/', { username__icontains: term })
                        .done(function (resp) {
                            //console.log(resp.objects)
                            callback(resp.objects);
                        })
                        .fail(function () {
                            callback([]);
                        });
                },
                template: function (value) {

                    return value.username + ' | ' + value.email;
                },
                replace: function (value) {
                    console.log(value)
                    //return '$1<a href="#">' + value.username + '</a>   ';
                    return '$1<span data-ct="user">' + '@' + value.username + '</span>   ';
                    //return '$1@:' + value.username + ': ';
                },
                cache: true
            },
            { // mention strategy
                match: /(^|\s)#(\w*)$/,
                search: function (term, callback) {
                    //callback(cache[term], true);
                    $.getJSON('/lsearch', { q: term })
                        .done(function (resp) {
                            console.log(resp)
                            callback(resp.objects);
                        })
                        .fail(function () {
                            callback([]);
                        });
                },
                replace: function (value) {
                    return '$1@' + value + ' ';
                },
                cache: true
            },
        ]
        var option = {
            appendTo: $('body')
        };


        $('#chat_input', self.container).textcomplete(strategies, option);


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
            })

        }
        $('.chat-message > p', self.container).html('')


    };

    this.load = function () {
        var url = '/api/v1/chat/message/' + '?limit=' + self.max_messages;
        $.get(url, function (data) {
            $.each(data.objects.reverse(), function (i, message) {
                self.add_message(message);
            });
        });

    };

    this.push_message = function (message) {
        self.add_message(message);
    };

    this.dummy = function () {

        var num_words = (Math.floor(Math.random() * (20 - 2 + 1)) + 2) * (Math.floor(Math.random() * (4 - 1 + 1)) + 1)
        var lorem = new Lorem;
        lorem.type = Lorem.TEXT;
        lorem.query = num_words + 'w';

        var message = {
            text: lorem.createLorem(),
            user: {
                username: 'Peter',
                'is_me': false
            }
        }

        self.add_message(message);

        var rand = Math.round(Math.random() * (60000 - 10000) + 10000);
        setTimeout(function () {
            self.dummy()
        }, rand);
    };


    this.add_message = function (message) {
        debug.debug('AchatApp: add_message', message);

        // fix some values
        message.created = message.created.substr(11, 8);
        if (message.user.username == self.username) {
            message.user.is_me = true;
        }
        if (message.options && message.options.extra ) {
            message.extra_classes = message.options.extra
        }

        var html = $(nj.render('achat/nj/message.html', {message: message}));
        setTimeout(function () {
            html.removeClass('new');
        }, 100)

        self.messages_container.prepend(html);
        self.messages_container.find('.item.message:gt(' + self.max_messages + ')').remove()

    };

};


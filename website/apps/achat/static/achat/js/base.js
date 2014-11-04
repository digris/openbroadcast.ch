;
AchatApp = function () {

    var self = this;
    this.container;
    this.messages_container;

    this.init = function () {

        debug.debug('AchatApp: init');
        self.messages_container = $('.messages-container', self.container);
        self.bindings();

    };

    this.bindings = function () {


        /**/
         self.container.on('click', 'a[data-action="submit"]', function (e) {

         e.preventDefault();
         self.create_message($('.chat-message', self.container).val())

         });


         self.container.on('submit', 'form', function (e) {

         e.preventDefault();
         self.create_message($('.chat-message', self.container).val())

         });


         self.container.on('keyup', 'textarea', function (e) {

         e = e || event;
         if (e.keyCode === 13 && !e.shiftKey) {

         $('form', self.container).submit();

         e.preventDefault();
         //self.create_message($(this).val())
         return false;
         }
         return true;


         });



        var strategies = [
            { // mention strategy
                match: /(^|\s)@(\w*)$/,
                search: function (term, callback) {
                    //callback(cache[term], true);
                    $.getJSON('/search', { q: term })
                        .done(function (resp) {
                            callback(resp);
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
            { // mention strategy
                match: /(^|\s)#(\w*)$/,
                search: function (term, callback) {
                    //callback(cache[term], true);
                    $.getJSON('/lsearch', { q: term })
                        .done(function (resp) {
                            callback(resp);
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


        $('textarea', self.container).textcomplete(strategies, option);


    };


    this.create_message = function (text) {


        if (text.length > 1) {
            var message = {
                body: text,
                user: {
                    username: 'Jonas',
                    'is_me': true
                }
            };

            self.add_message(message);

        }
        $('.chat-message', self.container).val('')


    };

    this.load = function () {

    };

    this.dummy = function () {

        var lorem = new Lorem;
        lorem.type = Lorem.TEXT;
        lorem.query = '17w';

        var message = {
            body: lorem.createLorem(),
            user: {
                username: 'Peter',
                'is_me': false
            }
        }

        self.add_message(message);

        var rand = Math.round(Math.random() * (20000 - 2000) + 2000);
        setTimeout(function () {
            self.dummy()
        }, rand);
    };


    this.add_message = function (message) {
        debug.debug('AchatApp: add_message', message);

        var html = $(nj.render('achat/nj/message.html', {message: message}));
        setTimeout(function () {
            html.removeClass('new');
        }, 100)

        self.messages_container.prepend(html);

    };

};


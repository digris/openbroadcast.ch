;
var AJAXLoader = function () {

    var self = this;
    this.debug = false;

    this.init = function () {
        self.bindings();
    };

    this.bindings = function () {


        $('body').on('click', 'a[data-ajax-load]', function(e){

            // hack - disable ajax loading when toolbar visible
            if($('html').hasClass('cms-toolbar-expanded')){
                return;
            }


            e.preventDefault();
            var uri = $(this).attr('href');

            if(uri == '#') {
                return false;
            } else {
                var base_uri = uri.replace('en/', '').replace('de/', '').replace('de-ch/', '')
                $.address.value(base_uri);
            }
        });

        $.address.change(function(e) {

            // hack - disable ajax loading when toolbar visible
            if($('html').hasClass('cms-toolbar-expanded')){
                return;
            }

            // do something depending on the event.value property, e.g.
            if(self.debug) {
                console.log('AJAXLoader - address.change', e.value);
            }
            self.reflect_uri_change(e.value)
        });


        $(document).on('alogin', function(e, t){
            if(t == 'auth-state-change') {
                self.reflect_uri_change($.address.path())
            }

        });





    };

    this.reflect_uri_change = function(uri) {

        if(self.debug) {
            console.log('AJAXLoader - reflect_uri_change', uri);
        }

        if(uri == '/de-ch/' || uri == '/en/' || uri == '/') {
            $('#onair_container').fadeIn(100);
            $('#achat_container').fadeIn(100);
        } else {
            $('#onair_container').fadeOut(100);
            $('#achat_container').fadeOut(100);
        }

        $.get(uri, function(data){

            if(self.debug) {
                console.log($(data).find('#navigation_container'));
            }

            // TODO: make more modular.
            // replaces main-content & global navigation
            $("#navigation_container").replaceWith($(data).filter("#navigation_container"));
            $("#page_content_container").replaceWith($(data).find("#page_content_container"));

            $('body').css('opacity', 1.0);

            $(document).trigger('ajax-loader', ['loaded']);



        });


    }

};

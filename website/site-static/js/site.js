var SiteUI = function () {

    var self = this;
    this.navigation_active = false;
    this.is_retina = false;
    this.colors = [
        '#21D9EA',
        '#6C74EE',
        '#75DB87',
        '#609E80'
    ];
    this.colors = [
        '#cacaca'
    ];
    this.current_color = 0;

    this.remote_window = false;

    this.hover_timeouts = [];

    this.bindings = function () {

        $('body').on('mouseover', '.hoverable', function (e) {
            $(this).addClass("hover");
        });
        $('body').on('mouseleave', '.hoverable', function (e) {
            $(this).removeClass("hover");
        });
        $('body').on('click', '.clickable', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var url = $(this).data('permalink');
            document.location = url;
        });

        // item linking
        $('body').on('click', '.item[data-permalink], .clickable[data-permalink]', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var url = $(this).data('permalink');
            try {
                tl_visit(url);
            } catch(e) {
                document.location.href = url;
            }
        });

        $(document).ajaxStart(function() {
            //debug.debug('ajax start');
            //$('body').addClass('xhr-load');
        });
        $(document).ajaxStop(function() {
            //debug.debug('ajax stop');
            //$('body').removeClass('xhr-load');
        });


        $( window ).resize(function() {
            self.layout();
        });


        // handling urls on external sites
        $('body__').on('click', 'a', function(e){

            var url = $(this).attr('href');

            if(url != '#' && util.is_external(url)) {
                e.preventDefault();
                self.remote_window = window.open(url);
            }

        });

        $(document).on('ajax-loader', function(e, action) {
            if(action == 'loaded') {
                self.set_color();
            }
        });



    };


    this.set_color = function() {

        var color = self.colors[self.current_color];
        var color = self.colors[Math.floor(Math.random() * self.colors.length)];

        $('html *[data-livebg]').animate({
            backgroundColor: color
        }, 1 );
    };


    /*
    layout method, called as well on window resize
     */
    this.layout = function() {

        // hack!
        // TODO: modularize!
        //var ice = $('.info-container .items');
        //ice.height(ice.width());

        $('[data-width-to-height]').each(function(){
            $(this).height($(this).width());
        });




    };



    this.init = function () {

        self.is_retina = isRetinaDisplay();

        self.layout();
        self.set_color();
        self.bindings();

    };

};




var fd5_settings = {
    topbar: {
        is_hover: true
    },
    dropdown: {
        is_hover: true
    },
    tooltips: {
        tooltip_class: '.tooltip',
        touch_close_text: 'tap to close',
        disable_for_touch: false
    }
};

var nj;


$(function () {

    if (site_ui == undefined) {
       var site_ui = new SiteUI();
    }
});




// utils to be refactored
// http://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
function isRetinaDisplay() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            if (mq && mq.matches || (window.devicePixelRatio > 1)) {
                return true;
            } else {
                return false;
            }
        }
    }
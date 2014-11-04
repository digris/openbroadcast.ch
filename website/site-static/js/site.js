var SiteUI = function () {

    var self = this;
    self.navigation_active = false;
    self.is_retina = false;

    self.hover_timeouts = [];

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
            debug.debug('ajax start');
            //$('body').addClass('xhr-load');
        });
        $(document).ajaxStop(function() {
            debug.debug('ajax stop');
            //$('body').removeClass('xhr-load');
        });


        $( window ).resize(function() {
            self.layout();
        });

    };





    this.layout = function() {

        //$('body *[data-livebg]').css('background', '#00ffff');

		var rgb = new Array();
		rgb[0] = Math.round(Math.random() * 155 + 100) ;
    	rgb[1] = Math.round(Math.random() * 155 + 100) ;
    	rgb[2] = Math.round(Math.random() * 155 + 100) ;

        var new_color = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';

        $('body *[data-livebg]').animate({
            backgroundColor: new_color
        }, 500 );

    };



    this.init = (function () {

        self.is_retina = isRetinaDisplay();

        self.layout();
        self.bindings();

    })();

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
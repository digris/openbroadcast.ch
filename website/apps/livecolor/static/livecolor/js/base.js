;
LiveColorApp = function () {

    var self = this;
    this.debug = false;
    this.container;
    this.bg_color;
    this.fg_color;
    this.base_url;

    this.stylesheet_bg;
    this.stylesheet_fg;

    this.init = function () {

        if(self.debug) {
            console.debug('LiveColorApp: init');
        }

        self.bindings();

        $("head").append("<style id='livecolor_stylesheet_bg'></style>");
        $("head").append("<style id='livecolor_stylesheet_fg'></style>");

        self.stylesheet_bg = $('#livecolor_stylesheet_bg');
        self.stylesheet_fg = $('#livecolor_stylesheet_fg');

        if(self.bg_color !== undefined) {
            setTimeout(function(){
                self.set_color(self.bg_color, self.fg_color , 1);
            }, 1)
        }

        pushy_client.subscribe('livecolor', function(data){
            self.update_color(data);
        });

    };

    this.bindings = function() {

    };

    this.update_color = function (data) {

        if(self.debug) {
            console.debug('LiveColorApp: update', data);
        }


    };

    this.set_color = function(bg_color, fg_color, duration) {

        if(duration === undefined) {
            var duration = 100;
        }


        /////////////////////////////////////////////////////////////////
        // backgrounds
        /////////////////////////////////////////////////////////////////

        $('html *[data-livebg]').animate({
            backgroundColor: bg_color
        }, duration );

        $('html *[data-livefill]').animate({
            svgFill: bg_color
        }, duration);

        // we need to remove the stylesheet from the dom as it would override the animations
        self.stylesheet_bg.text('');

        // add colors and re-add styles after animation
        var style_bg = '';
        style_bg += '[data-livebg] { background-color: ' + bg_color + '; }';
        style_bg += '[data-livefill] { fill: ' + bg_color + '; }';

        setTimeout(function(){
            self.stylesheet_bg.text(style_bg);
        }, duration);


        /////////////////////////////////////////////////////////////////
        // foreground
        /////////////////////////////////////////////////////////////////

        var duration_fg = 1000;
        var delay = Number((duration - duration_fg) / 2);

        if(duration < duration_fg) {
            duration_fg = duration;
            delay = 0;
        }

        if(fg_color === undefined) {
            var fg_color = self.get_contrast_color(bg_color);
        }

        setTimeout(function(){

            $('html *[data-livefg]').animate({
                color: fg_color,
                borderColor: fg_color
            }, duration_fg );

            // we need to remove the stylesheet from the dom as it would override the animations
            self.stylesheet_fg.text('');

            // add colors and re-add styles after animation
            var style_fg = '';
            style_fg += '[data-livefg] { color: ' + fg_color + '; border-color: ' + fg_color + '; }';

            setTimeout(function(){
                self.stylesheet_fg.text(style_fg);
            }, duration_fg);

        }, delay);










    };

    this.get_contrast_color = function(color) {

        var n_threshold = 105;

        var r = parseInt(color.substring(1, 3), 16);
        var g = parseInt(color.substring(3, 5), 16);
        var b = parseInt(color.substring(5, 7), 16);

        var bg_delta = (r * 0.299) + (g * 0.587) + (b* 0.114);

        return ((255 - bg_delta) < n_threshold) ? "#000000" : "#ffffff";
    };

};


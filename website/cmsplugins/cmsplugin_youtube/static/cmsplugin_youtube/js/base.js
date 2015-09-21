;
YoutubePlayerApp = function (dom_id) {

    var self = this;
    this.dom_id = dom_id;
    this.dom_element;
    this.video_id;
    // user defined
    this.ratio = (4 / 3);
    this.theme = 'light';
    this.color = 'white';

    this.init = function () {

        self.dom_element = $('#' + self.dom_id);

        self.ratio = parseFloat(self.ratio.replace(',', '.'));

        self.process();
        self.bindings();
    };

    this.bindings = function () {
        $(window).on('resize', function () {
            self.refresh();
        }, 200);
    };

    this.process = function () {

        // get size
        var container = self.dom_element.parents('.wrapper');
        var width = container.width();
        var height = width / self.ratio;

        //console.log('YoutubePlayerApp - process');
        //console.log('width:', width)
        //console.log('height:', height)
        //console.log('ratio:', self.ratio)


        self.dom_element.tubeplayer({
            width: width,
            height: height,
            modestbranding: false,
            playsinline: true,
            protocol: 'https',
            allowFullScreen: "true",
            initialVideo: self.video_id,
            preferredQuality: "auto",
            theme: self.theme,
            color: self.solor,
            onPlayerPlaying: function (id) {

                //console.log('tp play:', self.dom_id)
                $('.tubeplayer').not(self.dom_element).each(function(i, el){
                    $(el).tubeplayer('pause');
                });

            },
            onPause: function () {
                console.log('tp pause:', self.dom_id)
            },
            onStop: function () {
            },
            onSeek: function (time) {
            },
            onMute: function () {
            },
            onUnMute: function () {
            }
        });


    };

    this.refresh = function () {
        try {
            self.dom_element.tubeplayer('destroy');
        } catch(e) {
            // pass, no instance available...
        }

        setTimeout(function(){
            self.process();
        }, 1)

    };

};

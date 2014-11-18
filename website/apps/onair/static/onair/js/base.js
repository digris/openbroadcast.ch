;
var OnAirApp = function () {
    var self = this;
    this.api_url = '/api/v1/abcast/channel/';
    this.channel_id = 1;
    //this.base_url = 'http://openbroadcast.org/';
    // TODO: base_url form API_BASE_URL settings
    this.base_url = 'http://localhost:8080';
    this.debug = false;
    this.container;
    this.info_container;
    this.meta_container;
    this.meta_container;
    this.prevnext_container;
    this.info_timeout = false;
    this.local_data = [];
    this.mode = 'onair'; // 'on air', 'history' or 'fallback'
    this.timeline_offset = 0;

    this.init = function () {

        // assigning dom elements
        self.container = $('#onair_container');
        self.info_container = $('.info-container', self.container);
        self.meta_container = $('.meta-container', self.container);
        self.prevnext_container = $('#media_prev_next', self.container);

        self.load();
        self.bindings();

        // dummy call
        setTimeout(function () {
            self.load_history({limit: 3});
        }, 2000);

    };

    this.load = function () {

        var url = self.api_url + self.channel_id + '/' + 'on-air/';

        $.get(url, function (data) {
            console.log('on air:', data);

            if (!data.start_next) {
                setTimeout(self.load, 10000)
            } else {
                setTimeout(self.load, Number(data.start_next * 1000))
            }

            if (data.playing != undefined && (data.playing.emission != undefined && data.playing.item != undefined)) {
                self.set_mode('onair');
                self.load_current(data.playing);
            } else {
                self.set_mode('fallback');
                console.log('nothing on air -> load splash-screen');
            }
        });
    };

    this.set_mode = function (mode) {
        console.log('OnAirApp - set_mode: ' + mode)
        self.mode = mode;
        self.container.removeClass('onair history fallback').addClass(mode);
    };

    this.bindings = function () {
        console.log('OnAirApp - bindings');

        // flip-handling
        // direct hover
        self.meta_container.on('mouseover', 'a', function (e) {
            $('.current', self.info_container).addClass('flipped');
            if (self.info_timeout) {
                clearTimeout(self.info_timeout);
            }
            // set ct-based metadata
            self.show_meta_for($(this).data('ct'))

        }).on('mouseout', 'a', function (e) {
            self.info_timeout = setTimeout(function () {
                $('.current', self.info_container).removeClass('flipped');
            }, 400)
        });
        // keep visible on info-hover
        self.info_container.on('mouseover', '.item', function (e) {
            if (self.info_timeout) {
                clearTimeout(self.info_timeout);
            }
        }).on('mouseout', '.item', function (e) {
            self.info_timeout = setTimeout(function () {
                $('.current', self.info_container).removeClass('flipped');
            }, 400)
        });


        self.prevnext_container.on('click', 'a', function(e) {
            e.preventDefault();
            if(! $(this).parent().hasClass('disabled')) {
                self.handle_prevnext($(this).data('direction'));
            }
        });

    };

    this.show_meta_for = function(ct) {

        console.log('OnAirApp - show_meta_for: ' + ct);

        $('div[data-ct]').hide();
        $('div[data-ct="' + ct + '"]').show();


    };



    this.load_current = function (playing) {

        console.log('OnAirApp - load_current');
        var obj = {
            emission: [],
            item: [],
            timestamp: playing.time_start,
            on_air: true,
            el: false
        };

        // first load emission data
        $.get(playing.emission, function (data) {
            console.log('emission:', data);
            obj.emission = data;
            // then 'item' data
            $.get(playing.item, function (data) {
                console.log('item:', data);
                obj.item = data;

                // reset playing flag
                $.each(self.local_data, function (i, item) {
                    item.on_air = false
                });
                self.local_data.push(obj);

                self.update_display();

            });

        });

    };

    this.load_history = function (options) {



        var url = self.api_url + self.channel_id + '/' + 'history/';
        $.get(url, function (history) {
            $.each(history.objects, function (i, item) {
                if (item.el == undefined) {
                    item.el = false;
                }
                if (item.on_air == undefined) {
                    item.on_air = false;
                }
                self.local_data.unshift(item);
            });

            self.update_data();
        });

        // a dummy implementation here, just to test
        // history then will be loaded from API
        var history = {
            meta: {},
            objects: [
                {
                    emission: '/api/v1/abcast/emission/452/',
                    item: '/api/v1/library/track/13489/'
                },
                {
                    emission: '/api/v1/abcast/emission/452/',
                    item: '/api/v1/library/track/13397/'
                },
                {
                    emission: '/api/v1/abcast/emission/452/',
                    item: '/api/v1/library/track/13440/'
                }
            ]
        }



    };

    /**
     * completes dataset via API.
     * if resource data in json is a string (url) it fetches these data and
     * replaces it with the returned object
     */
    this.update_data = function () {

        console.log('OnAirApp - update_data');

        $.each(self.local_data, function (i, item) {

            if (typeof item.emission == 'string') {
                $.get(item.emission, function (data) {
                    self.local_data[i].emission = data;
                });
            }

            if (typeof item.item == 'string') {
                $.get(item.item, function (data) {
                    self.local_data[i].item = data;
                });
            }

        });

        setTimeout(function () {
            console.log(self.local_data);
            self.update_display();
        }, 500);

    };


    this.update_display = function () {

        console.log('OnAirApp - update_display', self.local_data);

        $.each(self.local_data, function (i, item) {

            var dom_id = item.emission.uuid + '-' + item.item.uuid;

            // compose classes
            var classes = '';
            if (item.on_air) {
                // TODO: adjust behavior if in 'history' or 'fallback' mode
                self.update_meta_display(item);
                classes += 'next next-1';
            } else {
                //classes += ' previous';
                //classes += ' previous-' + (i + 1);
            }


            // check if present in dom
            // create in case that not
            if (!item.el) {
                var html = $(nj.render('onair/nj/item.html', {
                    dom_id: dom_id,
                    debug: self.debug,
                    object: item,
                    extra_classes: classes,
                    base_url: self.base_url
                }));
                $('.info-container .items').append(html)

                item.el = $('#' + dom_id);

            } else {
                //item.el.fadeOut(5000)
            }
        });

        setTimeout(function(){
           self.handle_timeline();
        }, 5)


    };

    /**
     * Updates metadata display, playlist, artist etc.
     * sets corresponding names & links
     * @param item
     */
    this.update_meta_display = function (item, fast) {


        if(fast == undefined) {
            var fast = false;
        }

        self.meta_container.fadeOut(100);
        var html = $(nj.render('onair/nj/meta.html', {
            object: item,
            base_url: self.base_url
        }));


        if(fast) {
            setTimeout(function(){
                self.meta_container.html(html);
                self.meta_container.fadeIn(200);
            }, 150);
        } else {
            setTimeout(function(){
                self.meta_container.html(html);
                self.meta_container.fadeIn(500);
            }, 1000);
        }


    };

    /**
     * handles timeline display: prev/next etc.
     */
    this.handle_timeline = function() {

        // cases: on_air mode -> item with on_air flag is set to current
        // cases: history mode -> item with <to-be-defined> flag is set to current

        // get current item
        var current_index = false;
        var num_items = self.local_data.length;
        var onair_index = 0;
        var onair = false;
        $.each(self.local_data, function (i, item) {
            if (item.on_air) {
                onair_index = i;
                onair = true;
            }
        });

        if(! onair) {
            self.set_mode('fallback')
        }

        // TODO: think about a more elegant solution
        if(self.timeline_offset == 0) {
            // on-air _is_ current item
            self.set_mode('onair');
        } else {
            // on-air _IS NOT__ current item (and not fallback mode)
            //if(! self.mode == 'fallback') {
                self.set_mode('history');
            //}
        }
        current_index = onair_index + self.timeline_offset;

        // apply classes based on offset
        $.each(self.local_data, function (i, item) {

            item.el.removeClass().addClass('item info');
            if(i < current_index) {
                item.el.addClass('previous');
                item.el.addClass('previous-' + Math.abs(current_index - i));

                console.log('index / prev:',  Math.abs(current_index - i))

                if(Math.abs(current_index - i) > 3) {
                    item.el.addClass('previous-x');
                }
            }
            if(i == current_index) {
                item.el.addClass('current');
                self.update_meta_display(item, false);
            }
            if(i > current_index) {
                item.el.addClass('next');
                item.el.addClass('next-' + Math.abs(current_index - i));

                if(Math.abs(current_index - i) > 1) {
                    item.el.addClass('next-x');
                }
            }

        });

        // handle prev/next actions
        console.log('current_index', current_index + 1, 'num_items', num_items)

        if(current_index + 1 <= num_items
            && num_items > 1
            && current_index > 0) {
            $('.previous', self.prevnext_container).removeClass('disabled');
        } else {
            $('.previous', self.prevnext_container).addClass('disabled');
        }

        if(current_index + 1 < num_items && num_items > 1) {
            $('.next', self.prevnext_container).removeClass('disabled');
        } else {
            $('.next', self.prevnext_container).addClass('disabled');
        }

    };

    /**
     * handles pagination & onair/history mode
     */
    this.handle_prevnext = function(direction) {

        console.log('OnAirApp - handle_prevnext: ' + direction);
        if(direction == 'previous') {
            self.timeline_offset--;
        };
        if(direction == 'next') {
            self.timeline_offset++;
        };

        self.handle_timeline();

    };


};
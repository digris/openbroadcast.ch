;
var OnAirApp = function () {

    var self = this;
    this.debug = false;
    this.api_url = '/api/v1/abcast/channel/';
    this.channel_id = 1;
    this.base_url = '';
    this.use_history = false;
    this.container;
    this.bplayer = false;
    this.max_items = 24;
    this.initial_items = 12;
    this.info_container;
    this.meta_container;
    this.meta_rating;
    this.prevnext_container;
    this.info_timeout = false;
    this.local_data = [];
    this.current_item = false;
    this.timestamps = [];
    this.load_schedule_timeout = false;
    this.default_timeout = 30000;

    this.stream_delay = 6500;

    // holding on-air status and playback modes
    this.is_onair = false;
    this.mode = 'init'; // 'live' or 'history'

    this.timeline_offset = 0;

    this.init = function () {

        // assigning dom elements
        self.container = $('#onair_container');
        self.info_container = $('.info-container', self.container);
        self.meta_container = $('.meta-container', self.container);
        self.prevnext_container = $('#media_prev_next', self.container);
        self.rating_container = $('#rating_container', self.container);

        self.bindings();

        self.container.css('height', 'auto');

        setTimeout(function () {
            self.load_schedule(true);
        }, 0);


        pushy_client.subscribe('arating_vote', function (vote) {
            self.update_vote(vote);
        });

    };

    this.bindings = function () {
        if (self.debug) {
            console.log('OnAirApp - bindings');
        }

        // flip-handling
        // direct hover
        self.meta_container.on('mouseover', 'a[data-ct]', function (e) {
            $('.current', self.info_container).addClass('details-visible');
            if (self.info_timeout) {
                clearTimeout(self.info_timeout);
            }
            // set ct-based metadata
            self.show_meta_for($(this).data('ct'))

        }).on('mouseout', 'a', function (e) {
            self.info_timeout = setTimeout(function () {
                $('.current', self.info_container).removeClass('details-visible');
            }, 200)
        });

        // pagination arrows
        self.prevnext_container.on('click', 'a', function (e) {
            e.preventDefault();
            if (!$(this).parent().hasClass('disabled')) {
                self.handle_prevnext($(this).data('direction'));
            }
        });

        // explicit pagination/index jump
        self.container.on('click', '.item.history:not(".current")', function (e) {
            e.preventDefault();
            var index = $(this).data('index');
            self.handle_pagination(index);
        });

        // handle votes
        self.rating_container.on('click', 'a', function (e) {
            // TODO: make sure to not continue in case of unauthorized user
            e.preventDefault();
            if (!$(this).parent().hasClass('disabled')) {
                self.handle_vote(Number($(this).data('vote')));
            }
        });

        // TODO: hackish implementation here, should be done more generic
        self.container.on('click', '#back_onair .wrapper', function (e) {
            e.preventDefault();
            self.handle_pagination(0)
        });


        /****************************************************************************
         * playback controls, forwarded to bplayer
         ****************************************************************************/
        $(document).on('click', '[data-onair-controls]', function (e) {

            e.preventDefault();

            var action = $(this).data('onair-controls');

            /*
             * actions are forwarded to the player app including the respective index.
             * the player 'decides' itself if we have a stream or on-demand situation.
             */
            switch (action) {
                case 'play':
                    var index = $(this).parents('.item').data('index');
                    self.bplayer.controls({action: action, index: index});
                    break;
                default:
                    self.bplayer.controls({action: action});
            }

        });

        /****************************************************************************
         * swipe navigation
         ****************************************************************************/
        $("#___onair_container .switch-container").swipe( {


            hold: function(event, direction, distance) {
                console.log('hold distance:', distance);
            },

            swipe: function(event, direction, distance, duration, fingerCount, fingerData) {


                console.log('distance:', distance);

                if(direction == 'right') {
                    self.handle_prevnext('previous');
                }
                if(direction == 'left') {
                    self.handle_prevnext('next');
                }

            },

            swipeStatus: function (event, phase, direction, distance) {
                //If we are moving before swipe, and we are going L or R in X mode, or U or D in Y mode then drag.
                if (phase == "move" && (direction == "left" || direction == "right")) {
                    var duration = 0;


                    if (direction == "left") {
                        distance *= -1;
                    }

                    console.debug('distance:', distance);


                    $("#onair_container .switch-container").css('left', distance * 0.2)


                    // if (direction == "left") {
                    //     scrollImages((IMG_WIDTH * currentImg) + distance, duration);
                    // } else if (direction == "right") {
                    //     scrollImages((IMG_WIDTH * currentImg) - distance, duration);
                    // }

                } else if (phase == "cancel") {
                    // scrollImages(IMG_WIDTH * currentImg, speed);
                    $("#onair_container .switch-container").css('left', 0);
                    $("#onair_container .switch-container").css('right', 0);


                } else if (phase == "end") {
                    if (direction == "right") {
                       self.handle_prevnext('previous');
                    } else if (direction == "left") {
                        self.handle_prevnext('next');
                    }
                    // scrollImages(IMG_WIDTH * currentImg, speed);
                    $("#onair_container .switch-container").css('left', 0);
                    $("#onair_container .switch-container").css('right', 0);
                }
            }
        });

    };


    this.set_onair = function (onair_status) {

        if (self.debug) {
            console.debug('OnAirApp - set_onair:', onair_status);
        }
        self.is_onair = onair_status;
        if (onair_status) {
            self.container.removeClass('init offline').addClass('onair');
        } else {
            self.container.removeClass('init onair').addClass('offline');
        }

        $(document).trigger('onair', ['onair-state-change', onair_status]);

    };

    this.set_mode = function (mode) {

        // mode: 'live' or 'history'

        if (self.debug) {
            console.debug('OnAirApp - set_mode:', mode);
        }
        self.mode = mode;
        self.container.removeClass('init live history').addClass(mode);

        $(document).trigger('onair', ['onair-mode-change', mode]);

    };


    this.load_schedule = function (initial, limit) {

        initial = typeof initial !== 'undefined' ? true : false;
        limit = typeof limit !== 'undefined' ? limit : self.initial_items;
        var url = '/api/v1/onair/schedule/?expand=item+emission&limit=' + limit;

        $.get(url, function (schedule) {

            // processing schedule meta
            var meta = schedule.meta;
            if (meta.next_starts_in) {
                if (self.load_schedule_timeout) {
                    clearTimeout(self.load_schedule_timeout);
                }
                self.load_schedule_timeout = setTimeout(function () {
                    // we have to load the previous item as well to update our data
                    // TODO: this could be handled better!
                    self.load_schedule(false, 2)
                }, Number((meta.next_starts_in) * 1000 + self.stream_delay));
            } else {

                if (self.load_schedule_timeout) {
                    clearTimeout(self.load_schedule_timeout);
                }

                console.debug('setting refresh timeout to', self.default_timeout);
                self.load_schedule_timeout = setTimeout(function () {
                    console.debug('call from timeout');
                    self.load_schedule()
                }, self.default_timeout);
            }

            self.set_onair(meta.onair);


            // processing schedule items
            // we need reversed order for local schedule
            var objects = schedule.objects.reverse();

            $.each(objects, function (i, item) {

                //console.debug('loaded item:', item);

                var exists = -1;
                $.each(self.local_data, function (j, local_item) {
                    if (self.local_data[j].time_start == item.time_start) {
                        exists = j;
                    }
                });

                if (exists >= 0) {
                    self.local_data[exists] = item;

                } else {
                    self.local_data.push(item);
                    self.load_rating(item);
                }

            });

            self.process_data();


            // TODO: this is an ugly hack!
            if (initial) {

                setTimeout(function () {
                    self.bplayer.state_change('paused');
                    //self.bplayer.controls({action: 'pause'})
                }, 2000)
            }


        });

    };


    this.process_data = function () {

        if (self.debug) {
            console.debug('OnAirApp - update_data', self.local_data);
        }

        // clean 'old' data
        self.local_data.splice(0, self.local_data.length - self.max_items);

        $.each(self.local_data, function (i, item) {

            // this leads to non-unique ids in case of multiple appearances in same emission
            // var dom_id = item.emission.uuid + '-' + item.item.uuid;
            var dom_id = CryptoJS.MD5(item.time_start).toString() + '-' + item.item.uuid;

            // index is in reversed reversed
            // index is assigned/shifted to items in history in case of 'pagination'
            var index = (self.local_data.length - 1) - i;

            var dom_el = $('#' + dom_id);

            // compose classes
            var classes = '';
            if (item.onair) {
                // TODO: adjust behavior if in 'history' or 'fallback' mode
                self.update_meta_display(item);
                classes += 'next next-1';
            }

            var html = $(nj.render('onair/nj/item.html', {
                dom_id: dom_id,
                index: index,
                debug: self.debug,
                object: item,
                extra_classes: classes,
                base_url: self.base_url
            }));

            if (dom_el.length) {
                dom_el.removeClass('onair');
            } else {
                //console.debug('element not in dom > append it')
                $('.info-container .items').append(html)
            }

            item.el = $('#' + dom_id);
            item.el.data('index', index);

            self.local_data[i] = item;


        });


        // map on-air history to player app
        self.bplayer.set_playlist(self.local_data);

        // handle own timeline
        setTimeout(function () {
            self.handle_timeline(true);
        }, 100);


    };

    /**
     * Updates metadata display, playlist, artist etc.
     * sets corresponding names & links
     * @param item
     */
    this.update_meta_display = function (item, fast) {

        // non-animated version
        var html = $(nj.render('onair/nj/meta.html', {
            object: item,
            base_url: self.base_url
        }));
        self.meta_container.html(html);
        html.addClass('fade-in');

    };


    /**
     * Toggles meta panel
     * @param ct
     */
    this.show_meta_for = function (ct) {
        $('div[data-ct]').fadeOut(50);
        $('div[data-ct="' + ct + '"]').fadeIn(250);
    };


    /**
     * handles timeline display: prev/next etc.
     */
    this.handle_timeline = function (reindex) {

        // cases: onair mode -> item with onair flag is set to current
        // cases: history mode -> item with <to-be-defined> flag is set to current
        if (self.timeline_offset == 0) {
            self.set_mode('live');
        } else {
            self.set_mode('history');
        }

        var onair_index = 0;
        var is_onair = false;
        $.each(self.local_data, function (i, item) {
            if (item.onair) {
                is_onair = true;
                onair_index = i;
            }
        });

        // not sure if this introduces other problems... but in case that nothing is "on air" we just add a dummy item
        var schedule = self.local_data;

        // reindex timeline offset
        if (reindex !== undefined && self.mode == 'history') {

            var current_uuid = self.current_item.item.uuid;

            if(self.debug) {
                console.debug('reindex timeline offset');
                console.debug('self.timeline_offset:', self.timeline_offset);
                console.debug('self.local_data:', self.local_data);
                console.warn('current_uuid', current_uuid);
            }

            $.each(self.local_data, function (i, el) {
                console.debug(el.item.uuid);

                if (el.item.uuid == current_uuid) {
                    var new_offset = (self.local_data.length - i - 1) * -1;
                    self.timeline_offset = new_offset;
                }
            });


        }


        onair_index = schedule.length - 1;
        var current_index = onair_index + self.timeline_offset;


        // apply classes based on offset
        $.each(schedule, function (i, item) {

            item.el.removeClass().addClass('item info');
            if (i < current_index) {
                item.el.addClass('previous');
                item.el.addClass('previous-' + Math.abs(current_index - i));

                if (Math.abs(current_index - i) > 3) {
                    item.el.addClass('previous-x');
                }
            }
            if (i == current_index) {
                item.el.addClass('current');
                self.current_item = item;
                self.update_meta_display(item, false);
                self.update_rating_display();
            }
            if (i > current_index) {
                item.el.addClass('next');
                item.el.addClass('next-' + Math.abs(current_index - i));

                if (Math.abs(current_index - i) > 1) {
                    item.el.addClass('next-x');
                }
            }

            if (item.onair) {
                item.el.addClass('onair');
            } else {
                item.el.addClass('history');
            }

        });


        var num_items = schedule.length;


        if (current_index + 1 <= num_items
            && num_items > 1
            && current_index > 0) {
            $('.previous', self.prevnext_container).removeClass('disabled');
        } else {
            $('.previous', self.prevnext_container).addClass('disabled');
        }

        if (current_index + 1 < num_items && num_items > 1) {
            $('.next', self.prevnext_container).removeClass('disabled');
        } else {
            $('.next', self.prevnext_container).addClass('disabled');
        }

        setTimeout(function () {
            self.bplayer.update_player(true);
        }, 1);


        // temporary / p.o.c.
        setTimeout(function () {
            self.handle_color();
        }, 100);


    };


    /**
     * handles pagination & onair/history mode
     */
    this.handle_prevnext = function (direction) {

        if (self.debug) {
            console.debug('OnAirApp - handle_prevnext: ' + direction);
        }

        if (direction == 'previous') {
            self.timeline_offset--;
        }
        if (direction == 'next') {
            self.timeline_offset++;
        }

        self.handle_timeline();

    };

    /**
     * handles pagination to given position
     */
    this.handle_pagination = function (offset) {

        if (self.debug) {
            console.debug('OnAirApp - handle_pagination: ' + offset);
        }

        // offset is negative in 'history' case
        // TODO: check if valid index
        self.timeline_offset = offset * -1;

        self.handle_timeline();

    };


    /**
     * loads current rating values for item
     */
    this.load_rating = function (item) {
        var url = '/api/v1/onair/vote/alibrary.media/' + item.item.id + '/';
        $.get(url, function (data) {
            $.each(self.local_data, function (i, local_item) {
                if (item.id == local_item.id) {
                    self.local_data[i].item.votes = data;
                }
            });
            setTimeout(function () {
                self.update_rating_display();
            }, 1)
        });

    };


    this.update_rating_display = function () {
        // set current values
        if (!self.current_item) {
            console.warn('no current item!');
            return;
        }

        if (!self.is_onair) {
            $('.vote-up a > span', self.rating_container).html('-');
            $('.vote-down  a > span', self.rating_container).html('-');
            self.rating_container.addClass('disabled');
        } else {
            try {
                $('.vote-up a > span', self.rating_container).html(self.current_item.item.votes.up);
                $('.vote-down  a > span', self.rating_container).html(self.current_item.item.votes.down);
                self.rating_container.removeClass('disabled');
            } catch (e) {
                self.rating_container.addClass('disabled');
            }
        }
    };


    /**
     * handles votes
     * (from up/down clicks)
     */
    this.handle_vote = function (vote) {

        if (!self.current_item) {
            console.warn('no current item!');
            return;
        }

        var data = JSON.stringify({
            'vote': vote,
            'ct': 'alibrary.media',
            'id': self.current_item.item.id
        });

        $.ajax({
            url: '/api/v1/onair/vote/',
            type: 'POST',
            contentType: 'application/json',
            data: data,
            dataType: 'json',
            processData: false
        })

    };

    /**
     * handles vote updates
     * callback from pushy subscription
     */
    this.update_vote = function (vote) {

        if (self.debug) {
            console.debug('OnAirApp - update_vote: ', vote);
        }

        $.each(self.local_data, function (i, el) {
            console.log(i);

            if (vote.uuid == self.local_data[i].item.uuid) {
                if (self.debug) {
                    console.debug('OnAirApp - uuid match for: ' + vote.uuid);
                }
                // apply vote data
                self.local_data[i].item.votes = vote;
            }

            self.update_rating_display();

        });

    };


    // temporary / p.o.c.
    this.handle_color = function() {

        var color_hex = '#d5d5d5';
        var color_hex = '#333333';

        if(self.is_onair) {
            var image_url = $('.item.current .image-container img').attr('src');

            if(image_url === undefined) {
                return;
            }

            var src_img = new Image();
            src_img.src = image_url;
            src_img.onload = function(){
                var ct = new ColorThief();
                var color_rgb = ct.getColor(src_img);
                //color_hex = rgbToHex(rgb_invert(color_rgb));
                color_hex = rgbToHex(color_rgb);

                color_hex = tinycolor(color_hex).saturate(50).toString();

                livecolor.set_color(color_hex, false, 1000)
            };
        } else {
            //livecolor.set_color(color_hex, false, 1000)
        }


    }


};

function rgb_invert(rgb) {

    n_rgb = [];

    n_rgb[0] = 255 - rgb[0];
    n_rgb[1] = 255 - rgb[1];
    n_rgb[2] = 255 - rgb[2];
    return n_rgb;

}


function rgbToHex(rgb) {
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
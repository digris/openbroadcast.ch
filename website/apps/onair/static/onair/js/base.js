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
    this.max_items = 600;
    this.initial_items = 240;
    this.info_container;
    this.meta_container;
    this.meta_rating;
    this.prevnext_container;
    this.info_timeout = false;
    this.local_data = [];
    this.current_item = false;
    this.timestamps = [];
    this.load_schedule_timeout = false;
    this.default_timeout = 60000;

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

        /*
        setTimeout(function () {
            self.load();
        }, 200);

        if(self.use_history) {
            setTimeout(function () {
                self.load_history(4);
            }, 2000);
        }
        */

        self.load_schedule();

        pushy_client.subscribe('arating_vote', function(vote){
            self.update_vote(vote);
        });

    };

    this.bindings = function () {
        if(self.debug) {
            console.log('OnAirApp - bindings');
        }

        // flip-handling
        // direct hover
        self.meta_container.on('mouseover', 'a', function (e) {
            $('.current', self.info_container).addClass('details-visible');
            if (self.info_timeout) {
                clearTimeout(self.info_timeout);
            }
            // set ct-based metadata
            self.show_meta_for($(this).data('ct'))

        }).on('mouseout', 'a', function (e) {
            self.info_timeout = setTimeout(function () {
                $('.current', self.info_container).removeClass('details-visible');
            }, 400)
        });

        // keep visible on info-hover
        self.info_container.on('mouseover', '.item', function (e) {
            if (self.info_timeout) {
                clearTimeout(self.info_timeout);
            }
        }).on('mouseout', '.item', function (e) {
            self.info_timeout = setTimeout(function () {
                $('.current', self.info_container).removeClass('details-visible');
            }, 400)
        });

        // pagination arrows
        self.prevnext_container.on('click', 'a', function (e) {
            e.preventDefault();
            if (!$(this).parent().hasClass('disabled')) {
                self.handle_prevnext($(this).data('direction'));
            }
        });

        // explicit pagination/index jump
        self.container.on('click', '.item.history:not(".current")', function(e){
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
        self.container.on('click', '#back_onair a', function(e){
            e.preventDefault();
            self.handle_pagination(0)
        });

        // TODO: hakish implementation - show logo on station-time hover
        $('#station_time')
        .on('mouseover', 'a', function(){
            $('.show-while-fallback', self.container).css('display', 'block');
            $('.logo-container', self.container).fadeIn(500);
        })
        .on('mouseout', 'a', function(){
            $('.logo-container', self.container).fadeOut(500);
                setTimeout(function(){
                    $('.show-while-fallback', self.container).css('display', 'none');
                }, 500);
        });


        /****************************************************************************
         * playback controls, forwarded to bplayer
         ****************************************************************************/
        $('body').on('click', '[data-onair-controls]', function (e) {

            e.preventDefault();

            var action = $(this).data('onair-controls');

            console.debug(action + ' action through data-onair-controls');

            /*
             * actions are forwarded to the player app including the respective index.
             * the player 'decides' itself if we have a stream or on-demand situation.
             */
            switch(action) {
                case 'play':
                    var index = $(this).parents('.item').data('index');
                    self.bplayer.controls({action: action, index: index});
                    break;
                default:
                    self.bplayer.controls({action: action});
            }

        });

    };


    this.set_onair = function(onair_status) {
        if(self.debug) {
            console.debug('OnAirApp - set_onair:', onair_status);
        }
        self.is_onair = onair_status;
        if(onair_status) {
            self.container.removeClass('offline').addClass('onair');
        } else {
            self.container.removeClass('onair').addClass('offline');
        }

        $(document).trigger('onair', ['onair-state-change', onair_status]);

    };

    this.set_mode = function (mode) {
        if(self.debug) {
            console.debug('OnAirApp - set_mode:', mode);
        }
        self.mode = mode;
        self.container.removeClass('live history').addClass(mode);

        $(document).trigger('onair', ['onair-mode-change', mode]);

        /*
        self.container.removeClass('onair history fallback init').addClass(mode);
        // show/hide station-badge
        if(mode == 'fallback' || mode == 'init') {
            $('.logo-container', self.container).fadeIn(0);
        }
        if(mode == 'onair' || mode == 'history') {
            $('.logo-container', self.container).fadeOut(0);
        }
        */
    };







    this.load_schedule = function (limit) {

        var limit = typeof limit !== 'undefined' ? limit : self.initial_items;
        var url = '/api/v1/onair/schedule/?expand=item+emission&limit=' + limit;

        $.get(url, function (schedule) {

            // processing schedule meta
            var meta = schedule.meta;
            if(meta.next_starts_in) {
                if(self.load_schedule_timeout) {
                    clearTimeout(self.load_schedule_timeout);
                }
                self.load_schedule_timeout = setTimeout(function(){
                    // we have to load the previos item as well to update our data
                    // TODO: this could be handled better!
                    self.load_schedule(2)
                }, Number((meta.next_starts_in + 1) * 1000));
            } else {
                if(self.load_schedule_timeout) {
                    clearTimeout(self.load_schedule_timeout);
                }
                self.load_schedule_timeout = setTimeout(function(){
                    self.load_schedule()
                }, self.default_timeout);
            }

            self.set_onair(meta.onair)


            // processing schedule items
            // we need reversed order for local schedule
            var objects = schedule.objects.reverse();
            //var objects = schedule.objects;



            $.each(objects, function (i, item) {

                console.debug('loaded item:', item);


                var exists = -1;
                $.each(self.local_data, function (j, local_item) {
                    if(self.local_data[j].time_start == item.time_start) {
                        exists = j;
                    }
                });

                if(exists >= 0) {
                    console.debug('item present. replacing in local_items', exists)
                    self.local_data[exists] = item;

                } else {
                    console.debug('item not present. adding to local_items', exists)
                    self.local_data.push(item);
                    self.load_rating(item);
                }





                /*
                console.log('exists?', exists);

                if(exists >= 0) {
                    var local_item = self.local_data[exists];
                    self.local_data[exists] = item;
                    self.local_data[exists].el = local_item.el;
                } else {
                    if (item.el == undefined) {
                        item.el = false;
                    }
                    self.local_data.push(item);
                }
                */

                /*
                // TODO: find a nicer way to handle this
                if (item.el == undefined) {
                    item.el = false;
                }

                // TODO: update item in case it exists!!!
                if($.inArray(item.time_start, self.timestamps) < 0) {
                    self.timestamps.push(item.time_start);
                    self.local_data.push(item);
                } else {
                    console.debug('item exists with timestamp', item.time_start);
                }
                */



            });

            self.process_data();

        });

    };





    this.process_data = function () {

        if(self.debug) {
            console.log('OnAirApp - update_data', self.local_data);
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

            if(dom_el.length) {
                console.debug('got element in dom > replace it')
                //dom_el.replaceWith(html);
                dom_el.removeClass('onair');
            } else {
                console.debug('element not in dom > append it')
                $('.info-container .items').append(html)
            }

            item.el = $('#' + dom_id);
            item.el.data('index', index);

            self.local_data[i]  = item;


        });

        // handle own timeline
        setTimeout(function () {
            self.handle_timeline();
        }, 100);

        // map on-air history to player app
        setTimeout(function () {
            self.bplayer.set_playlist(self.local_data);
        }, 200);


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
    this.handle_timeline = function () {

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

        onair_index = schedule.length -1;
        var current_index = onair_index + self.timeline_offset;


        // apply classes based on offset
        $.each(schedule, function (i, item) {

            //console.info('current_index', current_index)

            item.el.removeClass().addClass('item info');
            if (i < current_index) {
                item.el.addClass('previous');
                item.el.addClass('previous-' + Math.abs(current_index - i));

                if(self.debug) {
                    //console.debug('index / prev:', Math.abs(current_index - i));
                }

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

            if(item.onair) {
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

        // TODO: hack!!
        //self.bplayer.mark_by_uuid();
        self.bplayer.update_player();

    };



    /**
     * handles pagination & onair/history mode
     */
    this.handle_prevnext = function (direction) {

        if(self.debug) {
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

        if(self.debug) {
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
        var url = '/api/v1/onair/vote/alibrary.media/' + item.item.id + '/'
        $.get(url, function(data){
            $.each(self.local_data, function (i, local_item) {
                if (item.id == local_item.id) {
                    self.local_data[i].item.votes = data;
                }
            });
            setTimeout(function(){
                self.update_rating_display();
            }, 1)
        });

    };


    this.update_rating_display = function () {
        // set current values

        if(!self.current_item) {
            console.warn('no current item!');
            return;
        }

        try {
            $('.vote-up a > span', self.rating_container).html(self.current_item.item.votes.up);
            $('.vote-down  a > span', self.rating_container).html(self.current_item.item.votes.down);
            self.rating_container.removeClass('disabled');
        } catch(e) {
            self.rating_container.addClass('disabled');
        }
    };



    /**
     * handles votes
     * (from up/down clicks)
     */
    this.handle_vote = function (vote) {

        if(!self.current_item) {
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

        if(self.debug) {
            console.debug('OnAirApp - update_vote: ', vote);
        }

        $.each(self.local_data, function (i, el) {
            console.log(i)

            if (vote.uuid == self.local_data[i].item.uuid) {
                if(self.debug) {
                    console.debug('OnAirApp - uuid match for: ' + vote.uuid);
                }
                // apply vote data
                self.local_data[i].item.votes = vote;
            }

            self.update_rating_display();

        });

    };


};




// moving to prototype based implementation




;
var OnAirApp = function () {
    var self = this;
    this.debug = false;
    this.api_url = '/api/v1/abcast/channel/';
    this.channel_id = 1;
    // TODO: base_url form API_BASE_URL settings
    this.base_url = '';
    this.use_history = false;
    this.container;
    this.bplayer = false;
    this.max_items = 12;
    this.info_container;
    this.meta_container;
    this.meta_rating;
    this.prevnext_container;
    this.info_timeout = false;
    this.local_data = [];
    this.current_item = false;
    this.mode = 'init'; // 'on air', 'history' or 'fallback'
    this.timeline_offset = 0;

    this.init = function () {

        // assigning dom elements
        self.container = $('#onair_container');
        self.info_container = $('.info-container', self.container);
        self.meta_container = $('.meta-container', self.container);
        self.prevnext_container = $('#media_prev_next', self.container);
        self.rating_container = $('#rating_container', self.container);

        self.bindings();

        setTimeout(function () {
            self.load();
        }, 200);

        if(self.use_history) {
            setTimeout(function () {
                self.load_history(4);
            }, 5000);
        }

        pushy_client.subscribe('arating_vote', function(vote){
            self.update_vote(vote);
        });

    };

    this.load = function () {

        var url = self.api_url + self.channel_id + '/' + 'on-air/';

        $.get(url).done(function (data) {

            if (!data.start_next) {
                setTimeout(self.load, 30000)
            } else {
                var timeout = Number(data.start_next * 1000);
                if(timeout > 7200000) {
                    timeout = 7200000;
                }
                setTimeout(self.load, timeout);
            }

            if (data.playing != undefined && (data.playing.emission != undefined && data.playing.item != undefined)) {

                // TODO: just temporary, should be solved in a nicer way
                setTimeout(function(){
                    self.set_mode('onair');
                }, 1500)


                self.load_current(data.playing);
            } else {

                // display dummy item
                // TODO: not sure if this is the best way?

                self.set_mode('fallback');
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if(self.debug) {
                console.error('OnAirApp - load ' + errorThrown);
            }
            self.set_mode('fallback');
            setTimeout(self.load, 10000);
        })

    };

    this.set_mode = function (mode) {
        if(self.debug) {
            console.debug('OnAirApp - set_mode: ' + mode);
        }
        self.mode = mode;
        self.container.removeClass('onair history fallback init').addClass(mode);

        // show/hide station-badge
        if(mode == 'fallback' || mode == 'init') {
            $('.logo-container', self.container).fadeIn(500);
        }
        if(mode == 'onair' || mode == 'history') {
            $('.logo-container', self.container).fadeOut(500);
        }
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

        self.prevnext_container.on('click', 'a', function (e) {
            e.preventDefault();
            if (!$(this).parent().hasClass('disabled')) {
                self.handle_prevnext($(this).data('direction'));
            }
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
        self.container.on('click', '#back_on_air a', function(e){
            e.preventDefault();
            for (i=0; i < Math.abs(self.timeline_offset); i++) {
                setTimeout(function(){
                    self.timeline_offset++;
                    self.handle_timeline();
                }, (200 * i));
            }
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


    };

    this.show_meta_for = function (ct) {

        $('div[data-ct]').fadeOut(50);
        $('div[data-ct="' + ct + '"]').fadeIn(250);

    };


    this.load_current = function (playing) {

        if(self.debug) {
            console.log('OnAirApp - load_current');
        }

        var obj = {
            emission: [],
            item: [],
            timestamp: playing.time_start,
            time_start: playing.time_start,
            on_air: true,
            el: false
        };

        // first load emission data
        $.get(playing.emission, function (data) {
            if(self.debug) {
                console.log('emission:', data);
            }
            obj.emission = data;
            // then 'item' data
            $.get(playing.item + '?includes=label', function (data) {
                if(self.debug) {
                    console.log('item:', data);
                }
                obj.item = data;

                // reset playing flag
                $.each(self.local_data, function (i, item) {
                    item.on_air = false
                });
                self.local_data.push(obj);
                self.update_data();
            });
        });
    };

    this.load_history = function (limit) {

        var limit = typeof limit !== 'undefined' ? limit : 3;
        var url = self.api_url + self.channel_id + '/' + 'history/';

        $.get(url, function (history) {

            history.objects.splice(limit);

            $.each(history.objects, function (i, item) {
                if (item.el == undefined) {
                    item.el = false;
                }
                if (item.on_air == undefined) {
                    item.on_air = false;
                }
                self.local_data.unshift(item);
            });

            self.complete_data();
        });

    };

    /**
     * completes dataset via API.
     * if resource data in json is a string (url) it fetches these data and
     * replaces it with the returned object
     */
    this.complete_data = function () {

        if(self.debug) {
            console.log('OnAirApp - complete_data');
        }

        $.each(self.local_data, function (i, item) {

            if (typeof item.emission == 'string') {
                $.get(item.emission, function (data) {
                    self.local_data[i].emission = data;
                    //self.update_data();
                });
            }

            if (typeof item.item == 'string') {
                $.get(item.item + '?includes=label', function (data) {
                    self.local_data[i].item = data;
                    //self.update_data();
                });
            }

        });

        // TODO: implement some sort of queing here
        setTimeout(function () {
            if(self.debug) {
                console.log(self.local_data);
            }
            self.update_data();
        }, 2000);

    };


    this.update_data = function () {

        if(self.debug) {
            console.log('OnAirApp - update_data', self.local_data);
        }

        // clean 'old' data
        self.local_data.splice(0, self.local_data.length - self.max_items);

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

                try {
                    var html = $(nj.render('onair/nj/item.html', {
                        dom_id: dom_id,
                        debug: self.debug,
                        object: item,
                        extra_classes: classes,
                        base_url: self.base_url
                    }));
                } catch(e) {
                    var html = $('<div>ERROR</div>');
                    if(self.debug) {
                        console.warn(e);
                        console.warn(item);
                    }
                }


                $('.info-container .items').append(html)

                item.el = $('#' + dom_id);

            } else {
                //item.el.fadeOut(5000)
            }
        });

        // handle own timeline
        setTimeout(function () {
            self.handle_timeline();
        }, 5)

        // handle pplayer history display
        self.bplayer.set_playlist(self.local_data);


    };

    /**
     * Updates metadata display, playlist, artist etc.
     * sets corresponding names & links
     * @param item
     */
    this.update_meta_display = function (item, fast) {


        if (fast == undefined) {
            var fast = false;
        }

        self.meta_container.fadeOut(100);
        var html = $(nj.render('onair/nj/meta.html', {
            object: item,
            base_url: self.base_url
        }));


        if (fast) {
            setTimeout(function () {
                self.meta_container.html(html);
                self.meta_container.fadeIn(1);
            }, 1);
        } else {
            setTimeout(function () {
                self.meta_container.html(html);
                self.meta_container.fadeIn(1);
            }, 1);
        }


    };

    this.update_rating_display = function (item) {

        console.log('update_rating_display', item)

        self.rating_container.removeClass('disabled');
        // set current values
        $('.vote-up a > span', self.rating_container).html(item.item.votes.up);
        $('.vote-down  a > span', self.rating_container).html(item.item.votes.down);


    };

    /**
     * handles timeline display: prev/next etc.
     */
    this.handle_timeline = function () {

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

        // TODO: think about a more elegant solution
        if (self.timeline_offset == 0) {
            self.set_mode('onair');
        } else {
            self.set_mode('history');
        }
        current_index = onair_index + self.timeline_offset;

        if (!onair && self.timeline_offset == 0) {
            self.set_mode('fallback');
        } else if(!onair && self.timeline_offset != 0) {
            self.set_mode('history');
        }


        // apply classes based on offset
        $.each(self.local_data, function (i, item) {

            item.el.removeClass().addClass('item info');
            if (i < current_index) {
                item.el.addClass('previous');
                item.el.addClass('previous-' + Math.abs(current_index - i));

                if(self.debug) {
                    console.debug('index / prev:', Math.abs(current_index - i));
                }

                if (Math.abs(current_index - i) > 3) {
                    item.el.addClass('previous-x');
                }
            }
            if (i == current_index) {
                item.el.addClass('current');
                self.current_item = item;
                self.update_meta_display(item, false);
                self.update_rating_display(item);
            }
            if (i > current_index) {
                item.el.addClass('next');
                item.el.addClass('next-' + Math.abs(current_index - i));

                if (Math.abs(current_index - i) > 1) {
                    item.el.addClass('next-x');
                }
            }

            if(item.on_air) {
                item.el.addClass('onair');
            } else {
                item.el.addClass('history');
            }

        });

        // handle prev/next actions
        if(self.debug) {
            console.debug('OnAirApp - current_index', current_index + 1, 'num_items', num_items);
        }

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

            self.update_rating_display(self.current_item);

        });

    };






};
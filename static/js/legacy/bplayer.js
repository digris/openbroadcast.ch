
import buzz from 'buzz';

// nunjucks template handling
import nunjucks from 'nunjucks';
import nunjucks_register_filters from './nunjucks/filters';
const env = nunjucks.configure('/static', { autoescape: false });
const nj = nunjucks_register_filters(env);

// legacy util
import { removeA } from './utils'


const DEBUG = false;

var BPlayerApp = function () {

    var self = this;
    this.debug = false;
    this.state = 'init';
    this.onair;
    this.container;
    this.playlist_container;

    this.static_url;
    this.playlist = [];
    this.current_index = 0;
    this.current_uuid;
    this.playing_uuids = [];
    this.current_sound = false;
    this.last_sound_url = false;
    this.stream_url = 'https://www.openbroadcast.org/stream/openbroadcast-320.mp3';
    this.base_url;
    this.style = 'large';
    this.states = ['init', 'ready', 'playing', 'stopped', 'paused', 'buffering', 'loading', 'error'];
    this.history_expanded = false;

    this.source; // 'live' or 'ondemand'

    this.init = function () {

        if (self.debug) {
            console.log('BPlayerApp - init');
        }

        self.container = $('#bplayer_container');
        self.playlist_container = $('#bplayer_playlist_container', self.container);

        self.bindings();
    };


    this.events = {

        // handlers for sound events as they're started/stopped/played
        play: function () {
            self.state_change('playing');
        },
        stop: function () {
            self.state_change('stopped');
        },
        pause: function () {
            self.state_change('paused');
        },
        resume: function () {
            self.state_change('playing');
        },
        finish: function () {
            //self.state_change('stopped');
            self.state_change('paused');
            self.controls({action: 'next'});
        },
        whileloading: function (e) {
            self.state_change('loading');
            self.loading(this);
        },
        whileplaying: function (e) {
            // TODO: readyState needed?
            if (this.readyState == 3) {
                self.state_change('playing');
            }
            self.progress(this);
        },
        onload: function () {

        }
    };

    this.bindings = function () {


        if (self.debug) {
            console.log('BPlayerApp - bindings');
        }

        /*****************************************************************************
         * generic actions
         *****************************************************************************/


        /*****************************************************************************
         * player controls. triggered by various apps.
         * ! moving controls triggered by 'on-air app' out of local bindings
         *****************************************************************************/
        /**/
        $(document).on('click', 'a[data-bplayer-controls]', function (e) {

            e.preventDefault();

            var action = $(this).data('bplayer-controls');
            var index = $(this).parents('.item').index() - 1;

            if (action == 'play') {
                self.controls({action: 'play', index: index});
                self.onair.handle_pagination(index);
            }

            if (action == 'pause') {
                self.controls({action: 'pause'});
            }

            if (action == 'resume') {
                self.controls({action: 'play'});
            }

        });


        // player display
        $(document).on('click', 'a[data-bplayer-display]', function (e) {
            e.preventDefault();
            var action = $(this).data('bplayer-display');


            if (self.debug) {
                console.debug('bplayer-display: ' + action);
            }

            // player size
            if (action == 'compact') {
                self.style_change(action);
            }
            if (action == 'large') {
                self.style_change(action);
            }

            if (action == 'toggle-history') {
                self.history_expanded = !self.history_expanded;
                self.show_hide_history();
            }

        });


        // playhead actions
        $(self.container).on('click', '.playhead .handler', function (e) {

            e.preventDefault();

            var outer_width = $(this).css('width').slice(0, -2);
            var base_width = outer_width;

            var pos = util.get_position(e);
            var position = pos['x'] / (base_width);
            var uuid = $(this).parents('.item').data('uuid');

            // trigger control
            var control = {
                action: 'seek',
                position: position,
                uuid: uuid
            };

            //self.controls(control);

        });


        // progress actions / seek
        $(document).on('click', '.playing .progress', function (e) {

            e.preventDefault();


            var outer_width = $(this).css('width').slice(0, -2);
            var base_width = outer_width;

            var pos = util.get_position(e);
            var position = pos['x'] / (base_width);


            /**/
            var uuid = $(this).parents('.item').data('uuid');

            // trigger control
            var control = {
                action: 'seek',
                position: position,
                uuid: uuid
            };

            self.controls(control);

        });

    };

    this.state_change = function (state) {

        if (self.debug) {
            console.log('BPlayerApp - state changed to: ' + state);
        }

        var classes_to_remove = removeA(self.states.slice(0), state).join(' ');
        self.container.addClass(state).removeClass(classes_to_remove);
        self.state = state;

        $('body').data('bplayer_state', state).addClass(state).removeClass(classes_to_remove);;

    };

    this.style_change = function (style) {
        self.style = style;
        self.container.removeClass('style-large style-compact').addClass('style-' + style)
    };


    this.show_hide_history = function () {

        if (self.history_expanded) {
            self.container.addClass('show-history');
            //$('body').addClass('no-scroll');
        } else {
            self.container.removeClass('show-history');
            //$('body').removeClass('no-scroll');
        }

        self.update_player(false)

    };


    // TODO: called from 'onair' app. should eventually be done differently
    this.set_playlist = function (playlist, opts) {

        playlist = playlist.slice();
        playlist.reverse();

        if (self.debug) {
            console.debug('BPlayerApp - set_playlist', playlist, opts);
        }
        self.playlist = playlist;


    };

    this.controls = function (control) {

        if (self.debug) {
            console.info('BPlayerApp - control: ', control);
        }

        if (control.action == 'play') {


            // TODO: handle situation with not existing index [fallback mode]
            if (control.index == undefined) {
                // offline situation
                if (self.debug) {
                    console.debug('no item, assuming offline mode');
                }
                url = self.stream_url;
            } else {

                var item = self.playlist[control.index];
                self.current_index = control.index;

                var emission = item.emission;
                var media = item.item;

                var url;

                if (item.onair) {
                    if (self.debug) {
                        console.debug('item on-air');
                    }
                    url = self.stream_url;
                } else {
                    if (self.debug) {
                        console.debug('item on-demand');
                    }
                    url = media.stream.uri;
                }
            }
            self.play_file(url);
        }


        if (control.action == 'seek') {

            // check if already in buffer
            var seekable = self.current_sound.getSeekable();
            var abs_time = self.current_sound.getDuration() * control.position;

            if (self.debug) {
                console.debug('seek', seekable[0]);
            }

            if(abs_time >= seekable[0].start && abs_time <= seekable[0].end) {
                self.current_sound.setTime(abs_time)
            }

        }


        /*
         * attention! 'next' is actually the previous one in our case
         */
        if (control.action == 'next') {
            if (self.current_index >= 1) {

                var index = self.current_index - 1;
                self.controls({action: 'play', index: index});

                // TODO: kind of hackish - hooking to pagination
                self.onair.handle_pagination(index);

            } else {
                if (self.debug) {
                    console.log('no previous items');
                }
            }
        }


        if (control.action == 'stop') {
            self.current_sound.stop();
        }
        if (control.action == 'pause') {
            self.current_sound.pause();
        }
        if (control.action == 'resume') {
            self.current_sound.resume();
        }

        self.update_player();

    };


    /**
     * wrapper around buzz
     * @param {string} url
     */
    this.play_file = function (url) {

        console.debug('BPlayerApp - play_file: ', url);

        if(self.last_sound_url && self.last_sound_url == url) {
            self.current_sound.play();
            return;
        }

        if(self.current_sound) {
            self.current_sound.stop();
            delete(self.current_sound);
        }

        self.current_sound = new buzz.sound(url, {
              preload: true,
              webAudioApi: false
        });

        // event bindings
        self.current_sound.bind("waiting", self.events.whileloading);
        self.current_sound.bind("timeupdate", self.events.whileplaying);
        self.current_sound.bind("playing", self.events.play);
        self.current_sound.bind("pause", self.events.pause);
        self.current_sound.bind("play", self.events.resume);
        self.current_sound.bind("play", self.events.play);
        self.current_sound.bind("ended", self.events.finish);

        self.current_sound.bind("waiting", function(e){
            console.log('waiting:', e);
        });

        self.current_sound.play().fadeIn(500);

        self.last_sound_url = url;

    };



    this.progress = function (sound) {

        var pos = sound.getPercent() / 100.0;
        var width = $('.playhead', self.container).width();

        $('.playhead .indicator', self.container).css('background-position-x', (pos * width) + 'px');

        // TODO: make efficient selector
        $('.playing .progress > .meter').css('width', (pos * 100) + '%');

    };

    this.loading = function (data) {

        var pos = data.bytesLoaded / data.bytesTotal;
        var width = $('.playhead', self.container).width();

        $('.playing .progress > .buffer').css('width', (pos * 100) + '%');

    };

    this.update_player = function (reindex) {

        if (self.debug) {
            console.debug('BPlayerApp - update_player', reindex);
        }

        if (reindex != undefined && self.current_uuid != undefined && self.current_index != 0) {
            $.each(self.playlist, function (i, el) {
                if (i > 0 && el.item.uuid == self.current_uuid) {
                    self.current_index = i;
                }
            });
        }

        var media = self.playlist[self.current_index];

        if (media != undefined) {

            // waveform data
            $('#bplayer_waveform_container', self.container).html(nj.render('bplayer/nj/waveform.html', {
                object: media
            }));

            // 'currently playing' data
            $('#bplayer_info_container', self.container).html(nj.render('bplayer/nj/playing.html', {
                object: media
            }));

            // playlist content
            // TODO: maybe refactor to only update if panel is enabled/visible

            if(self.history_expanded) {
                var playlist_template = 'bplayer/nj/playlist_expanded.html';
            } else {
                var playlist_template = 'bplayer/nj/playlist_compact.html';
            }

            $('#bplayer_playlist_container', self.container).html(nj.render(playlist_template, {
                objects: self.playlist,
                opts: {
                    onair: self.onair.is_onair,
                    mode: self.onair.mode
                }
            }));

            // update summary
            var totals = {
                index: self.current_index + 1,
                num_tracks: self.playlist.length,
                duration: self.playlist.length * 60
            };

            $('#totals_container', self.container).html(nj.render('bplayer/nj/totals.html', {
                data: totals
            }));


            // collect playing uuids
            // TODO: rework, not needed here
            var uuids = [];
            try {
                uuids.push(media.item.uuid);
            } catch (e) {
                console.warn(e)
            }

            self.playing_uuids = uuids;


            try {
                self.current_uuid = media.item.uuid;
            } catch (e) {
                self.current_uuid = undefined;
            }


            // hack - mark 'onair' as playing
            // TODO: investigate! this breaks onair player
            if (media.onair) {
                setTimeout(function () {
                    $('.item.onair').addClass('playing');
                    //$('.item.onair', self.container).addClass('playing');
                }, 1)
            }

            self.set_states_by_uuid(uuids, {
                clear: 'playing',
                set: 'playing'
            });


        } else {
            if (self.debug) {
                console.debug('bplayer - no playlist available');
            }
        }

    };

    this.set_states_by_uuid = function (uuids, options) {
        if(options && options.clear !== undefined) {
            $('[data-uuid]').removeClass(options.clear);
        }
        if(options && options.set !== undefined) {
            $.each(uuids, function (i, el) {
                $('[data-uuid="' + el + '"]').addClass(options.set);
            });
        }
    };



};


module.exports = BPlayerApp;

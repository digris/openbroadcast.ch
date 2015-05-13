;
var BPlayerApp = function () {

    var self = this;
    this.debug = false;
    this.state = 'init';
    // dom containers
    this.container;
    this.playlist_container;
    this.static_url;
    this.playlist = [];
    this.current_index = 0;
    this.current_uuid;
    this.playing_uuids = [];
    this.sm2;
    this.current_sound;
    this.stream_url;
    //this.stream_url = 'http://stream.openbroadcast.ch:80/openbroadcast';
    //this.stream_url = 'http://pypo:8000/master.mp3';
    this.r;
    this.style = 'large'
    this.states = ['init', 'ready', 'playing', 'stopped', 'paused', 'buffering', 'loading', 'error'];
    this.history_expanded = false;

    /*
     * inline: complete html5-player, site needs to run entirely via ajax
     * popup:  popup-mode, inidactes the 'remote' component of the player
     * local:  popup-mode, inicates the local = calling = main-webiste part (connecting to the popup part)
     */
    this.mode = 'inline'; // available: 'inline', 'popup', 'local'
    this.popup = false;
    this.local = false;


    this.init = function () {

        if(self.debug) {
            console.log('BPlayerApp - init');
        }

        self.container = $('#bplayer_container');
        self.playlist_container = $('#bplayer_playlist_container', self.container);

        // setup player backend

        soundManager.defaultOptions = {
            multiShot: false,
            debugMode: self.debug,
            debugFlash: self.debug,
            //useConsole: self.debug
            useConsole: false
        };
        //soundManager.debugFlash = self.debug;
        //soundManager.debugMode = self.debug;
        //soundManager.useConsole = self.debug;

        if(self.mode == 'inline' || self.mode == 'popup') {
            self.sm2 = self.init_sm2();
        }

        self.bindings();
    };


    this.init_sm2 = function() {

        if(self.debug) {
            console.log('BPlayerApp - init_sm2');
        }

         return soundManager.setup({
            url: self.static_url + 'bplayer/swf/lib/soundmanager2_flash9_debug.swf',
            flashVersion: 9,
            preferFlash: false,
            debugMode: self.debug,
            debugFlash: self.debug,
            //useConsole: self.debug,
            useConsole: false,
            onready: function () {

                self.current_sound = soundManager.createSound({
                    autoLoad: true,
                    autoPlay: false,
                    stream: true,
                    onplay: self.events.play,
                    onstop: self.events.stop,
                    onpause: self.events.pause,
                    onresume: self.events.resume,
                    onfinish: self.events.finish,
                    whileloading: self.events.whileloading,
                    whileplaying: self.events.whileplaying,
                    onload: self.events.onload,
                    volume: 80
                });

                self.state_change('ready');
            }
        });

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
            self.state_change('stopped');
            self.controls({action: 'next'});
        },
        whileloading: function () {
            if(this.readyState == 1) {
                self.state_change('loading');
            }
            self.loading(this);
        },
        whileplaying: function () {
            if(this.readyState == 3) {
                self.state_change('playing');
            }
            self.progress(this);
        },
        onload: function () {

        }
    };

    this.state_change = function (state) {

        if(self.debug) {
            //console.log('BPlayerApp - state changed to: ' + state);
        }

        var classes = removeA(self.states.slice(0), state).join(' ');
        self.container.addClass(state).removeClass(classes);
        self.state = state;

        // TODO: not so nice, add state as property to body
        $('body').data('bplayer_state', state);
        $('body').addClass(state).removeClass(classes);

        // TODO: this is a hack!!! implement properly if wished to use!
        if (state == 'paused' || state == 'stopped') {

            var heights = [50, 90, 50, 40, 20, 30, 70];
            $('#levelbridge_icon span').each(function (i, el) {
                $(this).animate({
                    height: heights[i] + '%'
                }, {
                    duration: 1500
                })
            });
        }

    };

    this.style_change = function (style) {
        self.style = style;
        self.container.removeClass('style-large style-compact').addClass('style-' + style)
    };

    this.bindings = function () {

        if(self.debug) {
            console.log('BPlayerApp - bindings');
        }

        /*****************************************************************************
         * generic actions
         *****************************************************************************/
        $('body').on('click', 'a[data-bplayer-action]', function (e) {
            e.preventDefault();

            var action = $(this).data('bplayer-action');
            var uri = $(this).parents('.item').data('resource_uri');
            var ctype = $(this).parents('.item').data('ct');

            $.get(uri, function (data) {

                // content-type based parsers
                if (ctype == 'release') {
                    var playlist = self.parse_release(data);
                }
                if (ctype == 'playlist') {
                    var playlist = self.parse_playlist(data);
                }
                if (ctype == 'media') {
                    var playlist = [data];
                }

                if (action == 'play') {
                    self.set_playlist(playlist);
                    self.controls({action: 'play', index: 0});
                }
                if (action == 'queue') {
                    self.set_playlist(playlist, true);
                    self.update_player();
                    //self.controls({action: 'queue'});
                }

            });
        });

        $('body').on('click', '#bplayer_ios', function (e) {
            e.preventDefault();
            var sound = {
                url: self.stream_url
            }
            self.current_sound.load(sound);
            self.current_sound.play();

        });

        $('__body__').on('click', '[data-action="listen"]', function (e) {
            e.preventDefault();

            var sound = {
                url: self.stream_url
            }
            self.current_sound.load(sound);
            self.current_sound.play();

        });

        /*****************************************************************************
         * playlist actions
         *****************************************************************************/
        $('body').on('click', '#bplayer_playlist_container .item', function (e) {
            e.preventDefault();
            var index = $(this).index();
            self.controls({action: 'play', index: index});

        });

        // player controls
        $('body').on('click', 'a[data-bplayer-controls]', function (e) {
            e.preventDefault();
            var action = $(this).data('bplayer-controls');

            switch(action) {
                case 'listen':
                    var sound = {
                        url: self.stream_url
                    }
                    self.current_sound.load(sound);
                    self.current_sound.play();
                    break;
                default:
                    self.controls({action: action});
            }

        });

        // player display
        $('body').on('click', 'a[data-bplayer-display]', function (e) {
            e.preventDefault();
            var action = $(this).data('bplayer-display');

            if(self.debug) {
                debug.debug('bplayer-display: ' + action);
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
            }

            self.controls(control);

            // self.player.base.controls(args);
        });


    };

    this.attach = function () {

        if(self.debug) {
            console.log('BPlayerApp - attach');
        }

        self.container = $('#bplayer_container');

        // setup player backend
        self.bindings();
        self.update_player();

        self.state_change(self.state);
        self.style_change(self.style);

    };

    this.show_hide_history = function () {
        //var container = $('#bplayer_playlist_container', self.container);
        if (self.history_expanded) {
            //container.removeClass('hidden');
            self.container.addClass('show-history');
        } else {
            //container.addClass('hidden');
            self.container.removeClass('show-history');
        }

    };


    this.set_playlist = function (playlist) {

        playlist = playlist.slice();
        playlist.reverse();

        if(self.debug) {
            console.debug('BPlayerApp - set_playlist', playlist);
        }
        self.playlist = playlist;
        //self.update_player();

        // playlist content
        self.playlist_container.html(nj.render('bplayer/nj/playlist.html', {
            objects: self.playlist
        }));


    };

    this.controls = function (control) {

        if(self.debug) {
            console.log('BPlayerApp - control: ', control);
        }

        if (control.action == 'play') {
            var media = self.playlist[control.index];
            self.current_index = control.index;
            self.play_file(media);
        }

        if (control.action == 'seek') {
            self.current_sound.setPosition(self.current_sound.duration * control.position)
            if (self.current_sound.paused) {
                self.current_sound.resume();
            } else if (self.current_sound.playState == 0) {
                self.current_sound.play();
            }
        }


        if (control.action == 'next') {
            var total = self.playlist.length;
            if (total > (self.current_index + 1)) {
                self.controls({action: 'play', index: self.current_index + 1})
            } else {
                if(self.debug) {
                    console.log('no more items');
                }
            }
        }

        if (control.action == 'prev') {
            if (self.current_index >= 1) {
                self.controls({action: 'play', index: self.current_index - 1})
            } else {
                if(self.debug) {
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

        if(self.debug) {
            console.log('current playlist:', self.playlist);
        }

    };

    this.play_file = function (data) {

        //var url = data.stream.uri;
        var url = data.file;

        // debug
        //url = 'http://media.zhdk.sonicsquirrel.net/Soisloscerdos/Soisloscerdos/SLC08/Angel_Garcia-Happy_Jambo.mp3';
        //url = 'http://media.zhdk.sonicsquirrel.net/toucan_music/tou295/tou295_marc_burt_bungee_jump.mp3';

        try {
            self.current_sound.destruct();
        } catch (e) {
            if(self.debug) {
                debug.debug('unable to destruct sound: ' + e.message);
            }
        }

        if(self.debug) {
            console.log('play_file - current_sound:', self.current_sound);
        }


        if (self.current_sound == undefined) {

            // soundmanager complains with:
            // "Unavailable - wait until onready() has fired"

            // create sound object
            self.current_sound = soundManager.createSound({
                url: decodeURI(url),
                autoLoad: true,
                autoPlay: false,
                stream: true,
                onplay: self.events.play,
                onstop: self.events.stop,
                onpause: self.events.pause,
                onresume: self.events.resume,
                onfinish: self.events.finish,
                whileloading: self.events.whileloading,
                whileplaying: self.events.whileplaying,
                onload: self.events.onload,
                volume: 80
            });

            self.current_sound.play();

        } else {
            self.current_sound.load({url: url}).play();
        }

        self.update_player();
    };

    this.progress = function (data) {

        //console.log(data);

        //console.log('pos: ' + data.position + ' : duration: ' + data.duration);
        var pos = data.position / data.duration;
        var width = $('.playhead', self.container).width();

        $('.playhead .indicator', self.container).css('background-position-x', pos * width + 'px');

        //$('.progress > .meter', self.container).css('width', pos + '%');

    };

    this.loading = function (data) {
        var pos = data.bytesLoaded / data.bytesTotal;
        var width = $('.playhead', self.container).width();
        $('.playhead .loading', self.container).css('background-position-x', pos * width + 'px');
    };

    this.update_player = function () {
        // get current sound

        var media = self.playlist[self.current_index];


        if (media != undefined) {

            debug.debug('update_player:', media);

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
            $('#bplayer_playlist_container', self.container).html(nj.render('bplayer/nj/playlist.html', {
                objects: self.playlist
            }));


            // update summary
            var totals = {
                index: self.current_index + 1,
                num_tracks: self.playlist.length,
                duration: self.playlist.length * 60
            }
            $('#totals_container', self.container).html(nj.render('bplayer/nj/totals.html', {
                data: totals
            }));


            // collect playing uuids
            var uuids = [];

            try {
                uuids.push(media.uuid);
                if (media.release) {
                    uuids.push(media.release.uuid);
                }
                if (media.artist) {
                    uuids.push(media.artist.uuid);
                }
            } catch (e) {

            }

            self.playing_uuids = uuids;
            self.mark_by_uuid();


        } else {
            if(self.debug) {
                debug.debug('bplayer - no playlist available');
            }
        }


    };

    this.mark_by_uuid = function () {
        $('[data-uuid]').removeClass('playing');
        $(self.playing_uuids).each(function (i, el) {
            setTimeout(function () {
                $('[data-uuid="' + el + '"]').addClass('playing');
            }, 1);
        });
    };

};


BPlayerApp.prototype.parse_release = function (data) {
    var playlist = [];

    if(self.debug) {
        console.log('release-data:', data);
    }

    playlist = data.media;

    if(self.debug) {
        console.log('playlist', playlist);
    }

    return playlist;

};



BPlayerApp.prototype.parse_playlist = function (data) {
    var playlist = [];

    if(self.debug) {
        console.log('playlist-data:', data);
    }

    media_ids = [];

    $.each(data.items, function(i, item) {
        media_ids.push(item.item.content_object.id);
    });


    $.ajax({
        type: "GET",
        url: '/api/v1/track/?id__in=' + media_ids.join(','),
        async: false
    }).done(function(data) {
        playlist = data.objects;
    });

    if(self.debug) {
        console.log('playlist', playlist);
    }


    return playlist;

};


BPlayerApp.prototype.init_waveform = function () {

};




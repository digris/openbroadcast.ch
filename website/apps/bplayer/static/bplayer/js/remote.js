/**
 * BPlayerApp
 * _remote_ component
 */
var bplayer_loaded;
var BPlayerApp = function () {

    var self = this;
    this.state = 'init';
    this.static_url;
    this.playlist = [];
    this.current_index = 0;
    this.current_uuid;
    this.playing_uuids = [];
    this.sm2;
    this.current_sound;
    this.r;
    this.style = 'large'
    this.states = ['init', 'ready', 'playing', 'stopped', 'paused', 'loading', 'error'];
    this.playlist_expanded = false;

    this.remote = false; // holds player ref
    this.remote_window = false; // holds window ref

    /*
     * inline: complete html5-player, site needs to run entirely via ajax
     * popup:  popup-mode, indicates the 'remote' component of the player
     * local:  popup-mode, indicates the local = calling = main-webiste part (connecting to the popup part)
     */
    this.mode = 'remote'; // available: 'inline', 'remote', 'local'
    this.popup = false;
    this.local = false;

    this.container;

    this.init = function () {
        console.log('BPlayerApp - init');
        console.log('BPlayerApp mode: ' + self.mode)

        self.container = $('#bplayer_container');

        // setup player backend

        soundManager.defaultOptions = {
            multiShot: false
        };

        if (self.mode == 'inline' || self.mode == 'remote') {
            self.sm2 = self.init_sm2();
        }

        if (self.mode == 'local') {
            self.sm2 = self.init_remote_sm2();
        }

        self.bindings();

        window.opener.bplayer.remote = self;
        setInterval(function () {
            // heartbeat to main window
            //console.log('beat');
            if (window.opener && !window.opener.closed) {
                //console.log('still here -> bind player');

                // check state
                if (window.opener.bplayer && !window.opener.bplayer.remote) {
                    console.log('remote not set -> bind!')
                    window.opener.bplayer.remote = self;
                    self.remote = window.opener.bplayer;
                    self.remote.update_player();

                } else {
                    //console.log('remote player already here -> nothing to do')
                }

            } else {
                //console.log('gone -> re-attach & bind');
            }
        }, 50);


    };


    this.init_sm2 = function () {

        console.log('BPlayerApp - init_sm2');

        return soundManager.setup({
            url: self.static_url + 'bplayer/swf/lib/soundmanager2_flash9_debug.swf',
            flashVersion: 9,
            preferFlash: false,
            debugMode: false,
            useConsole: false,
            //debugFlash: true,
            onready: function () {
                console.log('sm2 ready');

                // flag window as loaded
                bplayer_loaded = true;

                /*
                self.current_sound = soundManager.createSound({
                    autoLoad: true,
                    autoPlay: false,
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
                */

                self.state_change('ready');
            }
        });

    };

    this.init_remote_sm2 = function () {

        console.log('BPlayerApp - init_remote_sm2');

    };

    this.get_remote_window = function () {
        var params = [
            'status=yes',
            'height=500'
        ];
        var win = window.open('', 'bplayer', params.join(','));

        if (typeof (win.loaded) == 'undefined') {
            console.log('window not ready, loading initial url');
            win.location.href = '/player/base';
        } else {
            console.log('window ready');
        }

        self.remote_window = win;
    }


    this.events = {

        // handlers for sound events as they're started/stopped/played
        play: function () {
            self.state_change('playing');
            try {
                self.remote.state_change('playing');
            } catch(e) {
                console.log(e);
            }
        },
        stop: function () {
            self.state_change('stopped');
            try {
                self.remote.state_change('stopped');
            } catch(e) {
                console.log(e);
            }
        },
        pause: function () {
            self.state_change('paused');
            try {
                self.remote.state_change('paused');
            } catch(e) {
                console.log(e);
            }
        },
        resume: function () {
            self.state_change('playing');
            try {
                self.remote.state_change('playing');
            } catch(e) {
                console.log(e);
            }
        },
        finish: function () {
            self.state_change('stopped');
            self.controls({action: 'next'});
            try {
                self.remote.state_change('stopped');
                self.remote.controls({action: 'next'});
            } catch(e) {
                console.log(e);
            }
        },
        whileloading: function () {
            self.loading(this);
            try {
                self.remote.loading(this)
            } catch(e) {
                console.log(e);
            }
        },
        whileplaying: function () {
            // self.state_change('playing');
            self.progress(this);
            try {
                self.remote.progress(this);
            } catch(e) {
                console.log(e);
            }
        },
        onload: function () {

        }
    };

    this.state_change = function (state) {

        console.log('BPlayerApp - state changed to: ' + state);
        var classes = removeA(self.states.slice(0), state).join(' ');

        self.container.addClass(state).removeClass(classes);

        self.state = state;

    };

    this.style_change = function (style) {
        self.style = style;
        self.container.removeClass('style-large style-compact').addClass('style-' + style)
    };

    this.bindings = function () {
        console.log('BPlayerApp - bindings');


        /*****************************************************************************
         * generic actions
         *****************************************************************************/
        $('body').on('click', 'a[data-bplayer-action]', function (e) {
            e.preventDefault();

            var action = $(this).data('bplayer-action');
            var uri = $(this).parents('.item').data('resource_uri');
            var ctype = $(this).parents('.item').data('ct');

            self.get_remote_window();

            /*
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
             */
        });


        $('body').on('click', '#bplayer_ios', function (e) {
            e.preventDefault();
            self.current_sound.load({url: 'http://media.zhdk.sonicsquirrel.net/Section27/[S27-128]%20XZICD%20-%20You%20Will%20Die%20And%20No%20One%20Will%20Cry!/MP3/01%20Prevues%20Of%20Coming%20Attractions.mp3'});
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
            self.controls({action: action});
        });

        // player display
        $('body').on('click', 'a[data-bplayer-display]', function (e) {
            e.preventDefault();
            var action = $(this).data('bplayer-display');

            debug.debug('bplayer-display: ' + action);

            // player size
            if (action == 'compact') {
                self.style_change(action);
            }
            if (action == 'large') {
                self.style_change(action);
            }
            if (action == 'toggle-playlist') {
                self.playlist_expanded = !self.playlist_expanded;
                self.show_hide_playlist();
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

        console.log('BPlayerApp - attach');

        self.container = $('#bplayer_container');
        // setup player backend
        self.bindings();
        self.update_player();

        self.state_change(self.state);
        self.style_change(self.style);


    };

    this.show_hide_playlist = function () {
        var container = $('#bplayer_playlist_container', self.container);

        if (self.playlist_expanded) {
            container.removeClass('hidden');
        } else {
            container.addClass('hidden');
        }

    };


    this.set_playlist = function (playlist, append) {
        if (append == undefined) {
            self.playlist = playlist;
        } else {
            self.playlist = self.playlist.concat(playlist)
            debug.debug('appending playlist - aka "queue"');
            console.log('new list:', self.playlist);
        }
    };

    this.controls = function (control) {

        console.log('BPlayerApp - control: ', control);


        // get player


        if (control.action == 'play') {
            var media = self.playlist[control.index];
            self.current_index = control.index;
            self.play_file(media);
        }

        if (control.action == 'seek') {

            // check if already loaded so far
            var seek_to = self.current_sound.duration * control.position;
            if(self.current_sound.duration != undefined && seek_to < self.current_sound.duration) {
                self.current_sound.setPosition(seek_to);
            } else {
                // alert('position lot loaded yet')
            }

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
                console.log('no more items');
            }
        }

        if (control.action == 'prev') {
            if (self.current_index >= 1) {
                self.controls({action: 'play', index: self.current_index - 1})
            } else {
                console.log('no previous items');
            }
        }


        if (control.action == 'pause') {
            self.current_sound.pause();
        }
        if (control.action == 'resume') {
            self.current_sound.resume();
        }

        console.log('current playlist:', self.playlist);

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
            debug.debug('unable to destruct sound: ' + e.message);
        }

        console.log('play_file - current_sound:', self.current_sound);


        if (self.current_sound == undefined) {

            // soundmanager complains with:
            // "Unavailable - wait until onready() has fired"

            // create sound object
            self.current_sound = soundManager.createSound({
                url: decodeURI(url),
                autoLoad: true,
                autoPlay: false,
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

        if (self.remote) {
            self.remote.progress(data);
        }


    };

    this.loading = function (data) {
        var pos = data.bytesLoaded / data.bytesTotal;
        var width = $('.playhead', self.container).width();
        $('.playhead .loading', self.container).css('background-position-x', pos * width + 'px');
    };

    this.update_player = function () {
        // get current sound

        // hack!
        if(!self.remote) {
            try{
                self.remote = window.opener.bplayer;
            } catch (e) {
                console.log('error with remote window:', e);
            }
        }

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


            if ($('#bplayer_message_container').length) {
                $('#bplayer_message_container').hide();
            }

            if ($('#bplayer_image_container').length) {
                $('#bplayer_image_container').html(nj.render('bplayer/nj/image.html', {
                    object: media
                }));
                setTimeout(function () {
                    $('#bplayer_image_container').foundation({
                        orbit: {
                            animation: 'fade',
                            timer_speed: 20000,
                            slide_number: false,
                            pause_on_hover: true,
                            animation_speed: 3000,
                            navigation_arrows: false,
                            bullets: false
                        }
                    });
                    $('#bplayer_image_container ul > li:first-child').addClass('active');
                    //$('#bplayer_image_container').foundation('orbit');
                    //$('#bplayer_image_container').foundation('orbit', 'reflow');
                }, 5)
            }

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
            debug.debug('bplayer - no playlist available');
        }


        if (self.remote) {
            console.log('update remote player!');
            self.remote.update_player();
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
    console.log('release-data:', data);
    playlist = data.media;

    console.log('playlist', playlist);

    return playlist;

};


BPlayerApp.prototype.parse_playlist = function (data) {
    var playlist = [];
    console.log('playlist-data:', data);
    media_ids = [];

    $.each(data.items, function (i, item) {

        media_ids.push(item.item.content_object.id);
    });


    $.ajax({
        type: "GET",
        url: '/api/v1/track/?id__in=' + media_ids.join(','),
        async: false
    }).done(function (data) {
            playlist = data.objects;
        });

    console.log('playlist', playlist);


    return playlist;

};


BPlayerApp.prototype.init_waveform = function () {

};




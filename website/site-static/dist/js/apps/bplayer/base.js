var BPlayerApp;

BPlayerApp = (function() {
  function BPlayerApp(debug) {
    this.debug = debug;
    this.state = 'init';
    this.static_url = null;
    this.playlist = [];
    this.current_index = 0;
    this.current_uuid = null;
    this.playing_uuids = [];
    this.current_sound = null;
    this.source = null;
    this.states = ['init', 'ready', 'playing', 'stopped', 'paused', 'buffering', 'loading', 'error'];
    this.container = $('#bplayer_container');
    this.playlist_container = $('#bplayer_playlist_container');
  }

  BPlayerApp.prototype.events = {
    play: function() {
      BPlayerApp.state_change('playing');
    },
    stop: function() {
      BPlayerApp.state_change('stopped');
    },
    pause: function() {
      BPlayerApp.state_change('paused');
    },
    resume: function() {
      BPlayerApp.state_change('playing');
    },
    finish: function() {
      BPlayerApp.state_change('stopped');
      BPlayerApp.controls({
        action: 'next'
      });
    },
    whileloading: function(e) {
      console.debug('the @', BPlayerApp);
      BPlayerApp.state_change('loading');
    },
    whileplaying: function(e) {
      if (BPlayerApp.readyState === 3) {
        BPlayerApp.state_change('playing');
        return;
      }
    },
    onload: function() {}
  };

  BPlayerApp.prototype.controls = function(control) {
    var abs_time, emission, index, item, media, seekable, url;
    if (this.debug) {
      console.info('BPlayerApp - control: ', control);
    }
    if (control.action === 'play') {
      if (control.index === void 0) {
        if (this.debug) {
          console.debug('no item, assuming offline mode');
        }
        url = this.stream_url;
      } else {
        item = this.playlist[control.index];
        this.current_index = control.index;
        emission = item.emission;
        media = item.item;
        url = void 0;
        if (item.onair) {
          if (this.debug) {
            console.debug('item on-air');
          }
          url = this.stream_url;
        } else {
          if (this.debug) {
            console.debug('item on-demand');
          }
          url = media.stream.uri;
        }
      }
      this.play_file(url);
    }
    if (control.action === 'seek') {
      seekable = this.current_sound.getSeekable();
      abs_time = this.current_sound.getDuration() * control.position;
      if (this.debug) {
        console.debug('seek', seekable[0]);
      }
      if (abs_time >= seekable[0].start && abs_time <= seekable[0].end) {
        this.current_sound.setTime(abs_time);
      }
    }

    /*
     * attention! 'next' is actually the previous one in our case
     */
    if (control.action === 'next') {
      if (this.current_index >= 1) {
        index = this.current_index - 1;
        this.controls({
          action: 'play',
          index: index
        });
        onair.handle_pagination(index);
      } else {
        if (this.debug) {
          console.log('no previous items');
        }
      }
    }
    if (control.action === 'stop') {
      this.current_sound.stop();
    }
    if (control.action === 'pause') {
      this.current_sound.pause();
    }
    if (control.action === 'resume') {
      this.current_sound.resume();
    }
    this.update_player();
  };

  BPlayerApp.prototype.play_file = function(url) {
    console.debug('BPlayerApp - play_file: ', url);
    if (this.last_sound_url && this.last_sound_url === url) {
      this.current_sound.play();
      return;
    }
    if (this.current_sound) {
      this.current_sound.stop();
      delete this.current_sound;
    }
    this.current_sound = new buzz.sound(url, {
      preload: true,
      webAudioApi: false
    });
    this.current_sound.bind('waiting', this.events.whileloading);
    this.current_sound.bind('timeupdate', this.events.whileplaying);
    this.current_sound.bind('playing', this.events.play);
    this.current_sound.bind('pause', this.events.pause);
    this.current_sound.bind('play', this.events.resume);
    this.current_sound.bind('play', this.events.play);
    this.current_sound.bind('ended', this.events.finish);
    this.current_sound.bind('waiting', function(e) {
      console.log('waiting:', e);
    });
    this.current_sound.play().fadeIn(500);
    this.last_sound_url = url;
  };

  BPlayerApp.prototype.state_change = function(state) {
    var classes_to_remove;
    if (this.debug) {
      console.log('BPlayerApp - state changed to: ' + state);
    }
    classes_to_remove = removeA(this.states.slice(0), state).join(' ');
    this.container.addClass(state).removeClass(classes_to_remove);
    this.state = state;
    $('body').data('bplayer_state', state);
    $('body').addClass(state).removeClass(classes_to_remove);
    return state;
  };

  BPlayerApp.prototype.set_playlist = function(playlist, opts) {
    playlist = playlist.slice();
    playlist.reverse();
    if (this.debug) {
      console.debug('BPlayerApp - set_playlist', playlist, opts);
    }
    this.playlist = playlist;
    return playlist;
  };

  BPlayerApp.prototype.update_player = function(reindex) {
    if (this.debug) {
      return console.debug('BPlayerApp - update_player', reindex);
    }
  };

  return BPlayerApp;

})();

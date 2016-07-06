var BPlayerApp;

BPlayerApp = function() {
  var self;
  self = this;
  this.debug = false;
  this.state = 'init';
  this.container;
  this.playlist_container;
  this.static_url;
  this.playlist = [];
  this.current_index = 0;
  this.current_uuid;
  this.playing_uuids = [];
  this.current_sound = false;
  this.last_sound_url = false;
  this.stream_url;
  this.base_url;
  this.style = 'large';
  this.states = ['init', 'ready', 'playing', 'stopped', 'paused', 'buffering', 'loading', 'error'];
  this.history_expanded = false;
  this.source;
  this.init = function() {
    if (self.debug) {
      console.log('BPlayerApp - init');
    }
    self.container = $('#bplayer_container');
    self.playlist_container = $('#bplayer_playlist_container', self.container);
    self.bindings();
  };
  this.events = {
    play: function() {
      self.state_change('playing');
    },
    stop: function() {
      self.state_change('stopped');
    },
    pause: function() {
      self.state_change('paused');
    },
    resume: function() {
      self.state_change('playing');
    },
    finish: function() {
      self.state_change('stopped');
      self.controls({
        action: 'next'
      });
    },
    whileloading: function(e) {
      self.state_change('loading');
      self.loading(this);
    },
    whileplaying: function(e) {
      if (this.readyState === 3) {
        self.state_change('playing');
      }
      self.progress(this);
    },
    onload: function() {}
  };
  this.bindings = function() {
    if (self.debug) {
      console.log('BPlayerApp - bindings');
    }

    /*****************************************************************************
     * generic actions
    #***************************************************************************
     */

    /*****************************************************************************
     * player controls. triggered by various apps.
     * ! moving controls triggered by 'on-air app' out of local bindings
    #***************************************************************************
     */
    $(document).on('click', 'a[data-bplayer-controls]', function(e) {
      var action, index;
      e.preventDefault();
      action = $(this).data('bplayer-controls');
      index = $(this).parents('.item').index() - 1;
      if (action === 'play') {
        self.controls({
          action: 'play',
          index: index
        });
        onair.handle_pagination(index);
      }
      if (action === 'pause') {
        self.controls({
          action: 'pause'
        });
      }
      if (action === 'resume') {
        self.controls({
          action: 'play'
        });
      }
    });
    $(document).on('click', 'a[data-bplayer-display]', function(e) {
      var action;
      e.preventDefault();
      action = $(this).data('bplayer-display');
      if (self.debug) {
        debug.debug('bplayer-display: ' + action);
      }
      if (action === 'compact') {
        self.style_change(action);
      }
      if (action === 'large') {
        self.style_change(action);
      }
      if (action === 'toggle-history') {
        self.history_expanded = !self.history_expanded;
        self.show_hide_history();
      }
    });
    $(self.container).on('click', '.playhead .handler', function(e) {
      var base_width, control, outer_width, pos, position, uuid;
      e.preventDefault();
      outer_width = $(this).css('width').slice(0, -2);
      base_width = outer_width;
      pos = util.get_position(e);
      position = pos['x'] / base_width;
      uuid = $(this).parents('.item').data('uuid');
      control = {
        action: 'seek',
        position: position,
        uuid: uuid
      };
    });
    $(document).on('click', '.playing .progress', function(e) {
      var base_width, control, outer_width, pos, position, uuid;
      e.preventDefault();
      outer_width = $(this).css('width').slice(0, -2);
      base_width = outer_width;
      pos = util.get_position(e);
      position = pos['x'] / base_width;
      uuid = $(this).parents('.item').data('uuid');
      control = {
        action: 'seek',
        position: position,
        uuid: uuid
      };
      self.controls(control);
    });
  };
  this.state_change = function(state) {
    var classes_to_remove;
    if (self.debug) {
      console.log('BPlayerApp - state changed to: ' + state);
    }
    classes_to_remove = removeA(self.states.slice(0), state).join(' ');
    self.container.addClass(state).removeClass(classes_to_remove);
    self.state = state;
    $('body').data('bplayer_state', state).addClass(state).removeClass(classes_to_remove);
  };
  this.style_change = function(style) {
    self.style = style;
    self.container.removeClass('style-large style-compact').addClass('style-' + style);
  };
  this.show_hide_history = function() {
    if (self.history_expanded) {
      self.container.addClass('show-history');
    } else {
      self.container.removeClass('show-history');
    }
    self.update_player(false);
  };
  this.set_playlist = function(playlist, opts) {
    playlist = playlist.slice();
    playlist.reverse();
    if (self.debug) {
      console.debug('BPlayerApp - set_playlist', playlist, opts);
    }
    self.playlist = playlist;
  };
  this.controls = function(control) {
    var abs_time, emission, index, item, media, seekable, url;
    if (self.debug) {
      console.info('BPlayerApp - control: ', control);
    }
    if (control.action === 'play') {
      if (control.index === void 0) {
        if (self.debug) {
          console.debug('no item, assuming offline mode');
        }
        url = self.stream_url;
      } else {
        item = self.playlist[control.index];
        self.current_index = control.index;
        emission = item.emission;
        media = item.item;
        url = void 0;
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
    if (control.action === 'seek') {
      seekable = self.current_sound.getSeekable();
      abs_time = self.current_sound.getDuration() * control.position;
      if (self.debug) {
        console.debug('seek', seekable[0]);
      }
      if (abs_time >= seekable[0].start && abs_time <= seekable[0].end) {
        self.current_sound.setTime(abs_time);
      }
    }

    /*
     * attention! 'next' is actually the previous one in our case
     */
    if (control.action === 'next') {
      if (self.current_index >= 1) {
        index = self.current_index - 1;
        self.controls({
          action: 'play',
          index: index
        });
        onair.handle_pagination(index);
      } else {
        if (self.debug) {
          console.log('no previous items');
        }
      }
    }
    if (control.action === 'stop') {
      self.current_sound.stop();
    }
    if (control.action === 'pause') {
      self.current_sound.pause();
    }
    if (control.action === 'resume') {
      self.current_sound.resume();
    }
    self.update_player();
  };

  /**
   * wrapper around buzz
   * @param {string} url
   */
  this.play_file = function(url) {
    console.debug('BPlayerApp - play_file: ', url);
    if (self.last_sound_url && self.last_sound_url === url) {
      self.current_sound.play();
      return;
    }
    if (self.current_sound) {
      self.current_sound.stop();
      delete self.current_sound;
    }
    self.current_sound = new buzz.sound(url, {
      preload: true,
      webAudioApi: false
    });
    self.current_sound.bind('waiting', self.events.whileloading);
    self.current_sound.bind('timeupdate', self.events.whileplaying);
    self.current_sound.bind('playing', self.events.play);
    self.current_sound.bind('pause', self.events.pause);
    self.current_sound.bind('play', self.events.resume);
    self.current_sound.bind('play', self.events.play);
    self.current_sound.bind('ended', self.events.finish);
    self.current_sound.bind('waiting', function(e) {
      console.log('waiting:', e);
    });
    self.current_sound.play().fadeIn(500);
    self.last_sound_url = url;
  };
  this.progress = function(sound) {
    var pos, width;
    pos = sound.getPercent() / 100.0;
    width = $('.playhead', self.container).width();
    $('.playhead .indicator', self.container).css('background-position-x', pos * width + 'px');
    $('.playing .progress > .meter').css('width', pos * 100 + '%');
  };
  this.loading = function(data) {
    var pos, width;
    pos = data.bytesLoaded / data.bytesTotal;
    width = $('.playhead', self.container).width();
    $('.playing .progress > .buffer').css('width', pos * 100 + '%');
  };
  this.update_player = function(reindex) {
    var playlist_template;
    var e, error, error1, media, playlist_template, totals, uuids;
    if (self.debug) {
      console.debug('BPlayerApp - update_player', reindex);
    }
    if (reindex !== void 0 && self.current_uuid !== void 0 && self.current_index !== 0) {
      $.each(self.playlist, function(i, el) {
        if (i > 0 && el.item.uuid === self.current_uuid) {
          self.current_index = i;
        }
      });
    }
    media = self.playlist[self.current_index];
    if (media !== void 0) {
      $('#bplayer_waveform_container', self.container).html(nj.render('bplayer/nj/waveform.html', {
        object: media
      }));
      $('#bplayer_info_container', self.container).html(nj.render('bplayer/nj/playing.html', {
        object: media
      }));
      if (self.history_expanded) {
        playlist_template = 'bplayer/nj/playlist_expanded.html';
      } else {
        playlist_template = 'bplayer/nj/playlist_compact.html';
      }
      $('#bplayer_playlist_container', self.container).html(nj.render(playlist_template, {
        objects: self.playlist,
        opts: {
          onair: onair.is_onair,
          mode: onair.mode
        }
      }));
      totals = {
        index: self.current_index + 1,
        num_tracks: self.playlist.length,
        duration: self.playlist.length * 60
      };
      $('#totals_container', self.container).html(nj.render('bplayer/nj/totals.html', {
        data: totals
      }));
      uuids = [];
      try {
        uuids.push(media.item.uuid);
      } catch (error) {
        e = error;
        console.warn(e);
      }
      self.playing_uuids = uuids;
      try {
        self.current_uuid = media.item.uuid;
      } catch (error1) {
        e = error1;
        self.current_uuid = void 0;
      }
      if (media.onair) {
        setTimeout((function() {
          $('.item.onair').addClass('playing');
        }), 1);
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
  this.set_states_by_uuid = function(uuids, options) {
    if (options && options.clear !== void 0) {
      $('[data-uuid]').removeClass(options.clear);
    }
    if (options && options.set !== void 0) {
      $.each(uuids, function(i, el) {
        $('[data-uuid="' + el + '"]').addClass(options.set);
      });
    }
  };
};

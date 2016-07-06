BPlayerApp = ->
  self = this
  @debug = false
  @state = 'init'
  @container
  @playlist_container
  @static_url
  @playlist = []
  @current_index = 0
  @current_uuid
  @playing_uuids = []
  @current_sound = false
  @last_sound_url = false
  @stream_url
  @base_url
  @style = 'large'
  @states = [
    'init'
    'ready'
    'playing'
    'stopped'
    'paused'
    'buffering'
    'loading'
    'error'
  ]
  @history_expanded = false
  @source
  # 'live' or 'ondemand'

  @init = ->
    if self.debug
      console.log 'BPlayerApp - init'
    self.container = $('#bplayer_container')
    self.playlist_container = $('#bplayer_playlist_container', self.container)
    self.bindings()
    return

  @events =
    play: ->
      self.state_change 'playing'
      return
    stop: ->
      self.state_change 'stopped'
      return
    pause: ->
      self.state_change 'paused'
      return
    resume: ->
      self.state_change 'playing'
      return
    finish: ->
      self.state_change 'stopped'
      self.controls action: 'next'
      return
    whileloading: (e) ->
      self.state_change 'loading'
      self.loading this
      return
    whileplaying: (e) ->
      # TODO: readyState needed?
      if @readyState == 3
        self.state_change 'playing'
      self.progress this
      return
    onload: ->

  @bindings = ->
    if self.debug
      console.log 'BPlayerApp - bindings'

    ###****************************************************************************
    # generic actions
    #***************************************************************************
    ###

    ###****************************************************************************
    # player controls. triggered by various apps.
    # ! moving controls triggered by 'on-air app' out of local bindings
    #***************************************************************************
    ###

    $(document).on 'click', 'a[data-bplayer-controls]', (e) ->
      e.preventDefault()
      action = $(this).data('bplayer-controls')
      index = $(this).parents('.item').index() - 1
      if action == 'play'
        self.controls
          action: 'play'
          index: index
        onair.handle_pagination index
      if action == 'pause'
        self.controls action: 'pause'
      if action == 'resume'
        self.controls action: 'play'
      return
    # player display
    $(document).on 'click', 'a[data-bplayer-display]', (e) ->
      e.preventDefault()
      action = $(this).data('bplayer-display')
      if self.debug
        debug.debug 'bplayer-display: ' + action
      # player size
      if action == 'compact'
        self.style_change action
      if action == 'large'
        self.style_change action
      if action == 'toggle-history'
        self.history_expanded = !self.history_expanded
        self.show_hide_history()
      return
    # playhead actions
    $(self.container).on 'click', '.playhead .handler', (e) ->
      e.preventDefault()
      outer_width = $(this).css('width').slice(0, -2)
      base_width = outer_width
      pos = util.get_position(e)
      position = pos['x'] / base_width
      uuid = $(this).parents('.item').data('uuid')
      # trigger control
      control =
        action: 'seek'
        position: position
        uuid: uuid
      #self.controls(control);
      return
    # progress actions / seek
    $(document).on 'click', '.playing .progress', (e) ->
      e.preventDefault()
      outer_width = $(this).css('width').slice(0, -2)
      base_width = outer_width
      pos = util.get_position(e)
      position = pos['x'] / base_width

      ######

      uuid = $(this).parents('.item').data('uuid')
      # trigger control
      control =
        action: 'seek'
        position: position
        uuid: uuid
      self.controls control
      return
    return

  @state_change = (state) ->
    if self.debug
      console.log 'BPlayerApp - state changed to: ' + state
    classes_to_remove = removeA(self.states.slice(0), state).join(' ')
    self.container.addClass(state).removeClass classes_to_remove
    self.state = state
    $('body').data('bplayer_state', state).addClass(state).removeClass classes_to_remove
    return

  @style_change = (style) ->
    self.style = style
    self.container.removeClass('style-large style-compact').addClass 'style-' + style
    return

  @show_hide_history = ->
    if self.history_expanded
      self.container.addClass 'show-history'
      #$('body').addClass('no-scroll');
    else
      self.container.removeClass 'show-history'
      #$('body').removeClass('no-scroll');
    self.update_player false
    return

  # TODO: called from 'onair' app. should eventually be done differently

  @set_playlist = (playlist, opts) ->
    playlist = playlist.slice()
    playlist.reverse()
    if self.debug
      console.debug 'BPlayerApp - set_playlist', playlist, opts
    self.playlist = playlist
    return

  @controls = (control) ->
    if self.debug
      console.info 'BPlayerApp - control: ', control
    if control.action == 'play'
      # TODO: handle situation with not existing index [fallback mode]
      if control.index == undefined
        # offline situation
        if self.debug
          console.debug 'no item, assuming offline mode'
        url = self.stream_url
      else
        item = self.playlist[control.index]
        self.current_index = control.index
        emission = item.emission
        media = item.item
        url = undefined
        if item.onair
          if self.debug
            console.debug 'item on-air'
          url = self.stream_url
        else
          if self.debug
            console.debug 'item on-demand'
          url = media.stream.uri
      self.play_file url
    if control.action == 'seek'
      # check if already in buffer
      seekable = self.current_sound.getSeekable()
      abs_time = self.current_sound.getDuration() * control.position
      if self.debug
        console.debug 'seek', seekable[0]
      if abs_time >= seekable[0].start and abs_time <= seekable[0].end
        self.current_sound.setTime abs_time

    ###
    # attention! 'next' is actually the previous one in our case
    ###

    if control.action == 'next'
      if self.current_index >= 1
        index = self.current_index - 1
        self.controls
          action: 'play'
          index: index
        # TODO: kind of hakish - hooking to pagination
        onair.handle_pagination index
      else
        if self.debug
          console.log 'no previous items'
    if control.action == 'stop'
      self.current_sound.stop()
    if control.action == 'pause'
      self.current_sound.pause()
    if control.action == 'resume'
      self.current_sound.resume()
    self.update_player()
    return

  ###*
  # wrapper around buzz
  # @param {string} url
  ###

  @play_file = (url) ->
    console.debug 'BPlayerApp - play_file: ', url
    if self.last_sound_url and self.last_sound_url == url
      self.current_sound.play()
      return
    if self.current_sound
      self.current_sound.stop()
      delete self.current_sound
    self.current_sound = new (buzz.sound)(url,
      preload: true
      webAudioApi: false)
    # event bindings
    self.current_sound.bind 'waiting', self.events.whileloading
    self.current_sound.bind 'timeupdate', self.events.whileplaying
    self.current_sound.bind 'playing', self.events.play
    self.current_sound.bind 'pause', self.events.pause
    self.current_sound.bind 'play', self.events.resume
    self.current_sound.bind 'play', self.events.play
    self.current_sound.bind 'ended', self.events.finish
    self.current_sound.bind 'waiting', (e) ->
      console.log 'waiting:', e
      return
    self.current_sound.play().fadeIn 500
    self.last_sound_url = url
    return

  @progress = (sound) ->
    pos = sound.getPercent() / 100.0
    width = $('.playhead', self.container).width()
    $('.playhead .indicator', self.container).css 'background-position-x', pos * width + 'px'
    # TODO: make efficient selector
    $('.playing .progress > .meter').css 'width', pos * 100 + '%'
    return

  @loading = (data) ->
    pos = data.bytesLoaded / data.bytesTotal
    width = $('.playhead', self.container).width()
    $('.playing .progress > .buffer').css 'width', pos * 100 + '%'
    return

  @update_player = (reindex) ->
    `var playlist_template`
    if self.debug
      console.debug 'BPlayerApp - update_player', reindex
    if reindex != undefined and self.current_uuid != undefined and self.current_index != 0
      $.each self.playlist, (i, el) ->
        if i > 0 and el.item.uuid == self.current_uuid
          self.current_index = i
        return
    media = self.playlist[self.current_index]
    if media != undefined
      # waveform data
      $('#bplayer_waveform_container', self.container).html nj.render('bplayer/nj/waveform.html', object: media)
      # 'currently playing' data
      $('#bplayer_info_container', self.container).html nj.render('bplayer/nj/playing.html', object: media)
      # playlist content
      # TODO: maybe refactor to only update if panel is enabled/visible
      if self.history_expanded
        playlist_template = 'bplayer/nj/playlist_expanded.html'
      else
        playlist_template = 'bplayer/nj/playlist_compact.html'
      $('#bplayer_playlist_container', self.container).html nj.render(playlist_template,
        objects: self.playlist
        opts:
          onair: onair.is_onair
          mode: onair.mode)
      # update summary
      totals =
        index: self.current_index + 1
        num_tracks: self.playlist.length
        duration: self.playlist.length * 60
      $('#totals_container', self.container).html nj.render('bplayer/nj/totals.html', data: totals)
      # collect playing uuids
      # TODO: rework, not needed here
      uuids = []
      try
        uuids.push media.item.uuid
      catch e
        console.warn e
      self.playing_uuids = uuids
      try
        self.current_uuid = media.item.uuid
      catch e
        self.current_uuid = undefined
      # hack - mark 'onair' as playing
      # TODO: investigate! this breaks onair player
      if media.onair
        setTimeout (->
          $('.item.onair').addClass 'playing'
          #$('.item.onair', self.container).addClass('playing');
          return
        ), 1
      self.set_states_by_uuid uuids,
        clear: 'playing'
        set: 'playing'
    else
      if self.debug
        console.debug 'bplayer - no playlist available'
    return

  @set_states_by_uuid = (uuids, options) ->
    if options and options.clear != undefined
      $('[data-uuid]').removeClass options.clear
    if options and options.set != undefined
      $.each uuids, (i, el) ->
        $('[data-uuid="' + el + '"]').addClass options.set
        return
    return

  return

# ---
# generated by js2coffee 2.2.0
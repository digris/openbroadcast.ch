class BPlayerApp



  constructor: (debug) ->
    @debug = debug

    @state = 'init'
    @static_url = null
    @playlist = []
    @current_index = 0
    @current_uuid = null
    @playing_uuids = []
    @current_sound = null
    @source = null
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

    @container = $('#bplayer_container')
    @playlist_container = $('#bplayer_playlist_container')
     


  events:
    play: =>
      @state_change 'playing'
      return
    stop: =>
      @state_change 'stopped'
      return
    pause: =>
      @state_change 'paused'
      return
    resume: =>
      @state_change 'playing'
      return
    finish: =>
      @state_change 'stopped'
      @controls action: 'next'
      return
    whileloading: (e) =>
      console.debug 'the @', @
      @state_change 'loading'
      return
    whileplaying: (e) =>
      # TODO: readyState needed?
      if this.readyState == 3
        @state_change 'playing'
        return
      #@progress this
      return
    onload: =>

  controls: (control) ->
    if @debug
      console.info 'BPlayerApp - control: ', control
    if control.action == 'play'
      # TODO: handle situation with not existing index [fallback mode]
      if control.index == undefined
        # offline situation
        if @debug
          console.debug 'no item, assuming offline mode'
        url = @stream_url
      else
        item = @playlist[control.index]
        @current_index = control.index
        emission = item.emission
        media = item.item
        url = undefined
        if item.onair
          if @debug
            console.debug 'item on-air'
          url = @stream_url
        else
          if @debug
            console.debug 'item on-demand'
          url = media.stream.uri
      @play_file url
    if control.action == 'seek'
      # check if already in buffer
      seekable = @current_sound.getSeekable()
      abs_time = @current_sound.getDuration() * control.position
      if @debug
        console.debug 'seek', seekable[0]
      if abs_time >= seekable[0].start and abs_time <= seekable[0].end
        @current_sound.setTime abs_time

    ###
    # attention! 'next' is actually the previous one in our case
    ###

    if control.action == 'next'
      if @current_index >= 1
        index = @current_index - 1
        @controls
          action: 'play'
          index: index
        # TODO: kind of hakish - hooking to pagination
        onair.handle_pagination index
      else
        if @debug
          console.log 'no previous items'
    if control.action == 'stop'
      @current_sound.stop()
    if control.action == 'pause'
      @current_sound.pause()
    if control.action == 'resume'
      @current_sound.resume()
    @update_player()
    return
    
  play_file: (url) ->
    console.debug 'BPlayerApp - play_file: ', url
    if @last_sound_url and @last_sound_url == url
      @current_sound.play()
      return
    if @current_sound
      @current_sound.stop()
      delete @current_sound
    @current_sound = new (buzz.sound)(url,
      preload: true
      webAudioApi: false)
    # event bindings
    @current_sound.bind 'waiting', @events.whileloading
    @current_sound.bind 'timeupdate', @events.whileplaying
    @current_sound.bind 'playing', @events.play
    @current_sound.bind 'pause', @events.pause
    @current_sound.bind 'play', @events.resume
    @current_sound.bind 'play', @events.play
    @current_sound.bind 'ended', @events.finish
    @current_sound.bind 'waiting', (e) ->
      console.log 'waiting:', e
      return
    @current_sound.play().fadeIn 500
    @last_sound_url = url
    return
    
    

  state_change: (state) ->
    if @debug
      console.log 'BPlayerApp - state changed to: ' + state

    classes_to_remove = removeA(@states.slice(0), state).join(' ')

    @container.addClass(state).removeClass classes_to_remove
    @state = state

    $('body').data('bplayer_state', state)
    $('body').addClass(state).removeClass classes_to_remove

    return state

  set_playlist: (playlist, opts) ->

    playlist = playlist.slice()
    playlist.reverse()
    if @debug
      console.debug 'BPlayerApp - set_playlist', playlist, opts
    @playlist = playlist

    return playlist

  update_player: (reindex) ->

    if @debug
      console.debug 'BPlayerApp - update_player', reindex
OnAirApp = ->
  self = this
  @debug = true
  @api_url = "/api/v1/abcast/channel/"
  @channel_id = 1
  
  #this.base_url = 'http://openbroadcast.org/';
  # TODO: base_url form API_BASE_URL settings
  @base_url = "http://localhost:8080"
  @container
  @bplayer = false
  @max_items = 12
  @info_container
  @meta_container
  @meta_rating
  @prevnext_container
  @info_timeout = false
  @local_data = []
  @mode = "onair" # 'on air', 'history' or 'fallback'
  @timeline_offset = 0
  @init = ->
    
    # assigning dom elements
    self.container = $("#onair_container")
    self.info_container = $(".info-container", self.container)
    self.meta_container = $(".meta-container", self.container)
    self.prevnext_container = $("#media_prev_next", self.container)
    self.load()
    self.bindings()
    
    # dummy call
    setTimeout (->
      self.load_history limit: 3
    ), 2000

  @load = ->
    url = self.api_url + self.channel_id + "/" + "on-air/"
    
    # force refresh every 30 seconds
    $.get(url).done((data) ->
      console.log "on air:", data
      unless data.start_next
        setTimeout self.load, 10000
      else
        if data.start_next > 30
          setTimeout self.load, 30000
        else
          setTimeout self.load, Number(data.start_next * 1000)
      if data.playing isnt `undefined` and (data.playing.emission isnt `undefined` and data.playing.item isnt `undefined`)
        self.set_mode "onair"
        self.load_current data.playing
      else
        self.set_mode "fallback"
        console.log "nothing on air -> load splash-screen"
    ).fail (jqXHR, textStatus, errorThrown) ->
      console.error "OnAirApp - load " + errorThrown
      self.set_mode "fallback"
      setTimeout self.load, 10000


  @set_mode = (mode) ->
    console.debug "OnAirApp - set_mode: " + mode  if self.debug
    self.mode = mode
    self.container.removeClass("onair history fallback").addClass mode

  @bindings = ->
    console.log "OnAirApp - bindings"
    
    # flip-handling
    # direct hover
    
    # set ct-based metadata
    self.meta_container.on("mouseover", "a", (e) ->
      $(".current", self.info_container).addClass "flipped"
      clearTimeout self.info_timeout  if self.info_timeout
      self.show_meta_for $(this).data("ct")
    ).on "mouseout", "a", (e) ->
      self.info_timeout = setTimeout(->
        $(".current", self.info_container).removeClass "flipped"
      , 400)

    
    # keep visible on info-hover
    self.info_container.on("mouseover", ".item", (e) ->
      clearTimeout self.info_timeout  if self.info_timeout
    ).on "mouseout", ".item", (e) ->
      self.info_timeout = setTimeout(->
        $(".current", self.info_container).removeClass "flipped"
      , 400)

    self.prevnext_container.on "click", "a", (e) ->
      e.preventDefault()
      self.handle_prevnext $(this).data("direction")  unless $(this).parent().hasClass("disabled")


  @show_meta_for = (ct) ->
    $("div[data-ct]").hide()
    $("div[data-ct=\"" + ct + "\"]").show()

  @load_current = (playing) ->
    console.log "OnAirApp - load_current"
    obj =
      emission: []
      item: []
      timestamp: playing.time_start
      on_air: true
      el: false

    
    # first load emission data
    $.get playing.emission, (data) ->
      console.log "emission:", data
      obj.emission = data
      
      # then 'item' data
      $.get playing.item, (data) ->
        console.log "item:", data
        obj.item = data
        
        # reset playing flag
        $.each self.local_data, (i, item) ->
          item.on_air = false

        self.local_data.push obj
        self.update_data()



  @load_history = (options) ->
    url = self.api_url + self.channel_id + "/" + "history/"
    $.get url, (history) ->
      $.each history.objects, (i, item) ->
        item.el = false  if item.el is `undefined`
        item.on_air = false  if item.on_air is `undefined`
        self.local_data.unshift item

      self.complete_data()

    
    # a dummy implementation here, just to test
    # history then will be loaded from API
    history =
      meta: {}
      objects: [
        {
          emission: "/api/v1/abcast/emission/452/"
          item: "/api/v1/library/track/13489/"
        }
        {
          emission: "/api/v1/abcast/emission/452/"
          item: "/api/v1/library/track/13397/"
        }
        {
          emission: "/api/v1/abcast/emission/452/"
          item: "/api/v1/library/track/13440/"
        }
      ]

  
  ###
  completes dataset via API.
  if resource data in json is a string (url) it fetches these data and
  replaces it with the returned object
  ###
  @complete_data = ->
    console.log "OnAirApp - complete_data"
    $.each self.local_data, (i, item) ->
      if typeof item.emission is "string"
        $.get item.emission, (data) ->
          self.local_data[i].emission = data

      if typeof item.item is "string"
        $.get item.item, (data) ->
          self.local_data[i].item = data


    setTimeout (->
      console.log self.local_data
      self.update_data()
    ), 500

  @update_data = ->
    console.log "OnAirApp - update_data", self.local_data
    
    # clean 'old' data
    self.local_data.splice 0, self.local_data.length - self.max_items
    $.each self.local_data, (i, item) ->
      dom_id = item.emission.uuid + "-" + item.item.uuid
      
      # compose classes
      classes = ""
      if item.on_air
        
        # TODO: adjust behavior if in 'history' or 'fallback' mode
        self.update_meta_display item
        classes += "next next-1"
      else

      
      #classes += ' previous';
      #classes += ' previous-' + (i + 1);
      
      # check if present in dom
      # create in case that not
      unless item.el
        try
          html = $(nj.render("onair/nj/item.html",
            dom_id: dom_id
            debug: self.debug
            object: item
            extra_classes: classes
            base_url: self.base_url
          ))
        catch e
          html = $("<div>ERROR</div>")
          console.warn e
          console.warn item
        $(".info-container .items").append html
        item.el = $("#" + dom_id)
      else

    
    #item.el.fadeOut(5000)
    
    # handle own timeline
    setTimeout (->
      self.handle_timeline()
    ), 5
    
    # handle pplayer history display
    self.bplayer.set_playlist self.local_data

  
  ###
  Updates metadata display, playlist, artist etc.
  sets corresponding names & links
  @param item
  ###
  @update_meta_display = (item, fast) ->
    fast = false  if fast is `undefined`
    self.meta_container.fadeOut 100
    html = $(nj.render("onair/nj/meta.html",
      object: item
      base_url: self.base_url
    ))
    if fast
      setTimeout (->
        self.meta_container.html html
        self.meta_container.fadeIn 200
      ), 150
    else
      setTimeout (->
        self.meta_container.html html
        self.meta_container.fadeIn 500
      ), 1000

  @update_rating_display = (item) ->
    rating_container = $(".rating-container", self.container)
    rating_container.removeClass "disabled"
    
    # set current values
    $(".vote-up a > span", rating_container).html item.item.votes.up
    $(".vote-down  a > span", rating_container).html item.item.votes.down

  
  ###
  handles timeline display: prev/next etc.
  ###
  @handle_timeline = ->
    
    # cases: on_air mode -> item with on_air flag is set to current
    # cases: history mode -> item with <to-be-defined> flag is set to current
    
    # get current item
    current_index = false
    num_items = self.local_data.length
    onair_index = 0
    onair = false
    $.each self.local_data, (i, item) ->
      if item.on_air
        onair_index = i
        onair = true

    
    # TODO: think about a more elegant solution
    if self.timeline_offset is 0
      self.set_mode "onair"
    else
      self.set_mode "history"
    current_index = onair_index + self.timeline_offset
    self.set_mode "fallback"  unless onair
    
    # apply classes based on offset
    $.each self.local_data, (i, item) ->
      item.el.removeClass().addClass "item info"
      if i < current_index
        item.el.addClass "previous"
        item.el.addClass "previous-" + Math.abs(current_index - i)
        console.log "index / prev:", Math.abs(current_index - i)
        item.el.addClass "previous-x"  if Math.abs(current_index - i) > 3
      if i is current_index
        item.el.addClass "current"
        self.update_meta_display item, false
        self.update_rating_display item
      if i > current_index
        item.el.addClass "next"
        item.el.addClass "next-" + Math.abs(current_index - i)
        item.el.addClass "next-x"  if Math.abs(current_index - i) > 1

    
    # handle prev/next actions
    console.log "current_index", current_index + 1, "num_items", num_items
    if current_index + 1 <= num_items and num_items > 1 and current_index > 0
      $(".previous", self.prevnext_container).removeClass "disabled"
    else
      $(".previous", self.prevnext_container).addClass "disabled"
    if current_index + 1 < num_items and num_items > 1
      $(".next", self.prevnext_container).removeClass "disabled"
    else
      $(".next", self.prevnext_container).addClass "disabled"

  
  ###
  handles pagination & onair/history mode
  ###
  @handle_prevnext = (direction) ->
    console.log "OnAirApp - handle_prevnext: " + direction
    self.timeline_offset--  if direction is "previous"
    self.timeline_offset++  if direction is "next"
    self.handle_timeline()

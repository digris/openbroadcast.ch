/**
 * All intellectual property rights in this Software throughout the world belong to UK Radioplayer,
 * rights in the Software are licensed (not sold) to subscriber stations, and subscriber stations
 * have no rights in, or to, the Software other than the right to use it in accordance with the
 * Terms and Conditions at www.radioplayer.co.uk/terms. You shall not produce any derivate works
 * based on whole or part of the Software, including the source code, for any other purpose other
 * than for usage associated with connecting to the UK Radioplayer Service in accordance with these
 * Terms and Conditions, and you shall not convey nor sublicense the Software, including the source
 * code, for any other purpose or to any third party, without the prior written consent of UK Radioplayer.
 *
 * @name emp
 * @description Audio Engine API for Flash and HTML5 players
 *
 * @authors Mark Panaghiston <markp@happyworm.com>
 *
 * This file calls:
 * @emp.player.flash
 * @emp.player.html
 *
 * This file is called by:
 * @ init
 * @ services
 * @ controls
 *
 * @class emp
 * @module emp
 *
 */
radioplayer.emp = {
    /**
     * Enable to generate debug information in the console
     *
     * @property DEBUG
     * @final
     * @static
     */
	DEBUG: false,
	player: {}, // For the flash and html players

    /**
     * Set when a player is ready for use
     *
     * @property ready
     * @type boolean
     * @default false
     */
	ready : false,

    /**
     * id of the html element wrapper for the flash/html player
     *
     * @property id
     */
	id: "empv3",

	/**
	 * Determines the preferred player. Valid values are 'flash' (default) or 'html'.
	 *
	 * @property preferredPlayer
	 * @default 'flash'
	 * @type String
	 */
	preferredPlayer : 'flash',

	/**
	 * Determines the current player. Valid values are 'flash' (default) or 'html'.
	 *
	 * @property currentPlayer
	 * @default 'flash'
	 * @type String
	 */
	currentPlayer : 'flash',

    /**
     * How many times the EMP should attempt to retry a stream that receives an error.
     *
     * Attempts count resets to 0 once the stream successfully plays.
     *
     * @property retryCount
     * @default 5
     * @type int
     */
  retryCount: 5,

  /**
     * Keeps track of which audio array (window.audioArray) we are using
     *
     * @property audioArrayInteger
     * @default 0
     * @type int
     */
  audioArrayInteger: 0,

  /**
     * Keeps track of which audio preference (preferredPlayer, first choice or second) we are using
     *
     * @property audioPreference
     * @default 0
     * @type int
     */
  audioPreference: 0,

	/**
	 * Names of the events used by the API.
	 *
     * They have been listed here for clarity and so that you can bind events to,
	 * for example: radioplayer.emp.event.ended
     *
     * *Original Events from Radioplayer EMP V2. These are coded into the Flash and listed here for the HTML to use.*
     *
     * @property event
	 */
	event: {
        /**
         * @event mode
         */
		mode: 'mode',
        /**
         * @event loadProgress
         */
		loadProgress: 'loadProgress',
        /**
         * @event startPlaying
         */
		startPlaying: 'startPlaying',
        /**
         * @event pausePlaying
         */
		pausePlaying: 'pausePlaying',
        /**
         * @event resumed
         */
		resumed: 'resumed',
        /**
         * @event stopped
         */
		stopped: 'stopped',
        /**
         * @event cleanedup
         */
		cleanedup: 'cleanedup',
        /**
         * @event durationSet
         */
		durationSet: 'durationSet',
        /**
         * @event ended
         */
		ended: 'ended',
        /**
         * @event update
         */
		update: 'update',
        /**
         * @event volumeSet
         */
		volumeSet: 'volumeSet',
        /**
         * @event securityError
         */
		securityError: 'securityError',
        /**
         * @event error
         */
		error: 'error',
        /**
         * (error) Occurs when there is no suport for the format trying to be played.
         *
         * @event noSupport
         */
		noSupport: 'noSupport',
		attemptedInit: false
	},

	/**
	 * Initialises the player. Gets called every time a new stream is tried.
     *
     * @method init
     *
     * @param ausioArray
     * @param audioLive
     * @param bufferTime
     * @param usingBackup
     *
     * @since V3
     */
	init : function(audioArray, audioLive, bufferTime, usingBackup) {
		if(!this.attemptedInit && !vastAds.enabled && radioplayer.utils) {
			radioplayer.utils.resizeViewPort(380, 665);
		}

		this.attemptedInit = true;

    var usedStream = [];
    var usingBackup = usingBackup || null;

    // Unless Flash is blocked by the browser, determine if flash is available
    if(!(radioplayer.emp.player.flash && radioplayer.emp.player.flash.blocked)) {
    	radioplayer.emp.player.flash.available = swfobject.hasFlashPlayerVersion(radioplayer.emp.player.flash.flashVersion);
    }

    // Determine player and initialise it
		this.determinePlayer(usingBackup);

		// Determine the stream to use
		var streamToUse = usingBackup ? usingBackup[0] : audioArray[radioplayer.emp.audioArrayInteger];
		usedStream.push(streamToUse);

    if(typeof usedStream == "undefined" || !usedStream.length) { // If we don't have a suitable stream
      $(this).trigger(this.event.error, {});
    }
    else {
    	radioplayer.utils.output(typeof usedStream);
    	radioplayer.utils.output(usedStream.length);

    	radioplayer.utils.output(usedStream[0]);
			//if(this.DEBUG) radioplayer.utils.output('[EMP]: Using type "' + usedStream[0].audioType + '" with stream ' + usedStream[0].audioUrl);
    }

    // Set audio parameters in the individual players
		this.solution('setAudioParams', usedStream, audioLive, bufferTime);

		if(radioplayer.emp.currentPlayer === 'flash') {
			this.player.flash.createObject();
		}
	},

    /**
     * Determine which player to use, and initialise it
     *
     * @method init
     */
	determinePlayer: function(usingBackup) {	
		this.preferredPlayer = preferredPlaybackMethod || 'flash';
		if ((this.preferredPlayer === 'html' && radioplayer.emp.audioPreference < 1) || (this.preferredPlayer === 'flash' && radioplayer.emp.audioPreference > 0) || usingBackup) {
			// HTML5 playback preferred
			radioplayer.emp.currentPlayer = "html";
			if(this.DEBUG) radioplayer.utils.output('[EMP]: Trying HTML player');

			// If the player has been initialised before, do not initialise it
			if (!this.player.html || !this.player.html.initialisedOnce) {
				this.initHTMLPlayer();
			}

			// Is HTML5 player unsupported?
			if (!this.player.html.available) {
				if(this.DEBUG) radioplayer.utils.output('[EMP]: We have tried the HTML player, and failed');

				if (radioplayer.emp.audioPreference > 0) {
					radioplayer.emp.currentPlayer = null;
					// HTML5 is unavailable, and it was our second preference, so we need to trigger 
					// the no-supported player error
					radioplayer.emp.currentPlayer = null;
					this.triggerNoSupportedPlayerError();
				}
				else {
					// HTML5 is unavailable, but it was our first preference, so we need to try
					// again, with Flash
					radioplayer.emp.audioPreference++;
					radioplayer.emp.determinePlayer();
				}
			}
		} 
		else {
			radioplayer.emp.currentPlayer = "flash";
			// Flash playback preferred - also used as fallback if no preference specified
			//if(this.DEBUG) radioplayer.utils.output('[EMP]: Trying Flash player');
			// Try to init the flash player unless we have flagged that it is blocked by the browser
			if(!(this.player.flash && this.player.flash.blocked)) {
				this.initFlashPlayer();
			}
			if (!this.player.flash.available) {
				if(this.DEBUG) radioplayer.utils.output('[EMP]: We have tried the flash player, and failed. '+radioplayer.emp.audioPreference);

				if (radioplayer.emp.audioPreference > 0) {
					radioplayer.emp.currentPlayer = null;
					// Flash is unavailable, and it was our second preference, so we need to trigger 
					// the no-supported player error
					this.triggerNoSupportedPlayerError();
				}
				else {
					// Flash is unavailable, but it was our first preference, so we need to try
					// again, with HTML5
					radioplayer.emp.audioPreference++;
					radioplayer.emp.determinePlayer();
				}
			}
		}

		// During dev and testing
		//if(this.DEBUG) this.eventInspector();
	},

	/**
	 * Initializes the Flash player
	 *
	 * @method initFlashPlayer
	 */
	initFlashPlayer: function() {
		this.player.flash.init(this);

		if(this.player.flash.available) {
			this.player.flash.used = true;
			//if(this.DEBUG) radioplayer.utils.output('[EMP]: Flash Player used.');
		}
	},

	/**
	 * Initializes the HTML player
	 *
	 * @method initHTMLPlayer
	 */
	initHTMLPlayer: function() {
		this.player.html.init(this);
		if(this.player.html.available) {
			this.player.html.used = true;
			//if(this.DEBUG) radioplayer.utils.output('[EMP]: HTML5 Player used.');
		}
	},

	/**
		* Triggers the 'no supported player' error
		*
		* @method triggerNoSupportedPlayerError
		*/
	triggerNoSupportedPlayerError: function() {
		$(this).trigger(this.event.noSupport, {});
		//if(this.DEBUG) radioplayer.utils.output('[EMP]: No Player available for this browser');
	},

	/**
	 * Called either when we receive cookie settings,
	 * or if that request fails and we proceed anyway with volume set to 100
	 */
	dataReady : function() {
		this.solution('dataReady');
	},

  /**
   * A development tool for inspecting the events being generated.
   *
   * @method eventInspector
   */
	eventInspector: function() {
		var self = this;

		$.each(this.event, function(name, type) {
			$(self).bind(type, function(event, custom) {
				// console.log('=== ' + name);
				// console.log(event);
				//radioplayer.utils.output('emp: ' + name + ' event: "' + type + '" : %o | custom: %o', event, custom);
			});
		});
	},

	/**
	 * Set parameters for EMP to use when it is ready
     *
     * (V2 API)
     *
     * @param audioType
     * @param audioUrl
     * @param audioServer
     * @param audioEndpoint
     * @param audioLive
     * @param bufferTime
     * @deprecated
     */
	setParams : function(audioType, audioUrl, audioServer, audioEndpoint, audioLive, bufferTime) {
		this.init();
		this.solution('setParams', audioType, audioUrl, audioServer, audioEndpoint, audioLive, bufferTime);
		if(radioplayer.emp.currentPlayer === 'flash') {
			this.player.flash.createObject();
		}
	},

	
  /**
   * @method resetAttemptCount
   */
  resetAttemptCount: function() {
    this.solution('resetAttemptCount');
  },

	/**
     * A helper function to pass commands to the player being used.
	 *
     * @example
     *      this.solution('play')
     *
     * @method solution     *
     * @param method
	 */
	solution: function(method) {
		var args = Array.prototype.slice.call( arguments, 1 ),
		player;
		// Set the pointer to the player being used.
		if(radioplayer.emp.currentPlayer === 'flash') {
			player = this.player.flash;
		} 
		else if(radioplayer.emp.currentPlayer === 'html') {
			player = this.player.html;
		} 
		else {
			// There is no player
			$(this).trigger(this.event.noSupport, {});
		}
		// Execute the player method, passing in the arguments.
		if(player && typeof player[method] === 'function') {
			return player[method].apply(player, args);
		}
	},

	/*
	 * Control API methods
	 */

	/**
     *  Directly load an RTMP stream with 'server' and 'endpoint' urls
     *
     * @method loadRTMPStream
     * @param server
     * @param endpoint
     */
	loadRTMPStream: function(server, endpoint) { this.solution('loadRTMPStream', server, endpoint); },
	/**
     * Directly load an HTTP stream from url
     *
     * @method loadHTTPStream
     * @param url
     */
	loadHTTPStream: function(url) { this.solution('loadHTTPStream', url); },
	/**
     * Directly load Netstreams from url. Supports flv, f4v, mp4, m4a.
     *
     * @method loadHTTPMP4M4AStream
     * @param url
     */
	loadHTTPMP4M4AStream: function(url) { this.solution('loadHTTPMP4M4AStream', url); },
	/**
     * Load, parse and play the contents in order from the playlist at the url in 'playlistpath'
     *
     * @method loadPlaylist
     * @param playlistpath
     */
	loadPlaylist : function(playlistpath) { this.solution('loadPlaylist', playlistpath); },
	/**
     * Resume playback after pause.
     *
     * @method resume
     */
	resume : function() {
    if (this.ready) {
      this.errorCount = 0;
      this.solution('resume');
    }
	},
	/**
     * Pause playback while playing.
     *
     * @method pause
     */
	pause: function () { this.solution('pause'); },
	/**
     * Stop playback while playing.
     *
     * @method stop
     */
	stop : function() { this.solution('stop'); },
	/**
     * Resets the EMP.
     *
     * *Should be called before reconfiguring via calls to loadRTMPStream, loadHTTPStream, loadHTTPMP4M4AStream or loadPlaylist.*
     *
     * @method cleanup
     */
	cleanup : function() { this.solution('cleanup'); },
	/**
     * Returns the current position of the playhead for the current audio item.
     *
     * @method getPosition
     */
	getPosition : function() {return this.solution('getPosition'); },
	/**
     * Returns the duration of the current audio item.
     *
     * @method getDuration
     */
	getDuration : function() {return this.solution('getDuration'); },
	/**
     * Sends the playhead of the current audio item. to 'position' in seconds
     *
     * @method seek
     * @param position
     */
	seek : function(position) { this.solution('seek', position); },
	/**
     * Set the volume (for the current, and all subsequent audio items). volume can be between 0 and 100
     *
     * @method setVolume
     * @param volume
     */
	setVolume : function(volume) { this.solution('setVolume', volume); },
	/**
     * Set the amount of time in seconds that the streams should load into buffer before playing.
     *
     * @method setBufferTime
     * @param time
     */
	setBufferTime : function(time) { this.solution('setBufferTime', time); },
	/**
     * Specify the playback mode. Can be 'od' for on demand or 'live' for live streams.
	 *
     * > If a playlist contains both live and on demand streams:
	 * >	When playbackmode is 'live' all streams will appear live in the controls, even on demand ones
	 * >	When playbackmode is 'od' only live streams will appear live in the controls.
     */
	setPlaybackMode : function(mode) { this.solution('setPlaybackMode', mode); },
	/**
     * Returns the value of the playback mode.
     *
     * @method getPlaybackMode
     */
	getPlaybackMode : function() {return this.solution('getPlaybackMode'); },
	/**
     * For Debugging - returns the emp and flash player versions with some basic debugging info.
     * @method getVersion
     */
	getVersion : function() {return this.solution('getVersion'); },
	/**
     * HTTP streams exhibit a flash player bug where the stream data is never freed.
	 *	Calling memoryreset will swap the stream over to a fresh Sound object, freeing up the memory used.
	 *	This automatically happens when the emp uses over about 200 Mb of memory, but can by manually called if required.
     *
     * @method memoryreset
     */
	memoryreset : function() {return this.solution('memoryreset'); },
	/**
     * Set high memory usage limit (bytes, default is 204857600) If the emp uses more than this amount then it'll restart the stream
	 *	Primarily this feature is due to a bug with http streams where memory is never freed.
     *
     * @method setMemoryLimit
     * @param limit
     */
	setMemoryLimit : function(limit) { this.solution('setMemoryLimit', limit); },
	/**
     * Set the time taken before a timeout if the stream gets stuck buffering.
     *
     * @method setStallTimeout
     * @param time
     */
	setStallTimeout : function(time) { this.solution('setStallTimeout', time); }
};

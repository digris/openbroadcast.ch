/**
 * @name services
 * @description Cross domain get and post, receiving of cookie values
 *
 * > *All intellectual property rights in this Software throughout the world belong to UK Radioplayer,
 * rights in the Software are licensed (not sold) to subscriber stations, and subscriber stations
 * have no rights in, or to, the Software other than the right to use it in accordance with the
 * Terms and Conditions at www.radioplayer.co.uk/terms. You shall not produce any derivate works
 * based on whole or part of the Software, including the source code, for any other purpose other
 * than for usage associated with connecting to the UK Radioplayer Service in accordance with these
 * Terms and Conditions, and you shall not convey nor sublicense the Software, including the source
 * code, for any other purpose or to any third party, without the prior written consent of UK Radioplayer.*
 *
 *
 * @author Gav Richards <gav@gmedia.co.uk>
 * @author Steve Edson <steve@gmedia.co.uk>
 *
 * This file calls:
 * @ emp
 * @ search
 *
 * This file is called by:
 * @ init (via request)
 * @ mystations
 * @ search
 *
 * @module services
 * @class services
 */

radioplayer.services = {

	unmuteAfterOverlay : false,

  heartbeatCounter : 0,
  heartbeatTimeout : null,

	annoInterval: null,
	annoTimeout : null,
	annoShowing : false,
	queuedAnnos: [],

  cookieTimeout: null,
  cookieShownInSession: false,
  cookieInterval: null,

	/**
	 * Save new cookie value
     *
     * @param cookieName {String}
     * @param value {String}
     */
	saveCookie : function(cookieUrlSuffix, cookieName, value, callbackfunc) {

		if (radioplayer.consts.reduced_func) return;

		var saveUrl = radioplayer.consts.api.init + cookieUrlSuffix;

		// This isn't supported by all browers and cookie settings due to use of cross domain cookies
		// That's why we have the reduced functionality mode
		saveUrl += "?" + cookieName + "=" + value;
		radioplayer.services.getAPI(saveUrl, callbackfunc);
	},

	/**
	 * Receive initialisation settings cookie and central management data from Radioplayer
     *
     * @method receiveInit
     * @param data {Object}
	 */
	receiveInit : function(data) {
		// Data received, so we can cancel the timeout set in init.js
		// which we set in event of this failing
		clearTimeout(radioplayer.initFailTimeout);

		// DEAD CONSOLE
		// The console is dead, so kill this page and redirect to a new URL
		if (data.dead) {
      radioplayer.services.analytics.sendEvent('Errors', 'Static Station', currentStationID, null, null);
			setTimeout(function() {
        window.location.href = data.dead.url;
      }, 100);
			return false;
		}

		// REDIRECT CONSOLE
		// A redirect is setup, so kill this page and redirect to a new URL
		if (data.redirect) {
			window.location.href = data.redirect.url;
			return false;
		}

		// COOKIE CHECK
		// Check status of primed cookie, to decide if cross domain cookies are supported
		if (data.primed) {
			// Browser supports cross domain cookies
			// init call will have set this back to false again
		} 
		else {
			// Browser does not support cross domain cookies
			radioplayer.consts.reduced_func = true;
			// Remove the heart icon from the head/dock
			$('#toggle-mystations').remove();
			// Remove My Stations and Recent menu tabs
      $('.menu-container .tabs ul li').eq(0).hide().removeClass('first');
      $('.menu-container .tabs ul li').eq(1).hide();
      $('.menu-container .tabs ul li').eq(2).css('width', '50%').addClass('first');
      $('.menu-container .tabs ul li').eq(3).css('width', '50%');
		}

		// INTERSTITIAL DISPLAY
		// If we are being asked to display an interstitial, show it.
		// NOTE: We cannot run interstitials in reduced functionality mode, as we cannot store a cookie to say we've seen them
		if (!radioplayer.consts.reduced_func) {
			// Check for the 'seen' cookie variable first
			var seenInterstitial = (data.interstitial && data.interstitial.seen);
			if(!seenInterstitial) {
				// Locally override interstitial
				if (window.initOptions && window.initOptions.interstitial && window.initOptions.interstitial.enabled) {
					data.interstitial = initOptions.interstitial;
				}

				if (!seenInterstitial && data.interstitial && data.interstitial.url && data.interstitial.url != "") {
					// Set session cookie to not show interstitial again
					radioplayer.services.saveCookie("interstitial/s", "interstitial", "true");
					
					setTimeout(function(){
						// Redirect to interstitial with player URL tagged on, so it can redirect back here
						var ourUrl = document.location.href;
						var interUrl = data.interstitial.url;

						interUrl += (interUrl.indexOf("?") > 0 ? "&" : "?") + "playerUrl=" + encodeURIComponent(ourUrl);
						window.location.href = interUrl;
					}, 200 );
					// Page will re-initialise after interstitial, so abandon this init
					return false;
				}
			}	
		}

		// VOLUME - sets volume from data we have retrieved
		if (data.volume && data.volume != "") {
      radioplayer.controls.currentVolume = data.volume;
    }

    // COOKIE NOTIFICATION
		if (data.seencookieanno) {
			if (radioplayer.consts.use_global_cookie_settings) {
				radioplayer.services.alerts.cookies.shown = true;
			}
    }

    // MY STATIONS
    // Determine if this station is in user's 'my stations'
    // If we don't have cookies (reduced func), we cannot have my stations functionality
		if (!radioplayer.consts.reduced_func) {
      var currentStationIsInMyStations = false;

      if (data.presets) {
        for(var i=0; i < data.presets.length; i++){
          var arrID = data.presets[i].split(":");
          radioplayer.settings.presets.push(arrID[1]);
          if (arrID[1]+'' == currentStationID+'') {
            currentStationIsInMyStations = true;
          }
        }
      }

      // Add class, toggle accessibility options based on this
      if (currentStationIsInMyStations) {
      	$('#toggle-mystations').children('.icon-heart').addClass('no-animation');
        $('#toggle-mystations').addClass('in-mystations')
									   .attr('title', radioplayer.lang.mystations.remove_this)
									   .find('.accessibility-text').html(radioplayer.lang.mystations.remove_this);
      } else {
        $('#toggle-mystations').attr('title', radioplayer.lang.mystations.add_this)
          .find('.accessibility-text').html(radioplayer.lang.mystations.add_this);
      }
    }

		$(radioplayer.services).trigger("gotPresets");

		// HISTORY AND LAST PLAYED
		// Set last played data if we have it
		if (data.lastplayed && data.lastplayed != "") {
			radioplayer.settings.lastplayed = data.lastplayed;
		}
		// Set history array if we have it
		if (data.history) {
			radioplayer.settings.history = data.history; //array of station IDs
		}

		$(radioplayer.services).trigger("gotMyStationsAndHistory");


		// STATION LETTER ID
		// What was the last letter the user looked at in the A-Z station list
		// (so we can scroll to that letter when we open the list)
		if (data.stationlistprefix) {
			radioplayer.settings.stationlistprefix = data.stationlistprefix;
		}


		// GUID
		if (data.guid) {
			radioplayer.settings.guid = data.guid;
		}

		// SONG ACTIONS
		// Determine if the station has song actions (Buy / Download etc) enabled
		// This can be from a local, hard-coded over-ride as well as from our data
		if (window.initOptions && window.initOptions.songaction && window.initOptions.songaction.enabled) {
			data.songaction = initOptions.songaction;
		}

		if (data.songaction) {
			radioplayer.playing.songAction = data.songaction; // Object with type, baseurl
			$(radioplayer.services).trigger("gotSongAction");
		}

		// LOAD SCRIPTS
		// If we need to inject any JS scripts, we do it here
		if (data.scripts) {
			$.each(data.scripts, function(index, scriptUrl) {
				radioplayer.services.getAPI(scriptUrl);
			});
		}

		// STREAM OVER-RIDE
		// We may want to override the station's stream
		// (only do this if we are litening to a live stream)
    if (window.audioLive && data.overridestream) {
        // Override the live stream of the player
        if (data.overridestream.type == 'rtmp') {
          window.audioArray = [{
            audioType: data.overridestream.type,
            audioServer: data.overridestream.server,
            audioEndpoint: data.overridestream.endpoint
          }];
        } 
        else {
          window.audioArray = [{
            audioType: data.overridestream.type,
            audioUrl: data.overridestream.url
          }];
        }
        window.bufferTime = data.overridestream.buffer;
    }

    // STREAM FALL BACK
		// A fallback URL can be given in case the locally defined ones fail
		// Store this for later use.
    if(window.audioLive && data.html5stream && !data.overridestream) {
      // If no override is set, HTML isn't defined locally, but we have it from Central systems.
      var audioType = "";

      if(typeof data.html5stream.type != "undefined") {
        audioType = data.html5stream.type;
      } 
      else {
        audioType = "http";
      }

      radioplayer.emp.player.html.audioHTMLFallback = [{
        audioType: audioType,
        audioUrl: data.html5stream.url
      }]
    }

    if(typeof window.audioArray == "undefined") {
    	window.audioArray = [];
    }

    //
    //	INITIALISE THE PLAYER
    //
		if (!vastAds.enabled && !tritonAds.enabled) {
    	radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
    	radioplayer.emp.dataReady();
    }
		//
		//	MANUALLY SHOW AN OVERLAY
		//	(can be in the data, or locally set)
		if (window.initOptions && window.initOptions.overlay && window.initOptions.overlay.enabled) {
			data.overlay = initOptions.overlay;
		}

		if (data.overlay) {
			radioplayer.services.overlay.queue(data.overlay.url, data.overlay.mute);
		}

		
		// SHOW ANNOUNCEMENT
		// If radioplayer has sent down an announcement, display it
		if (data.announcement) {
			radioplayer.services.alerts.anno.queue(data.announcement.text);
		} 
		else if (radioplayer.consts.reduced_func) {
			// If iOS on Safari, show an announcement explaining reduced functionality
			radioplayer.services.alerts.anno.queue(radioplayer.lang.general.reduced_func_anno);
		}

		// Whether we have announcements or not, we need to init the alerts manager
		radioplayer.services.alerts.init()
	},

	alerts: {
		showing: false,
		interval: null,
		init : function() {
			var adsWizzBlocker = false;
			// Determine if adswizz is a blocker
			if(adsWizz.enabled) {
				if (!radioplayer.controls.streamHasStarted || $('.radioplayer').hasClass('has-promo-overlay')) {
					adsWizzBlocker = true;
				}
			}

			if (adsWizzBlocker || (vastAds.enabled && !vastAds.shownVideo) || $('body').hasClass('showing-overlay') || tritonAds.enabled) {
				// We need to wait
				clearInterval(radioplayer.services.alerts.interval);
				// Set an interval to keep checking for an opportunity to play
				radioplayer.services.alerts.interval = setInterval(function(){
 					clearInterval(radioplayer.services.alerts.interval);
 					radioplayer.services.alerts.init();
   			}, 1500);
			}
			else {
				// We can now show something
				clearInterval(radioplayer.services.alerts.interval);

				// Annos take precedence
				if (radioplayer.services.alerts.anno.pending.length > 0) {
					var nextAnno = radioplayer.services.alerts.anno.pending.shift();
				  radioplayer.services.alerts.anno.show(nextAnno);
				}
				else if (!radioplayer.services.alerts.cookies.shown) {
					// Remove anno element if it exists
					if ($('.radioplayer-anno').length) {
						$('.radioplayer-anno').remove();
					}
				  radioplayer.services.alerts.cookies.show();
				}
			}
		},
		cookies: {
			showing: false,
			shown: false,
			show: function() {
				// If we have reduced functionality, or we have seen the message this session, return
				if (radioplayer.consts.reduced_func) {
					return false;
				}

				// If we have not seen the message, or want to force showing, continue  && document.cookie.indexOf("seencookieanno") == -1
				if ((radioplayer.consts.show_cookie_anno && !radioplayer.services.alerts.cookies.shown && document.cookie.indexOf("rp-seen-cookie-anno") == -1 && document.cookie.indexOf("seencookieanno") == -1) || radioplayer.consts.show_cookie_demo) {

					if(radioplayer.services.alerts.cookies.shown) {
						//if we are looking for global cookies, and our endpoint suggests we have seen the cookie notification
						// on another station's site, we don't show it here
						return false;
					}
					
					// Using expires rather than max-age to ensure correct function in IE (9, 10, 11);
					document.cookie = "rp-seen-cookie-anno=yes;expires=" + new Date( new Date().getTime()+radioplayer.consts.cookie_anno_ttl ).toGMTString(); // 10 years

					// Set the global seen cookie anno cookie
					radioplayer.services.saveCookie("seencookieanno/s", "seencookieanno", "true");

					radioplayer.services.alerts.cookies.showing = true;
					radioplayer.services.alerts.cookies.shown = true;

					// Set the close cookie message from lang file
					$('.cookie-demo-message').html(radioplayer.lang.general.cookie_message);
					$('.cookie-heart-text').html(radioplayer.lang.general.cookie_favourites_message);
					$('.cookie-menu-text').html(radioplayer.lang.general.cookie_menu_message);

					$('.cookie-demo').addClass('cookie-demo-on');

					$('.cookie-close-js').on('click', function() {
							$('.cookie-demo').addClass('cookie-demo--no-animation');
					    if(radioplayer.services.cookieTimeout) {
					      clearTimeout(radioplayer.services.cookieTimeout);
					    }
							radioplayer.services.alerts.cookies.showing = false;
					    $('.cookie-demo').removeClass('cookie-demo-on');
					});
					// Automatically close the cookie message after 10 seconds
					radioplayer.services.cookieTimeout = setTimeout(function(){
						radioplayer.services.alerts.cookies.showing = false;
					  $('.cookie-demo').removeClass('cookie-demo-on');
					  clearTimeout(radioplayer.services.cookieTimeout);
					},10000)
				}
			}
		},
		anno: {
			showing: false,
			pending: [],
			queue: function(text) {
				radioplayer.services.alerts.anno.pending.push(text);
			},
			show: function(text, suppressTimer) {
			  radioplayer.services.alerts.showing = 'anno';

			  if ($('.radioplayer-anno').length) {
			    // We've just shown another announcement, so the dom elements are still there, they just need animating in
			    $('.radioplayer-anno .anno-text').html(text);
			    $('.radioplayer-anno').animate({ top: '0px' }, 600);
			  } 
			  else {
		      // Insert a refresh announcement container
		      $('.radioplayer').append('<div class="radioplayer-anno"><div class="text-container"><p class="anno-text">' + text + '</p></div><div class="logo-container"><i class="rp-logo"></i></div><div class="close-anno-tab"><a href="#" class="hide-anno">Hide this message</a></div></div>');
		      // Click the cross to hide announcement
		      $('.radioplayer-anno').on('click', 'a.hide-anno', radioplayer.services.alerts.anno.hide);
			  }

			  if (!suppressTimer) {
			      // Auto hide the announcement after 15 seconds
			    radioplayer.services.annoTimeout = setTimeout(function(){
			    	radioplayer.services.alerts.anno.hide();
			    }, 15*1000);
			  }
			},
			hide: function() {
				radioplayer.services.alerts.showing = false;
				clearTimeout(radioplayer.services.annoTimeout);
				// Set session cookie to not show announcement
				radioplayer.services.saveCookie("announcement/s", "announcement", "true");
				
				$('.radioplayer-anno').animate({ top: '-900px' }, 600, function(){
					radioplayer.services.alerts.init();
				});
			}
		},
	},

	/**
	 * Handle showing commercial overlays
     *
     * @method showOverlay
     *
     * @param {String} content
     * @param {Boolean} mute
	 * @param {Boolean} insertHTML
     */

  overlay : {
  	showing: false,
  	initTimeout: null,
  	pending: [],
  	volumeControl: {
  		onOpen: function (mute) {
  			radioplayer.services.unmuteAfterOverlay = mute;
  			// Mute the stream, and prepare settings for when we hide the overlay
  			if (mute) {
  				radioplayer.controls.volumeLocked = true;

  				if (radioplayer.consts.is_iOS) {
  					// Don't actually mute as iOS doesn't handle this. Stop instead.
  					if (radioplayer.controls.isPlaying) {
  						radioplayer.emp.stop();
  					}
  					// Show press play prompt, as user will need to manually start stream playing again
  					radioplayer.controls.showPressPlayPrompt();
  				} 
  				else {
  					radioplayer.controls.savedVolume = radioplayer.controls.currentVolume;
  					if (radioplayer.emp.ready) {
  						// EMP is ready, so mute now
  						radioplayer.emp.setVolume(0);
  					} 
  					else {
  						// EMP is not ready, so need to mute it manually
  						radioplayer.controls.currentVolume = 0;
  						radioplayer.controls.onVolumeUpdate('', {volume:0});
  					}
  				}
  			}
  		},
  		onClose: function() {
  			if (radioplayer.services.unmuteAfterOverlay) {
  				radioplayer.controls.volumeLocked = false;
  				if (radioplayer.consts.is_iOS) {
  					// Don't actually unmute as iOS doesn't handle this. Play instead.
  					radioplayer.emp.resume();
  				} 
  				else {
  					radioplayer.controls.currentVolume = radioplayer.controls.savedVolume;
  					radioplayer.emp.setVolume(Math.round(radioplayer.controls.savedVolume));
  				}
  			}
  		}
  	},
  	queue: function(url, mute) {
  		var adsWizzBlocker = false;
  		// Determine if adswizz is a blocker
  		if(adsWizz.enabled) {
  			if (!radioplayer.controls.streamHasStarted || $('.radioplayer').hasClass('has-promo-overlay')) {
  				adsWizzBlocker = true;
  			}
  		}

			if (adsWizzBlocker || (vastAds.enabled && !vastAds.shownVideo) || radioplayer.services.overlay.showing || tritonAds.enabled) {

  		// If we already have an overlay showing, it takes precendence
  			if (!radioplayer.services.overlay.pending.length) {
  				radioplayer.services.overlay.pending.push({
	  				'type': 'init',
	  				'params': {
	  					'url': url,
	  					'mute': mute || false
	  				}
	  			});
  			}

  			// We need to wait
				clearInterval(radioplayer.services.overlay.interval);
				// Set an interval to keep checking for an opportunity to show this overlay
				radioplayer.services.overlay.interval = setInterval(function(){
 					clearInterval(radioplayer.services.overlay.interval);
 					radioplayer.services.overlay.queue(url, mute);
   			}, 4000);
  		}
  		else {
  			clearInterval(radioplayer.services.overlay.interval);
  			radioplayer.services.overlay.showInit(url, mute);
  		}
  	},
  	showInit: function(url, mute) {
  		radioplayer.services.overlay.showing = 'fromInit';
			var proxyUrl = xDomainProxyUrl;
			var prerollOverlay = '<div class="radioplayer-prerolloverlay radioplayer-prerolloverlay-contained">' +
                            '<iframe class="iframe-preroll" src="' + url + '" scrolling="no" seamless="seamless"></iframe>' +
                            '<div class="radioplayer-preroll-close-frominit"><a href="#"><span class="close">&times;</span><span class="close-text">Close</span></a></div>' +
                          '</div>';
      $('.radioplayer-body').append(prerollOverlay);

      radioplayer.services.overlay.volumeControl.onOpen(mute);

      radioplayer.overlay.initTimeout = setTimeout(function(){
      	radioplayer.services.overlay.hide();
      },60000)

	    //
	    //	Determine Close Behaviour
	    //
	    $('.radioplayer-preroll-close-frominit').on('click', function(e) {
        e.preventDefault();
        radioplayer.services.overlay.hide();
      });
  	},
  	adswizz: function(url, duration) {
  		// Hide existing adswizz overlay if it already exists
  		if(radioplayer.services.overlay.showing === 'adswizz') {
  			radioplayer.services.overlay.hide();
  		}
  		radioplayer.services.overlay.showing = 'adswizz';

  		$('.radioplayer').addClass('has-promo-overlay');
	    $('.radioplayer').addClass('adswizz-companion-showing');

	    var prerollOverlay = '<div class="radioplayer-prerolloverlay"></div>';
			$('.radioplayer-body').append(prerollOverlay);

	    $('.radioplayer').append('<div class="radioplayer-preroll-iframe-container"><iframe class="radioplayer-preroll-iframe" src="' + url + '" scrolling="no" seamless="seamless"></iframe></div><div class="radioplayer-preroll-close"><a href="#"><span class="close">&times;</span><span class="close-text">Close advert</span></a></div>');
	    $('.radioplayer-localwrapper').append('<div class="adswizz-control-blocker"></div>');

	    // Set the bg color of the overlay to be the same as the player
	    var bgColor = $('.radioplayer-localwrapper').css('background');
	    $('.radioplayer-prerolloverlay').css('background', bgColor);

      radioplayer.adswizz.overlayTimeout = setTimeout(function () {
			  radioplayer.services.overlay.hide();
				if (radioplayer.adswizz.DEBUG) radioplayer.utils.output('[adswizz] Hiding companion ad in overlay.');
			}, duration + 1000);

      radioplayer.services.overlay.volumeControl.onOpen(false);

	    //
	    //	Determine Close Behaviour
	    //
	    $('.radioplayer-preroll-close').on('click', function(e) {
        e.preventDefault();
        radioplayer.services.overlay.hide();
      });
      $('.adswizz-control-blocker').on('click', function(e) {
        e.preventDefault();
        radioplayer.services.overlay.hide();
      });
  	},
		vast: function (playerHTML, doNotMute) {
  		radioplayer.services.overlay.showing = 'vast';
			var mute = doNotMute ? false : true;

  		$('.radioplayer').addClass('has-promo-overlay');
  		$('.radioplayer-localwrapper').append('<div class="adswizz-control-blocker"></div>');

  		$('.radioplayer-body').append('<div class="radioplayer-prerolloverlay">' + playerHTML + '</div>');

  		if (radioplayer.emp.attemptedInit) {
      	radioplayer.services.overlay.volumeControl.onOpen(mute);
  		}
  	},
  	hide : function() {
  		radioplayer.services.overlay.showing = false;

  		// If we have a timeout to close the adswizz ad, we can remove this
  		if (radioplayer.adswizz.overlayTimeout !== null) {
  		  clearTimeout(radioplayer.adswizz.overlayTimeout);
  		}

  		// If there is a timeout on an initial overlay close this.
  		if (radioplayer.overlay.initTimeout !== null) {
  		  clearTimeout(radioplayer.overlay.initTimeout);
  		}

			// Post Pre-roll, proceed to (unmute stream)
			if(radioplayer.emp.attemptedInit && !radioplayer.emp.player.flash.used || radioplayer.emp.player.flash.empswf) {
				radioplayer.services.overlay.volumeControl.onClose(false);
			}

			// Tidy the DOM
    	$('.radioplayer').removeClass('adswizz-companion-showing');
			$('.radioplayer').removeClass('has-promo-overlay');
			$(".radioplayer-prerolloverlay").remove();
	    $(".radioplayer-preroll-close").remove();
	    $(".radioplayer-preroll-iframe-container").remove();
	    $(".adswizz-control-blocker").remove();
  	}
 	},

	/**
	 * Generic callback function for cross domain iframes
     *
     * @method xDomainIframeCallback
     *
     * @param objstr
     */
	xDomainIframeCallback : function(objstr) {

		var obj = jQuery.parseJSON(objstr);

		if (obj.method == 'post-preroll-proceed') {
			radioplayer.services.overlay.hide();
		}

	},


	/**
	 * Collect My Stations and their order
	 * Save to cookie
	 *
	 * @method saveMyStationsOrder
	 */
	saveMyStationsOrder : function() {
		var myStnsString = '';
		for(var i=0; i < radioplayer.settings.presets.length; i++){
			myStnsString += (myStnsString == '' ? '' : ',') + i + ':' + radioplayer.settings.presets[i];
		}
		radioplayer.services.saveCookie('ms/s', 'ms', myStnsString);
	},


	/**
	 * Call an API
	 * This replaces $.getScript, so we can set caching here, rather than globally for all use of jQuery
	 *
	 * @method getAPI
	 */
	getAPI : function(url, callbackfunc) {
		$.ajax({
			url: url,
			dataType: "script",
			cache: false,
			success: function(){
				// If there is a callback function defined, call it on success
				if (typeof callbackfunc !== 'undefined') {
					callbackfunc();
				}
			}
		});
	},

    /**
     * Radioplayer Analytics
     */
    analytics :  {

      loaded : false,
			$iframe : null,
			sentInitialMessage: false,

      /**
       * Init
       *
       * Create the analytics iframe and start the heartbeat.
       *
       * @method analytics.init
       *
       */
      init: function() {
        radioplayer.services.analytics.$iframe = $('<iframe />', {
          src:        radioplayer.consts.iframe.analytics + '?' +
                      'rpid=' + currentStationID +
                      '&cType=' + (audioLive ? 'live' : 'od&odUrl=' + audioArray[0].audioUrl),
          name: 		'GAAnalytics',
          id:   		'GAAnalytics',
          'class': 'crossdomain-iframe',
          load: function() {
            if (!!window.postMessage) { // If browser supports post message
							radioplayer.services.analytics.loaded = true;
							if (!radioplayer.services.analytics.sentInitialMessage && radioplayer.controls.currentVolume > 0 && radioplayer.controls.isListening) {
								radioplayer.services.analytics.sendPageview("")
							}
              setTimeout(function() {
                radioplayer.services.analytics.heartbeat();
              }, 20*1000); // Start heartbeat after 20 seconds

              // Send a final heartbeat when the user closes the
              if ($('html').hasClass('ie8')) {
              	window.onunload = function() {
              		radioplayer.services.analytics.heartbeat();
              	}
              }
              else {
              	window.onbeforeunload = function (e) {
              	  radioplayer.services.analytics.heartbeat();
              	};
              }
            }
          }
        });

        radioplayer.objs.body.append( radioplayer.services.analytics.$iframe );
      },

      /**
       * Send Analytics Event
       *
       * @method analytics.sendEvent
       *
       * @param category
       * @param action
       * @param label
       * @param value
       * @param noninteraction
       */
      sendEvent : function(category, action, label, value, noninteraction) {

            if(radioplayer.services.analytics.loaded && !$('html').hasClass('ie7')) {
								radioplayer.utils.output("iframe loaded");

                $('#GAAnalytics')[0].contentWindow.postMessage(JSON.stringify({
                    type: 'Event',
                    category: category,
                    action: action,
                    label: label,
                    value: value,
                    noninteraction: noninteraction
                }), "*");
            }
      },

      /**
       * Send Pageview
       *
       * Used for virtual pageviews, to track listening times.
       *
       * @method analytics.sendPageview
       * @param reason Something like 'play', 'pause', 'stop'
       */
      sendPageview : function(reason) {
          if(radioplayer.services.analytics.loaded) {
						radioplayer.services.analytics.sentInitialMessage = true
              $('#GAAnalytics')[0].contentWindow.postMessage(JSON.stringify({
                  type: 'Pageview',
                  reason: reason
              }), "*");
          }
      },

      /**
       * Heartbeat
       *
       * @method analytics.heartbeat
       */
      heartbeat: function() {
          if(radioplayer.services.analytics.loaded) {
              $('#GAAnalytics')[0].contentWindow.postMessage(JSON.stringify({
                  type: 'Heartbeat'
              }), "*");
          }
      }
    },

	/**
	 * Receive station list from Radioplayer
	 * Uses v1 style namespace
     *
     * @CrossDomain.prototype._processData
     * @param data {Object}
	 */
	CrossDomain : {
		prototype : {
			_processData : function(data) {
				radioplayer.stnList = data;
				$(radioplayer.services).trigger("stationListSet");
			}
		}
	}

};

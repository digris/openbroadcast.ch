/**
 * @name init
 * @description Initializes global variables, namespaces and sets up actions to occur when document is ready
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
 * @author Gav Richards <gav@gmedia.co.uk>
 * @author Steve Edson <steve@gmedia.co.uk>
 *
 * This file calls:
 * @ emp
 * @ controls
 * @ overlay
 * @ playing (via OD request)
 * @ services (via cookie request)
 *
 * This file is called by:
 * None
 *
 * @class init
 * @module init
 *
 */
/**
 * @class init
 */

// forces google compiler to keep the name space intact
if (!window.radioplayer) { window.radioplayer = radioplayer; }

// Avoid errors if we inadvertently commit some console.xxx calls.
if (!window.console) {
	window.console = {
		log: function () {},
		dir: function () {}
	};
}

var radioplayer = {
	config_opts: {
		prod_api: {
			stationList: 	'//static.'+ domainName +'/v1/json/StationList',
			init: 			'//cookie.'+ domainName +'/cm/',
			search: 		'//search.'+ domainName +'/qp/v3/search',
			suggest: 		'//search.'+ domainName +'/qp/v3/suggest',
			onAir: 			'//search.'+ domainName +'/qp/v3/onair',
			pollOnAir: 		'//np.'+ domainName +'/qp/v3/onair',
			nowNext: 		'//np.'+ domainName +'/qp/v3/events',
			onDemand: 		'//search.'+ domainName +'/qp/v3/oditem',
			recommend: 		'//search.'+ domainName +'/qp/v3/recommend',
			az: 			'//search.'+ domainName +'/qp/v3/stations'
		},
		dev_api: {
			stationList: 	'/v1/json/StationList',
			init: 			'/cm/',
			search: 		'/qp/v3/search',
			suggest: 		'/qp/v3/suggest',
			onAir: 			'/qp/v3/onair',
			pollOnAir: 		'/qp/v3/onair',
			nowNext:      	'/qp/v3/events',
			onDemand: 		'/qp/v3/oditem',
			recommend: 		'/qp/v3/recommend',
			az: 			'/qp/v3/stations'
		}
	},

	consts: {
    consolelog:                 true,
    is_responsive:              false,
    block_now_next:             false, //only true for demos
    is_iOS:                     false,
    is_Android:                 false,
    reduced_func:               false,
    assetBaseUrl:               '', // If set, it should end with a slash
    force_reduced_func:         false,
    show_cookie_anno:           true, // Whether the cookie notification is enabled
    show_cookie_demo:           false, // if true, forces the cookie notice to show even if already seen (demo/dev/testing purpose)
    use_global_cookie_settings: true, // if true, cookie notice will not show if it has been seen before on any other radioplayer player
    cookie_anno_ttl:            (60*60*24*365*10), // 10 years
    api: {},
    iframe: {
        analytics: 		'//static.'+ domainName +'/v3/analytics.html'
    }
	},

	services: { },
	emp: { },
	controls: { },
	playing: { },
	overlay: { },
	mystations: { },
	history: { },
	search: { },
	lang: { },
	utils: { },
	adswizz: { },
	vast: {},
    build: {"version": "3.2.3"},

	settings: {
		lastplayed: currentStationID,	// this is stored, but not currently actively used anywhere
		presets: [],
		history: [],
		stationlistprefix: '',
		guid: ''
	},

	stnList: { },

	querystring: { },
	initFailTimeout: null,
	startAtSeconds: 0,
	themeColour: 'dark',
	mouseActive: false,

	objs: {
		body: null,

		searchBox: null,
		searchInput: null,

		overlayContainer: null,
		stickyLetterDivide: null,

		suggestContainer: null,

		searchContainer: null,
		searchKeywords: null,
		searchResults: null,
		searchAllContainer: null,
		searchLiveContainer: null,
		searchODContainer: null,

		nowPlayingStrip: null,
		scrollingContainer: null,
		scrollingText: null
	}
};

radioplayer.initPlayback = function() {

	//	Set a timeout, so that if we cannot initialise following
	//  a callback from our telemmetry call (see below), then we
	//  still initialise the stream
	radioplayer.initFailTimeout = setTimeout(function() {
		// Determine whether we need to / can show the cookie announcement
		// (we won't be getting any mgmt ctrl anno info, so we need to init that process here)
		radioplayer.services.alerts.init();
		// Start the stream
		if (!vastAds.enabled && !tritonAds.enabled) {
			if (window.audioArray && window.audioArray.length) {
				radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
			}
			radioplayer.emp.dataReady();
		}
	}, 5000);

	// TRY TO RETRIEVE COOKIE INFORMATION AND TELEMMETRY INFORMATION
	//
	// (from the callback function, we initialise the stream)
	//
	// NOTE: If we do not receive a response, initFailTimeout will be called
	// to initialise the stream
	//
	// ---> services.receiveInit
	var initQS = "?callback=radioplayer.services.receiveInit";
	if (radioplayer.querystring.stationlistprefix) {
		initQS += "&stationlistprefix=" + radioplayer.querystring.stationlistprefix.toLowerCase();
	}

	//  If reduced functionalty, we don't need to set the primed cookie
	if (radioplayer.consts.force_reduced_func) {
		radioplayer.services.getAPI(radioplayer.consts.api.init + "init/" + currentStationID + initQS);
	}
	else {
		// Set the primed cookie, to test cross domain cookie support
		radioplayer.services.saveCookie('primed/s', 'primed', 'true', function(){
			radioplayer.services.getAPI(radioplayer.consts.api.init + "init/" + currentStationID + initQS);
		});
	}
}

/**
 * Language loader
 * expand this as you like depending how many languages your slm is able to export
 * for example CH supports consoles in 4 different languages
 * this will load the correct language during init
 * @TODO tell SLM to copy the correct language file and copy only that in your js application
 * @TODO because of minification this might be tricky
 */

radioplayer.setLanguage = function (languageCode) {
    var code = "lang_" + languageCode;
    if (typeof radioplayer[code] != "undefined")
    {
        radioplayer.lang = radioplayer[code];
    }
    else
    radioplayer.lang = radioplayer.lang_en;
}


/**
 * Initialise Radioplayer
 *
 * @method radioplayer.init()
 */
radioplayer.init = function () {
    /*
     * Set interface language
     */
    radioplayer.setLanguage(langCode);

    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);
	/**
	 * Drop query string parameters into object for later use
	 */
	radioplayer.querystring = radioplayer.utils.getQueryStringObj();

	radioplayer.consts.is_responsive = isResponsive || false;
	radioplayer.consts.use_global_cookie_settings = useGlobalCookieSettings || false

	radioplayer.consts.assetBaseUrl = assetBaseUrl ? assetBaseUrl : radioplayer.consts.assetBaseUrl;
	radioplayer.consts.flashToUseAssetBaseUrl = flashToUseAssetBaseUrl || false;
	radioplayer.consts.customVastURLHandler = customVastURLHandler || null;


	/**
	 * Initialize api for development or production endpoints depending on querystring
	 */
	if (radioplayer.querystring.devapi) {
		radioplayer.config_opts.dev_api.stationList	= '//' + radioplayer.querystring.devapi + '/v1/json/StationList';
		radioplayer.config_opts.dev_api.init				= '//' + radioplayer.querystring.devapi + '/cm/';
		radioplayer.config_opts.dev_api.search			= '//' + radioplayer.querystring.devapi + '/qp/v3/search';
		radioplayer.config_opts.dev_api.suggest			= '//' + radioplayer.querystring.devapi + '/qp/v3/suggest';
		radioplayer.config_opts.dev_api.onAir				= '//' + radioplayer.querystring.devapi + '/qp/v3/onair';
		radioplayer.config_opts.dev_api.pollOnAir		= '//' + radioplayer.querystring.devapi + '/qp/v3/onair';
		radioplayer.config_opts.dev_api.nowNext		  = '//' + radioplayer.querystring.devapi + '/qp/v3/events';
		radioplayer.config_opts.dev_api.onDemand		= '//' + radioplayer.querystring.devapi + '/qp/v3/oditem';
		radioplayer.config_opts.dev_api.recommend		= '//' + radioplayer.querystring.devapi + '/qp/v3/recommend';
		radioplayer.config_opts.dev_api.az					= '//' + radioplayer.querystring.devapi + '/qp/v3/stations';
		radioplayer.consts.api = radioplayer.config_opts.dev_api;
	} else {
		radioplayer.consts.api = radioplayer.config_opts.prod_api;
	}


	// Determine if we want to add the responsive class, which will ensure the plugin body behaves responsively
	// Currently this is set above (in init.js)
	if (radioplayer.consts.is_responsive) {
			$('body').addClass('responsive-on');
	}

	/**
	 * Set browser booleans which we can't get from jQuery's browser plugin
	 */
	radioplayer.consts.is_iOS = /(iPad|iPhone|iPod)/.test(navigator.userAgent);
	radioplayer.consts.is_Android = /(Android)/.test(navigator.userAgent);
	if(radioplayer.consts.is_Android) {
		$('body').addClass('isAndroid');
	}

    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        $('body').addClass('isSafari');
    }

		/**
		 * Override reduced_func if force_reduced_func is set
		 */
	if (window.force_reduced_func) radioplayer.consts.force_reduced_func = true;
	if (radioplayer.consts.force_reduced_func) radioplayer.consts.reduced_func = true;

	if (radioplayer.consts.reduced_func) {
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


	/**
	 * Localisation
	 */
	$('.radioplayer-globalnav .rp-logo-container .accessibility-text').html(radioplayer.lang.general.radioplayer);
	$('.radioplayer-globalnav .menu-btn').attr('title', radioplayer.lang.general.open_menu).find('.menu-btn-accessible').html(radioplayer.lang.general.open_menu);

	//
	// Set Debug Options based on query string
	//

	if (radioplayer.querystring.debug) {
		radioplayer.consts.consolelog = true;
		if(radioplayer.querystring.debug.replace('/','') === 'true') {
			radioplayer.adswizz.DEBUG = true;
		}
		if(radioplayer.querystring.debug.replace('/','') === 'true') {
			radioplayer.emp.DEBUG = true;
		}
	}
	else {
		// If debug mode off, effectively disable console log
		window.console = {
			log: function () {},
			dir: function () {}
		};
	}

	// Log the build number
	var build = radioplayer.build;
	console.log("Version: "+build.version);

	//
	// Theme Colour
	//
	if ($('.radioplayer').hasClass('light-theme')) {
		radioplayer.consts.themeColour = "light";
	}


	/**
	 * Grab body DOM object for later use
	 */
	radioplayer.objs.body = $('body');


	/**
	 * Prepare to auto handle OD content
	 */
	if (radioplayer.querystring.rpAodUrl) {
		// Overwrite EMP variables to use AOD
		audioLive = false;

		audioArray = [{
			audioType: "http",
			audioUrl: radioplayer.querystring["rpAodUrl"]
		}];

		// Populate Playing overlay once with OD info, so prevent it auto populating with Live info
		nowPlayingSource = 'OD';
	}

	/***
			For demo purposes, we need to see if we are forcing the display of the on-boarding window
	***/
	if (radioplayer.querystring["force-onboarding"]) {
		radioplayer.consts.show_cookie_demo = radioplayer.querystring["force-onboarding"].replace('/','');
	}

	/**
	 * Pick up timestamp from query string, use that as the start point for OD audio
	 */
	if (radioplayer.querystring.t && !audioLive) {

		radioplayer.startAtSeconds = radioplayer.utils.convertTimeToSeconds(radioplayer.querystring.t);

		radioplayer.utils.output('start at ' + radioplayer.startAtSeconds + ' seconds into OD audio');

		$(radioplayer.emp).on('loaded', function(){
			if (radioplayer.startAtSeconds > 0 && radioplayer.startAtSeconds <= (radioplayer.controls.rawDuration / 1000)) {
				radioplayer.emp.seek(radioplayer.startAtSeconds);
				radioplayer.startAtSeconds = 0;
			}
		});
	}

	/**
	 * Initialize VAST component
	 */
	if(vastAds.enabled) {
		radioplayer.vast.init();
	}

	/**
	 * Initialize Triton component
	 */
	if (tritonAds.enabled && !vastAds.enabled) {
		radioplayer.triton.enabled = true;
		radioplayer.triton.init(audioLive);
	}

	/**
	 * Initialize AdsWizz component
	 */
	if (adsWizz.enabled && !tritonAds.enabled) {
		radioplayer.adswizz.init();
	}

	/**
	 * Initialize Player Controls
	 */
	radioplayer.controls.init();

	/**
	 * Initialize My Stations
	 */
	radioplayer.mystations.init();

	/**
	 * Initialize Now Playing Strip
	 */
	if (audioLive) {
		radioplayer.playing.init();
	} else {
		// Fetch OD information. If we don't get anything, we fall back with ID3 -> Nothing
		radioplayer.services.getAPI(radioplayer.consts.api.onDemand +
			"?odUrl=" + document.location.href +
			"&nameSize=200" +
			"&descriptionSize=200" +
			"&callback=radioplayer.playing.receiveOD");
	}


	/**
	 * Initialize Overlays
	 */
	radioplayer.overlay.init();


	/**
	 * Initialize Search
	 */
	radioplayer.search.init();


	/**
	 * Start Analytics iFrame
	 */
	radioplayer.services.analytics.init();

	/**
	 * We want to scale the plugin area if the content isn't responsive
	 * and we go below 360px
	 */
	if(!radioplayer.consts.is_responsive) {
		var scalePluginArea = function() {
			var viewportWidth = radioplayer.utils.getViewportWidth();

			if ( viewportWidth < 360 && viewportWidth >= 320) {
				var scale = viewportWidth / 360;
				$('.radioplayer-plugin').css('transform', 'scale('+scale+')');
			}
			else if (viewportWidth >= 360) {
				$('.radioplayer-plugin').css('transform', 'scale(1)');
			}
		}

		if(radioplayer.utils) {
			scalePluginArea();
		}
	}

	$(window).on('resize', function(){
		if(!radioplayer.consts.is_responsive) {
			scalePluginArea();
		}

		if ($('html').hasClass('ie8')) {
			var viewportWidth = radioplayer.utils.getViewportWidth();
			if (viewportWidth < 340) {
				$('.stn-logo').addClass('stn-logo-ie8-xs');
				$('.stn-logo').removeClass('stn-logo-ie8');
			}
			else if (viewportWidth < 390) {
				$('.stn-logo').addClass('stn-logo-ie8');
				$('.stn-logo').removeClass('stn-logo-ie8-xs');
			}
			else {
				$('.stn-logo').removeClass('stn-logo-ie8');
				$('.stn-logo').removeClass('stn-logo-ie8-xs');
			}
		}

		radioplayer.overlay.resizeMenuTabs();
	});


	//
	// Initial styling
	//
	if ($('html').hasClass('ie8') && $('.stn-logo').css('background-image') && $('.stn-logo').css('background-image').indexOf('url(') > -1) {
		var url = $('.stn-logo').css('background-image').split('url(')[1].split(')')[0];
		var url = url.replace(/"/g, "")
		$('.stn-logo').html("<img src='"+url+"' />");
		$('.stn-logo').css('background-image', 'none');
	}

	if ($('html').hasClass('ie8')) {
		var viewportWidth = radioplayer.utils.getViewportWidth();
		if (viewportWidth < 340) {
			$('.stn-logo').addClass('stn-logo-ie8-xs');
		}
		else if (viewportWidth < 390) {
			$('.stn-logo').addClass('stn-logo-ie8');
		}
	}
	/**
	 * Accessibility handling of element outlines
	 */
	$(document).on('mousedown', function(){
		// Apply a class to body which we can use to set outline:none;
		if (!radioplayer.mouseActive) {
			radioplayer.mouseActive = true;
			radioplayer.objs.body.addClass('rp-mouseactivity');
		}

	}).on('keydown', function(){
		// Remove class from body so outlines are used
		if (radioplayer.mouseActive) {
			radioplayer.mouseActive = false;
			radioplayer.objs.body.removeClass('rp-mouseactivity');
		}
	});


	/**
	 * If a link in the plugin space has data attribute 'newstationid' then apply analytics hook
	 * This should be used for sideways navigation, from one console to another
	 */
	$('.radioplayer-plugin').on('click', 'a[data-newstationid]', function(){
		var stnId = $(this).attr('data-newstationid'),
			href = $(this).attr('href');

		radioplayer.overlay.sidewaysNavigate('Plugin Space', stnId, href);
	});


	//
	//	INIT THE STREAM
	//

	radioplayer.initPlayback()

	/**
	 * Get station list
	 * Received in services
	 */
	var stnListExt = ".jgz";
	if ($.browser.msie && $.browser.version==6) stnListExt = ".js"; // Use .js extension for IE6 where compression is not as well supported
	radioplayer.services.getAPI(radioplayer.consts.api.stationList + stnListExt);
		/**
		 * Add 'rp-js' class to html element to indicate library is available
		 */
	$('html').addClass('rp-js');

};
/**
 * @module utils
 * @class utils
 */


if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		 for (var i = (start || 0), j = this.length; i < j; i++) {
			 if (this[i] === obj) { return i; }
		 }
		 return -1;
	}
}


radioplayer.utils = {

	/**
	 * Console Log abstraction
	 *
	 * @method output
	 * @returns {String} string to log
	 */

	output : function(str) {
		if (radioplayer.consts.consolelog) {
			// Only log if the option is enabled
			console.log(str);
		}
	},


	/**
	 * @method setSelectionRange
	 * @param input
	 * @param selectionStart
	 * @param selectionEnd
	 */
	setSelectionRange : function(input, selectionStart, selectionEnd) {
		if (input.setSelectionRange) {
			input.focus();
			input.setSelectionRange(selectionStart, selectionEnd);
		}
		else if (input.createTextRange) {
			var range = input.createTextRange();
			range.collapse(true);
			range.moveEnd('character', selectionEnd);
			range.moveStart('character', selectionStart);
			range.select();
		}
	},


	/**
	 * @method setCaretToPos
	 * @param input
	 * @param pos
	 */
	setCaretToPos : function(input, pos) {
		radioplayer.utils.setSelectionRange(input, pos, pos);
	},


	/**
	 * Get Query String Object from current location URL
	 *
	 * @method getQueryStingObj
	 * @returns {Object} Object containing query string
	 */
	getQueryStringObj : function() {
		return this.getQueryStringObjFromUrl(String(location.search));
	},


	/**
	 * Get Query String Object from URL
	 *
	 * @method getQueryStingObjFromUrl
	 * @param {String} urlStr Url with query string
	 * @returns {Object} Object containing query string
	 */
	getQueryStringObjFromUrl : function(urlStr) {
		var querystring = urlStr.replace('?', '').split('&');
		var queryObj = {};
		for (var i = 0; i < querystring.length; i++) {
			var name = querystring[i].split('=')[0];
			var value = querystring[i].split('=')[1];
			queryObj[name] = value;
		}
		return queryObj;
	},

	/**
	 * Read a local cookie if cookies are enabled.
	 * @method getLocalCookie
	 * @param			{String}	name		Name of the cookie to be retrieved.
	 * @returns		{String}					Value of the cookie (empty string if not found)
	 */
	getLocalCookie: function(name) {
		var value = "";

		if (navigator.cookieEnabled) {
      value = document.cookie.match(name + '=([^;]*)');
      value = (value && unescape(value[1])) || "";
		};

		return value;
	},

	/**
	 * Set a local cookie if cookies are enabled.
	 * @method setLocalCookie
	 * @param		{String}		name					Name of the cookie to be set.
	 * @param		{String}		value					Value of the cookie to be set.
	 * @param		{String}		expiryDate		Expiration date of the cookie in UTC format. Results in session cookie if empty string is passed.
	 * @param		{String}		path					Path for which the cookie is valid. Not set if empty string is passed.
	 * @param		{String}		domain				Domain for which the cookie is valid. Not set if empty string is passed.
	 * @param		{Boolean}		secureOnly		true if cookie is only transmitted over https. Not set if false is passed.
	 */
	setLocalCookie: function(name, value, expiryDate, path, domain, secureOnly) {
		var cookieVal = "";
		if (navigator.cookieEnabled) {
			cookieVal = name + "=" + value;

			if ((typeof expiryDate !== 'undefined') && (null !== expiryDate) && ('' !== expiryDate)) {
			 cookieVal += '; expires=' + expiryDate;
			}
			if ((typeof path !== 'undefined') && (null !== path) && ('' !== path)) {
			 cookieVal += '; path=' + path;
			}
			if ((typeof domain !== 'undefined') && (null !== domain) && ('' !== domain)) {
			 cookieVal += '; domain=' + domain;
			}
			if (secureOnly) {
			 cookieVal += '; secure';
			}

			document.cookie = cookieVal;
    }
	},

	/**
	 * Given a time string like '1h30m6s', it is converted to seconds as an integer
	 *
	 * @method convertTimeToSeconds
	 * @param {string} time
	 * @returns {integer} outputSeconds
	 */
	convertTimeToSeconds : function(time){

		var modifiers = 'g', // Global - Matches more than one result
			pattern = '[0-9]+[HMShms]{1}', // Look for 0 or more numbers, followed by 1 character of a string
			regex = new RegExp(pattern,modifiers),
			array = time.match(regex), // Match all results of above regex
			outputSeconds = 0,
			multiplierValue,
			timeValue;

		if ($.isArray(array)) {

			for (var i = 0; i < array.length; i++) {

				multiplierValue = array[i].charAt(array[i].length-1); // Get either 'h', 'm' or 's' from last character of string
				timeValue = array[i].substr(0,array[i].length - 1); // Remove last character so we have the remaining time only

				if (multiplierValue == 'h') { // Hours
					outputSeconds += parseInt(timeValue * 60 * 60);
				} else if (multiplierValue == 'm') { // Minutes
					outputSeconds += parseInt(timeValue * 60);
				} else if (multiplierValue == 's') { // Seconds
					outputSeconds += parseInt(timeValue);
				}

			}

		}

		return outputSeconds;

	},


	windowWidth: function() {
		if ('undefined' !== typeof window.outerWidth) {
			return window.outerWidth;
		} else {
			return 396;		// default value for IE8, where outerWidth is not supported
		}
	},


	windowHeight: function() {
		if ('undefined' !== typeof window.outerHeight) {
			return window.outerHeight;
		} else {
			return 730;		// default value for IE8, where outerHeight is not supported
		}
	},


  getViewportWidth : function() {
      var e = window
      , a = 'inner';
      if ( !( 'innerWidth' in window ) ) {
          a = 'client';
          e = document.documentElement || document.body;
      }
      return e[ a+'Width' ]
  },

  /**
   * Cross browser solution to consistently resize browser window
   *
   * @method resizeViewPort
   * @param {integer} width
   * @returns {integer} height
   */
   resizeViewPort: function(targetWidth, targetHeight) {
	    var innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	    var innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	    window.resizeBy(targetWidth-innerWidth, targetHeight-innerHeight);
	}

};
/**
 * @name exceptions
 * @description All custom exceptions thrown by radioplayer applications
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
 * @author Frank Sattler <frank@invantio.com>
 *
 *
 * This file is called by:
 * @ adswizz
 *
 * @class exceptions
 * @module exceptions
 */

radioplayer.exceptions = {
  decorateStreamURLException : function() {
    return {
      name: 'decorateStreamURLException',
      message: 'Could not decorate stream URL.'
    };
  }
};
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
 * @name emp.player.flash
 * @description Initialization of Flash EMP and controls
 *
 *
 * Notes from previous version (V2)
 *
 * 1. Request settings cookie
 * - We get a response
 * 	   Proceed to step 2
 * - We wait and don't get a response
 * 	   Set volume to 100 and proceed to step 2
 *
 * 2. Check if EMP has said it is ready (set a boolean)
 * - It is
 * 	   Pass variables it needs, along with volume from step 1
 * - It's not
 * 	   Wait for the call from the EMP that tells us it is ready.
 * 	   Immediatly return the variables it needs, along with volume from step 1
 *
 * This file calls:
 * The embedded flash emp object flash/RadioplayerEMPv3.swf
 *
 * This file is called by:
 * - emp
 * - controls
 *
 * @authors Gav Richards <gav@gmedia.co.uk>
 * @authors Robin Wilding <robin@wilding.co.uk>
 * @authors Mark Panaghiston <markp@happyworm.com>
 *
 * @class emp.player.flash
 * @module emp
 *
 */


radioplayer.emp.player.flash = {
	ready : false, // Can be set by EMP Object to declare it is ready to receive parameters
	waitingForReady : false,
	swfname: null,

	api: null, // Pointer to the API object
	$api: null, // The api with a jQuery wrapper
	available: false, // True if this solution is viable
	used: false, // True if this solution is being used

	// Note that the following audio media propeties are not maintained past the initial instancing operation.
	audioType : "http", 
	audioUrl : "", 
	audioServer : "", 
	audioEndpoint : "", 
	audioLive : true,
	ioErrorCount: 0,
	ioErrorTimeout: null,

	// waitingForReady: null,

	flashVersion: "10.0.0",

	// Hold the V3 audio definitions - Maintained.
	audioFlash: [],

	init: function(api) {
		this.api = api;
		this.$api = $(api);
	},
	
	/**
	 * Create EMP Object using SWFObject
     *
     * @method createObject
     * @param swfpath
     * @param size
     * @private
	 */
	createObject : function(swfpath, size) {
		var baseUrl = radioplayer.consts.flashToUseAssetBaseUrl ? radioplayer.consts.assetBaseUrl : '';
		var self = this;
		// Embed here using SWFObject
		if(swfpath == null) swfpath = "EMP3.2.1.swf";
		this.swfname = swfpath.split(".swf")[0] ;
		var flashvars = {};
		var params = {
			menu: "false",
			scale: "noScale",
			allowFullscreen: "false",
			allowScriptAccess: "always",
			bgcolor: "0x000000"
		};
		var attributes = {
			id:this.swfname,
			name:this.swfname
		};
		
		if(size == null) size = "0";
		swfobject.embedSWF(
			baseUrl+"flash/"+swfpath,
			this.api.id, size, size, this.flashVersion, 
			null, 
			flashvars, params, attributes, function(e){
				if (e.success == false) {
					// This should never happen, due to check in init() and logic in radioplayer.emp
					self.$api.trigger(self.api.event.noSupport, self.getEventObject());
				}
			});
		
	},
	
	/**
	 * Called either when we receive cookie settings, 
	 * or if that request fails and we proceed anyway with volume set to 100
     *
     * @method dataReady
     * @private
	 */
	dataReady : function() {
		if(this.api.DEBUG) radioplayer.utils.output("flash: Try to initialize the EMP SWF, if it is ready");
		if (this.ready) {
			// EMP is already ready, so pass it variables to begin playing
			if(this.api.DEBUG) radioplayer.utils.output("flash: EMP SWF ALREADY READY");
			this.passParamsToEMP();
		} else {
			// EMP is not ready yet, so start listening for it to call us
			if(this.api.DEBUG) radioplayer.utils.output("flash: EMP SWF NOT READY");
			this.waitingForReady = true;
			// Detect whether the browser has blocked flash player, and if we think it has
			// we want to init the HTML5 player...
			this.waitingTimeout = setTimeout($.proxy(function(){
				if(this.waitingForReady){
					this.waitingForReady = false;
					radioplayer.emp.player.ready = false;
					radioplayer.emp.player.flash.available = false;
					radioplayer.emp.player.flash.used = false;
					radioplayer.emp.player.flash.blocked = true;
					radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
       		radioplayer.emp.dataReady();
				}
			},this),1500);
		}
		// When we're done, save all settings back to the cookie ?
		// Not sure if this is necessary
	},
	
	/**
	 * Called by EMP when it is ready to begin accepting variables
	 * Only used if the JS is ready first, before the EMP
	 * This is then used to wait for the EMP and proceed when it is ready
     *
     * @method empReady
     * @private
	 */
	empReady : function() {
		if(this.api.DEBUG) radioplayer.utils.output("flash: EMP SWF REPORTS READY");
		this.ready = true;
		this.api.ready = true;
		this.empswf = document.getElementById(this.swfname);
		this.respondToEmp("empReady");
		if (this.waitingForReady) {
			this.waitingForReady = false;
			clearTimeout(this.waitingTimeout);
			if(this.api.DEBUG) radioplayer.utils.output("flash: EMP SWF is now ready to begin receiving parameters");
			this.passParamsToEMP();
		}
	},
	 
	/**
	 * Set parameters for EMP to use when it is ready
     *
     * @method setParams
     *
     * @param audioType
     * @param audioUrl
     * @param audioServer
     * @param audioEndpoint
     * @param audioLive
     * @param bufferTime
     * @private
     */
	setParams : function(audioType, audioUrl, audioServer, audioEndpoint, audioLive, bufferTime) {
		this.audioType = audioType;
		this.audioUrl = audioUrl;
		this.audioServer = audioServer;
		this.audioEndpoint = audioEndpoint;
		this.audioLive = audioLive;
		this.bufferTime = bufferTime;
	},
	
	/**
	 * Set parameters for EMP to use when it is ready
     *
     * @method setAudioParams
     * @since V3
     *
     * @param audioFlash
     * @param audioLive
     * @param bufferTime
     * @private
     */
	setAudioParams : function(audioFlash, audioLive, bufferTime) {
		this.audioFlash = (audioFlash && audioFlash.length) ? audioFlash : [];
		this.audioLive = audioLive;
		this.bufferTime = bufferTime;
	},
	
	/**
	 * Pass parameters to EMP now that it is ready
     *
     * @method passParamsToEMP
     * @private
	 */
	passParamsToEMP : function() {
		if(this.api.DEBUG) this.empswf.emp_setDebugMode(true); // - advanced Flash EMP debugging
		if(this.api.DEBUG) radioplayer.utils.output("flash: Passing parameters to EMP SWF object");
		
		if (this.audioFlash[0].hasOwnProperty("cacheKiller")) {
			radioplayer.utils.output('Set cache killer to: ' + (this.audioFlash[0].cacheKiller ? 'true' : 'false'));
			this.empswf.emp_setUseCacheKiller(this.audioFlash[0].cacheKiller);
		}
		
		if(this.audioFlash.length) {
			this.setAudio(this.audioFlash);
		} else if (this.audioType === "rtmp") {
			this.loadRTMPStream(this.audioServer, this.audioEndpoint);
		} else if (this.audioType === "http") {
			this.loadHTTPStream(this.audioUrl);
		} else if (this.audioType === "httpmp4m4a" || this.audioType === "httpaac" || this.audioType === "aac") {
			this.loadHTTPMP4M4AStream(this.audioUrl);
		} else if (this.audioType === "playlist") {
			this.loadPlaylist(this.audioUrl);
		} else if (this.audioType === "hls") {
			this.loadHLSStream(this.audioUrl);
		} else {
			this.$api.trigger(this.api.event.noSupport, this.getEventObject());
		}
		var mode = (this.audioLive ? "live" : "od");
		this.setPlaybackMode(mode);
		this.setVolume(radioplayer.controls.currentVolume);
		this.empswf.emp_setBufferTime(this.bufferTime);
	},

	/**
	 * Set the Audio to play
     *
     * @method setAudio
     * @since V3
     *
     * @param audioFlash
     * @private
     */
	setAudio: function(audioFlash) {
		var self = this,
			audioPicked, audioHigh;

		this.cleanup();

		this.audioFlash = (audioFlash && audioFlash.length) ? audioFlash : [];

		// The Flash should be able to play anything thrown at it, that obeys the V2 EMP system.
		// So taking the first one off the array.

    audioPicked = this.audioFlash.length ? this.audioFlash[0] : false;

		if(audioPicked) {
			this.passSetAudio(audioPicked);
		} else {
			this.$api.trigger(this.api.event.noSupport, this.getEventObject());
		}
	},

	/**
	 * Pass the audio object from the new V3 API to the V2 API commands..
     *
     * @method passSetAudio
     *
     * @param audio
     * @private
     */
	passSetAudio: function(audio) {
		if (audio.audioType === "rtmp") {
			this.loadRTMPStream(audio.audioServer, audio.audioEndpoint);
		} else if (audio.audioType === "http") {
			this.loadHTTPStream(audio.audioUrl);
		} else if (audio.audioType === "httpmp4m4a" || this.audioType === "httpaac" || this.audioType === "aac") {
			this.loadHTTPMP4M4AStream(audio.audioUrl);
		} else if (audio.audioType === "playlist") {
			this.loadPlaylist(audio.audioUrl);
		} else if (audio.audioType === "hls") {
			this.loadHLSStream(audio.audioUrl);
		} else {
			this.$api.trigger(this.api.event.noSupport, this.getEventObject());
		}
	},

	/**
	 * Allows test runner to test that javascript has recieved events from the swf emp.
     *
     * @method respondToEmp
     *
     * @param message
     * @private
     */
	respondToEmp : function(message) {
		this.empswf.emp_reportResponse(message);
	},
	
	/**
	 * EMP callback event
     *
     * @method empPlaylistLoaded
     * @private
	 */
	empPlaylistLoaded : function() {
		this.respondToEmp("radioplayer.emp.empPlaylistLoaded");
	},
	
	/**
	 * testRunnerRun allows the test runner to trigger js to call a method on the swf api (replaces and automates the old 
	 * "load playlist" button.
     *
     * @method testRunnerRun
     *
     * @param testRunnerRun
     * @private
	 */
	testRunnerRun : function (functionToRun) {
		this[functionToRun]();
	},
	
	/**
	 * Allows for automated test of playlist loading.
     *
     * @method testRunnerLoadPlaylist
     * @private
	 */
	testRunnerLoadPlaylist : function() {
		this.empswf.emp_loadPlaylist("testplaylists/testXSPF.xspf");
	},

	/**
	 * Control API methods
	 */
	
	/* Directly load an RTMP stream with 'server' and 'endpoint' urls */
	loadRTMPStream: function(server, endpoint) {this.empswf.emp_loadRTMPStream(server, endpoint); },
	/* Directly load an HTTP stream from url */
	loadHTTPStream: function(url) {this.empswf.emp_loadHTTPStream(url);},
	/* Directly load Netstreams from url. Supports flv, f4v, mp4, m4a. */
	loadHTTPMP4M4AStream: function(url) {this.empswf.emp_loadHTTPMP4M4AStream(url);},
	/* Load, parse and play the contents in order from the playlist at the url in 'playlistpath' */
	loadPlaylist : function(playlistpath) {this.empswf.emp_loadPlaylist(playlistpath);},
	/* Passes an HLS stream to the flash player */
	loadHLSStream: function(url) {this.empswf.emp_loadHLSStream(url)},
	/* Resume playback after pause. */
	resume : function() {this.empswf.emp_resume();},
	/* Pause playback whil playing. */
	pause : function() {this.empswf.emp_pause();},
	/* Stop playback while playing. */
	stop : function() {this.empswf.emp_stop();},
	/* Resets the EMP. Should be called before reconfiguring via calls to loadRTMPStream, loadHTTPStream, loadHTTPMP4M4AStream or loadPlaylist. */
	cleanup : function() {this.empswf.emp_cleanup();},
	/* Returns the current position of the playhead for the current audio item. */
	getPosition : function() {return this.empswf.emp_getPosition();},
	/* Returns the duration of the current audio item. */
	getDuration : function() {return this.empswf.emp_getDuration();},
	/* Sends the playhead of the current audio item. to 'position' in seconds */
	seek : function(position) {this.empswf.emp_seek(position);},
	/* Set the volume (for the current, and all subsequent audio items). volume can be between 0 and 100 */
	setVolume : function(volume) {this.empswf.emp_setVolume(volume);},
	/* Set the amount of time in seconds that the streams should load into buffer before playing. */
	setBufferTime : function(time) {this.empswf.emp_setBufferTime(time);},
	/* 	Specify the playback mode. Can be 'od' for on demand or 'live' for live streams. 
		If a playlist contains both live and on demand streams: 
			When playbackmode is 'live' all streams will appear live in the controls, even on demand ones
			When playbackmode is 'od' only live streams will appear live in the controls.*/
	setPlaybackMode : function(mode) {this.audioLive = (mode=='live');this.empswf.emp_setPlaybackMode(mode);},
	/* Returns the value of the playback mode.*/
	getPlaybackMode : function() {return (this.audioLive)?"live":"od";},
	/* For Debugging - returns the emp and flash player versions with some basic debugging info. */
	getVersion : function() {return this.empswf.emp_getVersion();},
	/* 	HTTP streams exhibit a flash player bug where the stream data is never freed. 
		Calling memoryreset will swap the stream over to a fresh Sound object, freeing up the memory used. 
		This automatically happens when the emp uses over about 200 Mb of memory, but can by manually called if required. */
	memoryreset : function() {return this.empswf.emp_memoryreset();},
	/*  Set high memory usage limit (bytes, default is 204857600) If the emp uses more than this amount then it'll restart the stream
		Primarily this feature is due to a bug with http streams where memory is never freed.*/
	setMemoryLimit : function(limit) {this.empswf.emp_setMemoryLimit(limit);},
	/*	Set the time taken before a timeout if the stream gets stuck buffering.*/
	setStallTimeout : function(time) {this.empswf.emp_setStallTimeout(time);},

	// cleanedup : 0,

	// mode: 0,
	
	/**
	 * EMP Callbacks.
     *
     * @method reportEMPOutput
     * @param event_as_json
     * @private
	 */
	reportEMPOutput : function(event_as_json) {
		var event = $.parseJSON(event_as_json);
		this.$api.trigger(event.type, event);
	},
	/**
	 * EMP Error Reporting.
     *
     * @method reportEMPError
     * @param errorEvent_as_json
     * @private
	 */
	reportEMPError : function(errorEvent_as_json) {
		var event = $.parseJSON(errorEvent_as_json);
		/*
			EMP ERROR CODES:
			
			NETCONNECTION_ASYNC_ERROR:int = 100;
			NETCONNECTION_IO_ERROR:int = 101;
			NETCONNECTION_SECURITY_ERROR:int = 102;
			NETCONNECTION_CONNECT_FAILED:int = 103;
			NETCONNECTION_CONNECT_REJECTED:int = 104;
		*/
		if(event.code === 102) {
			this.$api.trigger(this.api.event.securityError, event);
		} else {
			this.$api.trigger(this.api.event.error, event);
		}
	},

    /**
     * Just used to mirror the HTML EMP. Not used.
     *
     * @method resetAttemptCount
     */
    resetAttemptCount: function() {
        
    },

	/**
	 * Get the event object for JavaScript properties.
	 * NB: The Flash generates its own events, and the event object is not generic.
	 * ie., It only contains what is needed for that event, rather than containing all the info regardless of type.
     *
     * @method getEventObject
     * @private
	 */
	getEventObject: function() {
		return {
			mode: this.audioLive ? "live" : "od"
		};
	}
};/**
 * All intellectual property rights in this Software throughout the world belong to UK Radioplayer, 
 * rights in the Software are licensed (not sold) to subscriber stations, and subscriber stations 
 * have no rights in, or to, the Software other than the right to use it in accordance with the 
 * Terms and Conditions at www.radioplayer.co.uk/terms. You shall not produce any derivate works 
 * based on whole or part of the Software, including the source code, for any other purpose other 
 * than for usage associated with connecting to the UK Radioplayer Service in accordance with these 
 * Terms and Conditions, and you shall not convey nor sublicense the Software, including the source 
 * code, for any other purpose or to any third party, without the prior written consent of UK Radioplayer.
 *
 * @name emp.player.html
 * @description HTML5 Media Player
 *
 * The HTML player is a fallback for the flash player,
 * hence all the function naming, events and operation revolves around the flash player.
 *
 * @authors Mark Panaghiston <markp@happyworm.com>
 *
 * This file calls:
 * None
 *
 * This file is called by:
 * @ emp
 * @ controls
 *
 * @class emp.player.html
 * @module emp
 *
 */

radioplayer.emp.player.html = {
	
	version: "1.0 of the HTML5 Audio player for EMP V3",

	ready : false, // Flag for when ready to receive commands
	available: false, // Flag for this solution being viable
	used: false, // Flag for this solution being used

	supported : false, // Flag for browser supporting the format being played
	monitoring: false, // Flag for monitoring live stream connections.
	disconnected: true, // Flag for live streams while paused. (Init of true, since nothing connected.)

	firstConnection: true, // Flag for when new audio is connected the first time. Used to generate events.
	ignoringCommands: /(iphone|ipad|ipod|android|blackberry|playbook|windows phone)/i.test(navigator.userAgent), // Flag for init where mobile devices ignore commands until user gives one.
	seekTimeoutId: null, // Stores the seek timeout ID. (Rare case when set OD audio and seek immediately afterwards.)

	stallTime: 5000, // In milliseconds. Error use half this time. Minimum limited to 2000
	stallTimeoutId: null, // Stores the stall timeout ID
	errorTimeoutId: null, // Stores the erro timeout ID
  errorCount: 0,
  waitingCount: 0,

	api: null, // Pointer to the API object
	$api: null, // The api with a jQuery wrapper

	autoplay: true, // Attempt to autoplay when setting audio. More for development and testing.
	aborted: false, // we have reached an error count for a stream and so we abort

	duration: 0, // Fix the durationchange event in iOS. Stores the duration for comparison.

	// Note that the following audio media propeties are not maintained past the initial instancing operation.
	audioType : "http", 
	audioUrl : "", // (Maintained) Holds the audio URL being used.
	audioServer : "", // n/a
	audioEndpoint : "", // n/a
	audioLive : true,
	initialisedOnce: false,

	// Hold the V3 audio definitions - Maintained.
	audioHTML: [],
	// If we have a fallback URL from telemmetry, we can use it here
	audioHTMLFallback: null,
	/**
	 * Object defining the formats to check for support.
	 * Enabling mutiple type checks per format, as it might be useful.
	 * Only using content type since codec info adds nothing to check in iOS 6.
	 * eg., The type dominates the check and when 'maybe', then you could give a codec=banana and get a 'probably'.
	 * ie., The canPlayType() codec check on iOS (iOS 6) is broken.
	 */
	formats: {
		mp3: [
			// 'audio/mpeg; codecs="mp4a.40.34"',
			// 'audio/mpeg; codecs="mp3"',
			'audio/mpeg'
		],
		mp4: [ // AAC / MP4
			// 'audio/mp4; codecs="mp4a.40.2"', // AAC
			// 'audio/mp4; codecs="mp4a.40.5"', // AAC+
			'audio/mp4',
			'audio/x-m4a'
		],
		aac: [
			'audio/aac',
			'audio/x-aac',
		],
		hls: [ // m3u8 - Apple - HTTP Live Streaming
			// http://css.javascriptag.com/6142_12427020/
			'application/vnd.apple.mpegurl',
			'application/x-mpegURL',
			'application/vnd.apple.mpegURL',
			'audio/mpegurl'
		],
		m3u: [
			'audio/mpegurl',
			'audio/x-mpegurl'
		],
		pls: [ // These work on iOS 6, when they contain MP3 or MP4.
			'audio/x-scpls'
		]
	},
	canPlay: {}, // Holds the canPlayType result of the format.
	audioElem: null, // The DOM audio element
	$audio: null, // The jQuery selector of the audio element

	init: function(api) {
		var self = this;
		this.api = api;
		this.$api = $(api);
		this.audioElem = document.createElement('audio');
		this.$audio = $(this.audioElem);
		this.available = !!this.audioElem.canPlayType;
		this.initialisedOnce = true; // prevent us initialising the player multiple times

		if(this.available) {
			//
			// Check and set which audio formats are supported
			// 
			var canPlayResult = false;
			$.each(this.formats, function(format, types) {
				// Go through the various MIME types for the format.
				$.each(types, function(i, type) {
					self.canPlay[format] = self.available && self.audioElem.canPlayType(type);
					//if(self.api.DEBUG) radioplayer.utils.output('html: audio.canPlayType(' + type + ') = ' + self.canPlay[format]);
					if(self.canPlay[format]) {
						canPlayResult = format;
						return false; // Found solution for the format - exit the loop
					}
				});
			});

			// So that all browsers behave like iOS
			this.audioElem.preload = 'none';
			// Attach the audio event handlers
			this.attachEvents();
			// Set firstConnection as true
			radioplayer.emp.player.html.firstConnection = true;
			// Put the audio element on the page.
			$("#"+this.api.id).append(this.audioElem);
			this.ready = true;
			this.api.ready = true;

			/**
			 * If AUTOPLAY IS DISABLED, show the the 'press play' message
			 */
			Modernizr.on('videoautoplay', function(result){
				if (!result) { // && (radioplayer.consts.is_iOS || radioplayer.consts.is_Android)
			  //if(!result && (radioplayer.consts.is_iOS || radioplayer.consts.is_Android)) {
			    // Autoplay not supported
			    radioplayer.controls.showPressPlayPrompt();
			    radioplayer.controls.userPaused = true;
			  }
			});
		}
	},

	/**
	 * Set parameters for EMP to use when it is ready
     *
     * @since V3
     *
     * @method setAudioParams
     *
     * @param audioHTML
     * @param audioLive
     * @param bufferTime
     * @private
     */
	setAudioParams : function(audioHTML, audioLive, bufferTime) {
		this.audioHTML = (audioHTML && audioHTML.length) ? $.extend(true,[],audioHTML) : [];
		// If the stream url has an flv wrapper, we should try the url without it for the htm player
		if(this.audioHTML.length && this.audioHTML[0].audioType && this.audioHTML[0].audioType === 'httpmp4m4a') {
			var indexTest = this.audioHTML[0].audioUrl.indexOf('?type=.flv');
			if (indexTest > -1) {
        this.audioHTML[0].audioUrl = this.audioHTML[0].audioUrl.replace(/\?type=\.flv$|type=\.flv&/,"")
			}
		}
		this.aborted = false;
		this.audioLive = audioLive;
		this.bufferTime = bufferTime;
	},

	/**
	 * Called either when we receive cookie settings, 
	 * or if that request fails and we proceed anyway with volume set to 100
     *
     * @method dataReady
     * @private
	 */
	dataReady : function() {
		if(this.api.DEBUG) radioplayer.utils.output("html: dataReady()");
		this.passParamsToHTML();
	},

	/**
	 * Pass parameters to HTML now that cookie read
     *
     * @method passParamsToHTML
     * @private
	 */
	passParamsToHTML : function() {
		if(this.api.DEBUG) radioplayer.utils.output("Passing parameters to HTML audio");
		if(this.audioHTML.length) {
			this.setAudio(this.audioHTML);
		} else if (this.audioType === "rtmp") {
			this.loadRTMPStream(this.audioServer, this.audioEndpoint);
		} else if (this.audioType === "http") {
			this.loadHTTPStream(this.audioUrl);
		} else if (this.audioType === "aac") {
			this.loadAACStream(this.audioUrl);
		} else if (this.audioType === "httpmp4m4a") {
			this.loadHTTPMP4M4AStream(this.audioUrl);
		} else if (this.audioType === "hls") {
			this.loadHLSStream(this.audioUrl);
		} else if (this.audioType === "playlist") {
			this.loadPlaylist(this.audioUrl);
		} else {
			this.noSupport();
		}
		var mode = (this.audioLive ? "live" : "od");
		this.setPlaybackMode(mode);
		this.setVolume(radioplayer.controls.currentVolume);

		// Generate a volume event, since it does not always change. ie., defaults to 1, which new audio uses.
		this.$api.trigger(this.api.event.volumeSet, this.getEventObject());
	},

	/**
	 * Set the Audio to play
     *
     * @since V3
     *
     * @method setAudio
     * @param audioHTML
     * @private
	 */
	setAudio: function(audioHTML) {
		var self = this,
		audioPicked, 
		audioHigh;

		this.reset();

		this.audioHTML = (audioHTML && audioHTML.length) ? audioHTML : [];

		// Can we play any of the High BW audio?
		$.each(this.audioHTML, function(i, audio) {
			if(self.canPlayAudio(audio)) {
				audioHigh = audio;
				return false; // exit loop
			}
		});

    audioPicked = audioHigh;

		if(audioPicked) {
			this.passSetAudio(audioPicked);
		} else {
			this.noSupport();
		}
	},

	/**
	 * Check we can play the audio defined in the audio object.
     *
     * @method canPlayAudio
     * @param audio
     * @private
	 */
	canPlayAudio: function(audio) {

		if (audio.audioType === "rtmp") {
			return false;
		} else if (audio.audioType === "http") {
			return this.canPlay.mp3;
		} else if (audio.audioType === "aac") {
			return this.canPlay.aac;
		} else if (audio.audioType === "httpmp4m4a") {
			return this.canPlay.mp4;
		} else if (audio.audioType === "hls") {
			return this.canPlay.hls;
		} else if (audio.audioType === "playlist") {
			var type = this.detectPlaylistType(audio.audioUrl);
			return type && this.canPlay[type];
		}
	},

	/**
	 * Pass the audio object from the new V3 API to the V2 API commands..
     *
     * @method passSetAudio
     * @param audio
     * @private
	 */
	passSetAudio: function(audio) {
		if (audio.audioType === "rtmp") {
			this.loadRTMPStream(audio.audioServer, audio.audioEndpoint);
		} else if (audio.audioType === "http") {
			this.loadHTTPStream(audio.audioUrl);
		} else if (audio.audioType === "aac") {
			this.loadAACStream(audio.audioUrl);
		} else if (audio.audioType === "httpmp4m4a") {
			this.loadHTTPMP4M4AStream(audio.audioUrl);
		} else if (audio.audioType === "hls") {
			this.loadHLSStream(audio.audioUrl);
		} else if (audio.audioType === "playlist") {
			this.loadPlaylist(audio.audioUrl);
		}
	},

	/**
	 * Sets the Audio Element SRC
     *
     * @method setAudioUrl
     * @param url
     * @private
	 */
	setAudioUrl: function(url) {
		this.reset();

		this.supported = true; // Only called if we support the format.
		this.firstConnection = true;
		this.audioUrl = url;

		if(this.autoplay) {
			this.resume();
		}
	},

    /**
     * @method reset
     * @private
     */
	reset: function() {
		clearTimeout(this.stallTimeoutId); // Cancel any stall timeouts.
		clearTimeout(this.errorTimeoutId); // Cancel any error timeouts.
		if(!this.disconnected) {
			this.disconnectStream();
		}
		this.monitoring = false;
		this.supported = false;
		this.duration = 0;
	},

    /**
     * @method connectStream
     * @private
     */
	connectStream: function() {
		if(this.supported) {
			// So we match the events generated by the flash.
			if(this.firstConnection) {
				this.firstConnection = false;
				//console.log('^^^^^^^^^^^^^^^^ 1')
				this.$api.trigger(this.api.event.stopped, {});
				this.$api.trigger(this.api.event.cleanedup, {});
			}
			this.disconnected = false;
			this.audioElem.src = this.audioUrl;
			this.audioElem.load();
		}
	},

    /**
     * @method disconnectStream
     * @private
     */
	disconnectStream: function() {
		this.disconnected = true;
		this.audioElem.src = "about:blank";
		this.audioElem.load();
	},

    /**
     * @method refreshConnection
     * @private
     */
	refreshConnection: function() {
		if(this.api.DEBUG) radioplayer.utils.output("html: refreshConnection()");

		clearTimeout(this.stallTimeoutId); // Cancel any stall timeouts.
		clearTimeout(this.errorTimeoutId); // Cancel any error timeouts.
		if(this.supported && !this.disconnected) {
			this.disconnectStream();
			this.connectStream();
			this.resume();
		}
	},

    /**
     * @method noSupport
     * @private
     */
	noSupport: function() {
		this.supported = false;
		this.$api.trigger(this.api.event.noSupport, this.getEventObject());
	},

    /**
     * Attempt to detect the playlist type, which is not easy.
     *
     * *The only thing we can use is the URL string, since CORS is not available.
     * ie., If CORS, we could look at the contents and make a better detector.*
     *
     * @method detectPlaylistType
     * @param url
     * @returns {string} Playlist type. One of 'hls', 'm3u' or 'pls'
     *
     * @private
     */
	detectPlaylistType: function(url) {

		var urlPeriods = url && url.split && url.split("."),
			suffix = urlPeriods.length > 1 ? urlPeriods[urlPeriods.length - 1] : "";

		if (suffix) {
			if(suffix === "m3u8") return "hls";
			if(suffix === "hls") return "hls";
			if(suffix === "m3u") return "m3u";
			if(suffix === "pls") return "pls";
		} else {
			return false;
		}
	},

	/* 
	 * Control API methods
	 */
	
	/* Directly load an RTMP stream with 'server' and 'endpoint' urls */
	loadRTMPStream: function(server, endpoint) {
		this.noSupport();
	},
	/* Directly load an HTTP stream from url */
	loadHTTPStream: function(url) {
		if(this.canPlay.mp3) {
			this.setAudioUrl(url);
		} else {
			this.noSupport();
		}
	},
	/* Directly load an HTTP stream from url */
	loadAACStream: function(url) {
		//if(this.canPlay.aac) {
		if(this.canPlay.aac) {
			this.setAudioUrl(url);
		} else {
			this.noSupport();
		}
	},
	/* Directly load Netstreams from url. Supports mp4, m4a. */
	loadHTTPMP4M4AStream: function(url) {
		if(this.canPlay.mp4) {
			this.setAudioUrl(url);
		} else {
			this.noSupport();
		}
	},
	/* Directly load Netstreams from url. Supports hls. */
	loadHLSStream: function(url) {
		if(this.canPlay.hls) {
			this.setAudioUrl(url);
		} else {
			this.noSupport();
		}
	},
	/* Load, parse and play the contents in order from the playlist at the url in 'playlistpath' */
	loadPlaylist : function(playlistpath) {
		var type = this.detectPlaylistType(playlistpath);
		if(type && this.canPlay[type]) {
			this.setAudioUrl(playlistpath);
		} else {
			this.noSupport();
		}
	},

//
//
//	GENERIC EVENTS
//
//
	/* Pause playback while playing. */
	pause : function() {
		clearTimeout(this.stallTimeoutId); // Cancel any stall timeouts.
		clearTimeout(this.errorTimeoutId); // Cancel any error timeouts.
		this.audioElem.pause();
	},
	/* Stop playback while playing. */
	stop : function() {
		
		clearTimeout(this.stallTimeoutId); // Cancel any stall timeouts.
		clearTimeout(this.errorTimeoutId); // Cancel any error timeouts.
		this.audioElem.pause();
	},

	/* Resume playback after pause. */
	resume : function() {
		clearTimeout(this.stallTimeoutId); // Cancel any stall timeouts.
		clearTimeout(this.errorTimeoutId); // Cancel any error timeouts.
		if(this.disconnected) {
			this.connectStream();
		}
		if(this.supported) {
			this.audioElem.play();
		} else {
			this.noSupport();
		}
	},


	/* Cancels the stream download. */
	cleanup : function() {
		this.reset();
		this.$api.trigger(this.api.event.cleanedup, this.getEventObject());
	},

//
//
//	ARE THESE JUST OD FUNCTIONS?
//
//
	/* Returns the current position of the playhead for the current audio item. */
	getPosition : function() {
		return this.audioElem.currentTime * 1000; // Milliseconds
	},

	/* Returns the duration of the current audio item. */
	getDuration : function() {
		var audio = this.audioElem,
			duration = isFinite(audio.duration) ? audio.duration : 0; // Otherwise it is a NaN until known
			// console.log(audio.duration)
			// console.log(duration)
		return duration * 1000; // Milliseconds
	},

	/* Sends the playhead of the current audio item. to 'position' in seconds */
	seek : function(position) {
		var self = this,
			audio = this.audioElem;
		clearTimeout(this.stallTimeoutId); // Cancel any stall timeouts.
		clearTimeout(this.errorTimeoutId); // Cancel any error timeouts.

		// Only for OD content
		if(!this.audioLive && !this.disconnected) {
			if(this.supported) {
				// Attempt to play it, since iOS/Android might be ignoring commands.
				// If browser is still ignoring commands, then the seek() must have been issued by the user.
				if(this.ignoringCommands) {
					audio.play();
				}

				try {
					// !audio.seekable is for old HTML5 browsers, like Firefox 3.6.
					// Checking seekable.length is important for iOS6 to work with OD setAudioUrl() followed by seek(time)
					if(!audio.seekable || typeof audio.seekable === "object" && audio.seekable.length > 0) {
						audio.currentTime = position;
						audio.play();
					} else {
						throw 1;
					}
				} catch(err) {
					// Attempt to seek again in 250ms.
					this.seekTimeoutId = setTimeout(function() {
						self.seek(position);
					}, 250);
				}
			} else {
				this.noSupport();
			}
		}
	},

//
//	SET VOLUME
//
	setVolume : function(volume) {
		this.audioElem.volume = volume / 100; // Ratio 0 to 1
		this.$api.trigger(this.api.event.volumeSet, this.getEventObject());
	},
	/* Set the amount of time in seconds that the streams should load into buffer before playing. */
	setBufferTime : function(time) {
		// No equivilent
		return false;
	},
	/* Specify the playback mode. Can be 'od' for on demand or 'live' for live streams. 
	 * No meaning in the HTML player. Just generate the event so the display can react.
	 */
	setPlaybackMode : function(mode) {
		this.audioLive = (mode=='live');
		this.$api.trigger(this.api.event.mode, this.getEventObject());
	},
	/* Returns the value of the playback mode.*/
	getPlaybackMode : function() {
		return (this.audioLive)?"live":"od";
	},
	/* For Debugging - returns the emp and flash player versions with some basic debugging info. */
	getVersion : function() {
		return this.version;
	},
	/* Required for the Flash. No HTML equiv */
	memoryreset : function() {
		return false;
	},
	/* Required for the Flash. No HTML equiv */
	setMemoryLimit : function(limit) {
		return false;
	},

	setStallTimeout : function(time) {
		if(typeof time === 'number') {
			if(time < 2000) {
				this.stallTime = 2000; // Limit the minimum to a sensible value.
			} else {
				this.stallTime = time;
			}
		}
	},
	
	/* 
	 * HTML5 Audio Events
	 */
	
	attachEvents: function() {
		var self = this;

		//
		// ON DEMAND ONLY
		//
		this.audioElem.addEventListener("progress", function() {
			// Live content suppresses these events.
			if(!self.audioLive) {
				self.$api.trigger(self.api.event.loadProgress, self.getEventObject());
			}
		}, false);

		//
		//	Time Update
		//
		this.audioElem.addEventListener("timeupdate", function() {
			// Fix durationchange bug for iOS. See also durationchange event handler.
			var duration = self.getDuration();
			//console.log('timeupdate ', duration, self.duration)
			if(self.duration !== duration) {
				//console.log('NOT')
				self.duration = duration;
				self.$api.trigger(self.api.event.durationSet, self.getEventObject());
			}
			// Only generate update events for OD content
			if(!self.audioLive) {
				//console.log('NOT LIVE')
				self.$api.trigger(self.api.event.update, self.getEventObject());
			}
		}, false);

		//
		//	PLAY
		//
		this.audioElem.addEventListener("play", function() {
			clearTimeout(self.stallTimeoutId); // Cancel any stall timeouts.
			clearTimeout(self.errorTimeoutId); // Cancel any error timeouts.
			self.ignoringCommands = false; // The play command must have worked.
			if(self.audioLive) {
				self.monitoring = true;
			}
			self.$api.trigger(self.api.event.resumed, self.getEventObject());
		}, false);

		//
		//	PLAYING
		//
		this.audioElem.addEventListener("playing", function() {
			radioplayer.controls.noSupportShowing = false;
			radioplayer.controls.hideErrorMsg();
			if (!radioplayer.objs.body.hasClass('showing-overlay') && audioLive) {
				// Only resume polling when focussing, if overlay isn't showing. Polling will auto resume when overlay hides anyway.
				radioplayer.playing.startUpdating();
			}


			clearTimeout(self.stallTimeoutId); // Cancel any stall timeouts.
			self.$api.trigger(self.api.event.startPlaying, self.getEventObject());
      radioplayer.emp.player.html.errorCount = 0; // Reset error count back to 0.
      radioplayer.emp.player.html.waitingCount = 0; // Reset error count back to 0.
		}, false);

		this.audioElem.addEventListener("waiting", function() {
			radioplayer.emp.player.html.waitingCount++;
			// If we are live, and in a playing state
      if(self.audioLive && self.monitoring) {
          clearTimeout(self.stallTimeoutId); // Avoids multiple timeout generation.
          if(radioplayer.emp.player.html.waitingCount < radioplayer.emp.retryCount) {
              self.stallTimeoutId = setTimeout(function() {
                  self.refreshConnection();
              }, self.stallTime);
          }
          else {
          	clearTimeout(self.stallTimeoutId);
          	radioplayer.emp.player.html.errorCount = 0;
          	radioplayer.emp.player.html.waitingCount = 0;
        		radioplayer.emp.player.html.cleanup();
	        	self.aborted = true;
	        	radioplayer.emp.player.html.noSupport();
	        }
			}
		}, false);

		//
		//	STOP / PAUSE
		//	This applies to OD and live content
		//
		this.audioElem.addEventListener("pause", function() {
			clearTimeout(self.stallTimeoutId); // Cancel any stall timeouts.
			clearTimeout(self.errorTimeoutId); // Cancel any error timeouts.
			if(self.audioLive) {
				self.monitoring = false;
				if(!this.disconnected) {
					//console.log('^^^ is disconnected')
					self.disconnectStream();
				}
				//console.log('^^^^^^^^^^^^^^^^ 2')
				self.$api.trigger(self.api.event.stopped, self.getEventObject());
			} 
			else {
				self.$api.trigger(self.api.event.pausePlaying, self.getEventObject());
			}
		}, false);

		//	ENDED
		this.audioElem.addEventListener("ended", function() {
			//console.log('endeddddddddd')
			self.$api.trigger(self.api.event.ended, self.getEventObject());
		}, false);

		//
		//	VOLUME
		//
		this.audioElem.addEventListener("volumechange", function() {
			self.$api.trigger(self.api.event.volumeSet, self.getEventObject());
		}, false);

		//
		//	Duration change
		//
		this.audioElem.addEventListener("durationchange", function() {
			// Fix durationchange bug for iOS. See also timeupdate event handler.
			//console.log('@@ durationchange')
			self.duration = self.getDuration();
			self.$api.trigger(self.api.event.durationSet, self.getEventObject());
		}, false);

		//
		//	ERRORS REPORTED BY THE PLAYER
		//
		this.audioElem.addEventListener("error", function() {
      radioplayer.emp.player.html.errorCount++;
			var code = self.audioElem.error.code;
			/*
			 * Error codes:
			 * 1: MEDIA_ERR_ABORTED - The user agent aborted at the user request.
			 * 2: MEDIA_ERR_NETWORK - A network problem occurred after the media deemed usable.
			 * 3: MEDIA_ERR_DECODE - A decoder error occurred.
			 * 4: MEDIA_ERR_SRC_NOT_SUPPORTED - Usually a 404 error or a MIME type (Content-Type) issue with the request.
			 */
			if (self.audioElem.error.message && self.audioElem.error.message.indexOf('DEMUXER_ERROR_COULD_NOT_OPEN') > -1) {
				return false;
			}

			if(!self.aborted) {
        clearTimeout(self.stallTimeoutId);
        clearTimeout(self.errorTimeoutId); // Avoids multiple timeout generation.
				if(radioplayer.emp.player.html.errorCount < radioplayer.emp.retryCount) { // Limit number of retries
          self.errorTimeoutId = setTimeout(function() {
            self.refreshConnection();
          }, self.stallTime / 2);
        } 
        else {
          radioplayer.emp.player.html.errorCount = 0;
          radioplayer.emp.player.html.waitingCount = 0;
        	radioplayer.emp.player.html.cleanup();
        	self.aborted = true;
        	radioplayer.emp.player.html.noSupport();
        }
			}
		}, false);
	},

  resetAttemptCount: function() {
  	return false;
  },

	getEventObject: function() {
		var audio = this.audioElem,
			loadProgress = (audio.seekable && audio.seekable.length) ? 1 : 0;
		return {
			position: this.getPosition(),
			duration: this.getDuration(),
			volume: Math.round(audio.volume * 100),
			mode: this.audioLive ? "live" : "od",
			loadProgress: loadProgress,
			bytesLoaded: 100 * loadProgress, // Pseudo value used. NB: Flash always gives a null.
			bytesTotal: 100 // Pseudo value used. NB: Flash always gives a null.
		};
	}
};/**
 * @name overlay
 * @description Handling of the opening and closing of overlays
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
 *
 * This file calls:
 * @ mystations
 * @ search
 * @ playing
 *
 * This file is called by:
 *
 * @extends init
 * @extends mystations
 * @extends search
 * @extends playing
 *
 * @class overlay
 * @module overlay
 */

radioplayer.overlay = {

	inactivityTimer : null,
	inactivityCount : 45*1000,

	scrollSettleTimer : null,

	openedOnce : false,

	inViewThreshold : 100,

	detectScrolling : true,

	tabShowingName : '',

	azDivideHeight : 0,

    /**
     * @requestFailTimer
     */
	requestFailTimer : null,

    /**
     * @property requestFailed
     * @type Boolean
     * @default false
     */
	requestFailed : false,

	currentDivideLetter: null,


	/**
	 * Initialize
     *
     * @method init
	 */
	init : function() {

		radioplayer.objs.overlayContainer = $('.overlay-container');

		$('.radioplayer').on('click', '.menu-btn', function(e){
			/**
			 * Click menu button
			 */

			e.preventDefault();
			if(radioplayer.services.alerts.cookies.showing) {
				return false;
			}

			if (radioplayer.objs.overlayContainer.is(':visible')) {
				// Overlay is visible, so hide

				radioplayer.overlay.hide();
        radioplayer.services.analytics.sendEvent('Navigation', 'Main Menu', 'Close Menu Button', null, null);

			} else {
				// Show menu
        radioplayer.services.analytics.sendEvent('Navigation', 'Main Menu', 'Menu button', null, null);

				radioplayer.overlay.show(radioplayer.lang.general.close_menu);
				radioplayer.objs.body.addClass('showing-menu');

				if (!radioplayer.overlay.openedOnce) {
					// Not opened the menu before, so initiate
					radioplayer.overlay.openedOnce = true;

					if (radioplayer.settings.presets.length > 0) {
						// We have My Stations, so open that tab
						radioplayer.overlay.selectTab($('.menu-container .tabs li:eq(0)'));
					} else {
						// Else open the A-Z List tab
						radioplayer.overlay.selectTab($('.menu-container .tabs li:eq(3)'));
					}
				} else {
					// We're opening menu again - re-select previous tab
					// For older browsers, this will restore scroll position in A-Z list
					// It will also refresh Recommendations
					$prevSelTab = $('.menu-container .tabs li.on');
					$prevSelTab.removeClass('on');
					radioplayer.overlay.selectTab($prevSelTab);
				}

			}

		}).on('click', '.tabs li a', function(e){
			/**
			 * Click menu or search tab
			 */

			e.preventDefault();

			radioplayer.overlay.selectTab($(this).parent());

		}).on('click', '#station-logo-link', function(e){
			/**
			 * Click station logo while overlay is showing hides overlay
			 */

			if (radioplayer.objs.body.hasClass('showing-overlay')) {

				e.preventDefault();

				radioplayer.overlay.hide();

				return false;

			}

		});

		radioplayer.objs.body.on('keyup', function(event){
			/**
			 * Press escape while overlay is visible hides overlay
			 */

			if (event.which == 27 && radioplayer.objs.body.hasClass('showing-overlay')) {
				radioplayer.overlay.hide();
			}

		});


		radioplayer.objs.overlayContainer.on('click', '.menu-container .alphabet li a', function(e){
			/**
			 * Click letter on a-z list
			 */

			e.preventDefault();

			var $a = $(this),
				$tabLI = $a.parent(),
        letterId;
				tabIndex = $('.menu-container .alphabet li').index($tabLI),
				letter = $a.html();

			radioplayer.utils.output('clicked letter ' + letter);
            
      if($(this).parent('li').parent('ul').hasClass('alphabet--minimised')) {
          letter = letter[0] === '0' ? '#' : letter[0].toLowerCase();
          letterId = letter === '#' ? 'num' : letter;
      }
      else {
          letter = letter.toLowerCase();
          letterId = letter === '#' ? 'num' : letter;
      }

			// Scroll to the letter
			radioplayer.overlay.detectScrolling = false;

			$("#azlist-container").scrollTo("#letter-divide-" + letterId, {
				axis: "y", duration: 500, onAfter: function(){
					//radioplayer.utils.output('lazyLoad 1');
					radioplayer.overlay.detectScrolling = true;
					radioplayer.overlay.lazyLoad($('#azlist-container'));
					$('#azlist-container').data('scrollpos', $('#azlist-container').scrollTop());
				}
			});

			if (!$tabLI.hasClass('on')) {
				// Not already on

				$('.menu-container .alphabet li').removeClass('on');

				$tabLI.addClass('on');

				// Save to cookie
				radioplayer.services.saveCookie("stationlistprefix/s", "stationlistprefix", letter);
			}


		}).on("click", ".toggle-mystations button:not(.animating)", function(e){
			/**
			 * Bind add/remove from My Stations toggle
			 */

			e.preventDefault();

			var $iconCont = $(this).parent(),
				$overlayItem = $iconCont.parents('.overlay-item'),
				rpId = $overlayItem.data('stationid'),
				containerId = $overlayItem.parent().attr('id');

			if ($overlayItem.hasClass('in-mystations')) {
				// Current in My Stations, so remove
				radioplayer.mystations.remove(rpId, containerId, $iconCont);

			} else {
				// Not in My Stations, so add
				radioplayer.mystations.add(rpId, containerId, $iconCont);
			}


		}).on("click", ".more-toggle", function(e){
			/**
			 * Bind click event to show expanded content
			 * Apply this to any result for this station ID regardless of result type
			 */

			e.preventDefault();

			var $itemObj = $(this).parent().parent();

			// Is this station expanded?
			if ($itemObj.hasClass("expanded")) {
				/**
				 * Collapse Me
				 */

				// Remove classes
				$itemObj.removeClass("expanded").prev().removeClass("prevExpanded");

				// Animate extra content closed
				$itemObj.children(".overlay-item-extra-cont").slideUp(250);

				// Change accessability text
				$(this).attr("title", radioplayer.lang.search.show_information).html('<span>' + radioplayer.lang.search.show_information + '</span>');

				// IE7 bug - the next item doesn't redraw in place, so we force it
				if ($.browser.msie && $.browser.version == 7) {
					$itemObj.next().hide().show();
				}

			} else {
				/**
				 * Expand Me
				 */

				// First, if there is another station already expanded, collapse it and revert accessability text
				radioplayer.overlay.collapseResult();

				// Add classes to this item and the previous one
				$itemObj.addClass("expanded").prev().addClass("prevExpanded");

				// Is this the last item in the list?
				var lastChild = $itemObj.is(':last-child');

				// Animate extra content open
				$itemObj.children(".overlay-item-extra-cont").slideDown(250, function(){
					if (lastChild) {
						// We've expanded the last item in this list, so scroll down so we can see it
						$itemObj.parent().scrollTo("100%", {axis: "y", duration: 200});
					}
				});

				// Change accessability text
				$(this).attr("title", radioplayer.lang.search.hide_information).html('<span>' + radioplayer.lang.search.hide_information + '</span>');

			}

		}).on("click", ".overlay-item-link", function(e) {
            e.preventDefault();

            var section = $(this).parents('.overlay-item').data('section'),
            	sectionName = "",
            	stationId = $(this).parents('.overlay-item').data('stationid'),
            	href = $(this).attr('href');

            if(section == "recommend") {
                sectionName = "Recommended";
            } else if(section == "history") {
                sectionName = "Recent Menu";
            } else if(section == "az") {
                sectionName = "A-Z Menu";

				// For A-Z list, append the letter to query string
				href += (href.indexOf("?") > 0 ? "&" : "?") + "stationletterprefix=" + $(this).data('letter');

            } else if(section == "search") {
                sectionName = "search";
            } else if(section == "mystations") {
                sectionName = "Favourites";
            }

			radioplayer.overlay.sidewaysNavigate(sectionName, stationId, href);

        });

		/**
		 * Localisation
		 */

		$('.menu-container .tabs ul li').eq(0).find('a span').html(radioplayer.lang.menu_tabs.tab_1_text);

		$('.menu-container .tabs ul li').eq(1).find('a span').html(radioplayer.lang.menu_tabs.tab_2_text);

		$('.menu-container .tabs ul li').eq(2).find('a span').html(radioplayer.lang.menu_tabs.tab_3_text);

		$('.menu-container .tabs ul li').eq(3).find('a span').html(radioplayer.lang.menu_tabs.tab_4_text);

        radioplayer.overlay.resizeMenuTabs();

	},

    resizeMenuTabs : function () {
    	if (!radioplayer.consts.reduced_func) {
        var listLength = $('.menu-container .tabs ul li').length;
        if (listLength) {
            var viewportWidth = radioplayer.utils.getViewportWidth();
            var length = radioplayer.lang.menu_tabs.sizing.length;
            var foundInfo = false;
            for (var i = 0; i < length; i++) {
                if (viewportWidth <= radioplayer.lang.menu_tabs.sizing[i].maxViewport) {
                    // We use the sizing info from this iteration
                    foundInfo = true;
                    var cumulativePercentage = 0;
                    for (var j = 0; j < listLength; j++) {
                        var width;
                        if (radioplayer.lang.menu_tabs.sizing[i].mode === "manual") {
                            if (j === (listLength - 1)) {
                                var widthPercentage = 100 - cumulativePercentage;
                                var width = widthPercentage + '%';
                            }
                            else {
                                var widthPercentage = Math.floor((radioplayer.lang.menu_tabs.sizing[i].tabSizes[j] / radioplayer.lang.menu_tabs.sizing[i].maxViewport) * 100);
                                cumulativePercentage = Math.floor(cumulativePercentage + widthPercentage);
                                var width = widthPercentage + '%';
                            }
                        }
                        else {
                            width = "25%";
                        }

                        $('.menu-container .tabs ul li').eq(j).css('width', width);
                    }

                    break;
                }
            }

            if (foundInfo) {
                return false;
            }
            else {
                for (var j=0; j < listLength; j++) {
                    $('.menu-container .tabs ul li').eq(j).css('width', "25%");
                }
            }
        }
      }
    },


	/**
	 * Sideways navigation to another console
	 *
	 * @method sidewaysNavigate
	 *
	 * @param {String} sectionName
	 * @param {String} stationId
	 * @param {String} href
	 */
	sidewaysNavigate : function(sectionName, stationId, href) {

		if (sectionName == "search") { // Search has a separate event
			radioplayer.services.analytics.sendEvent('Search', 'Full Search', stationId.toString(), null, null);
		} else {
			radioplayer.services.analytics.sendEvent('Navigation', sectionName, stationId.toString(), null, null);
		}

		setTimeout(function() {
			window.location.href = href;
		}, 100);

	},


	/**
	 * Show the overlay
     *
     * @method show
	 *
	 * @param {String} menu_close_text
     */
	show : function(menu_close_text) {

		// if overlay is already showing, then make sure appropriate events are called
		var overlayAlreadyShowing = false;
        if (radioplayer.mystations.menuBtnNotificationTimeout) {
            clearTimeout(radioplayer.mystations.menuBtnNotificationTimeout);
            $('.menu-btn-notification').removeClass('menu-btn-notification--active');
        }
        if (radioplayer.mystations.menuBtnNotificationTimeoutSub) {
            clearTimeout(radioplayer.mystations.menuBtnNotificationTimeoutSub);
        }

		if (radioplayer.objs.body.hasClass('showing-overlay')) {

			overlayAlreadyShowing = true;

			radioplayer.objs.body.removeClass('showing-menu showing-search showing-suggest');

			radioplayer.overlay.hidingTab();

		}

		radioplayer.objs.body.addClass('showing-overlay');

		// Update menu button title and text
		$('.radioplayer-globalnav .menu-btn').attr('title', menu_close_text).find('.menu-btn-accessible').html(menu_close_text);
        $('.radioplayer-globalnav .menu-btn-icon').addClass('icon-chevron-left');

		// Update station logo title attribute
		$('#station-logo-link').attr('title', menu_close_text);

		clearTimeout(radioplayer.inactivityTimer);
		radioplayer.inactivityTimer = setTimeout(radioplayer.overlay.hide, radioplayer.overlay.inactivityCount);
		radioplayer.playing.stopUpdating();

		if (!overlayAlreadyShowing) {
			// Detect activity
			radioplayer.objs.overlayContainer.on('click.activity', function(){
				radioplayer.overlay.resetInactivity();
			});

			radioplayer.objs.overlayContainer.find('.scrollable-wrapper').on('scroll.scroll-overlays', function(){
				if (radioplayer.overlay.detectScrolling) {

					var $scrollableObj = $(this);

					// Store scroll position, so in certain browsers we can restore this when opening tab
					$scrollableObj.data('scrollpos', $scrollableObj.scrollTop());

					clearTimeout(radioplayer.overlay.scrollSettleTimer);
					radioplayer.overlay.scrollSettleTimer = setTimeout(function(){
						radioplayer.overlay.lazyLoad($scrollableObj);
						radioplayer.overlay.resetInactivity();
						if (radioplayer.overlay.currentDivideLetter) {
							radioplayer.services.saveCookie("stationlistprefix/s", "stationlistprefix", radioplayer.overlay.currentDivideLetter);
						}
					}, 250);

				}

			});

		}

	},


	/**
	 * Hide the overlay
     *
     * @method hide
     */
	hide : function() {
		// This is called from a setTimeout() so for some reason we have to use 'radioplayer.overlay' rather than 'this'

		// Detect activity
		radioplayer.objs.overlayContainer.off('click.activity');

		radioplayer.objs.overlayContainer.find('.scrollable-wrapper').off('scroll.scroll-overlays');

		if ($.browser.msie && $.browser.version == 7 && radioplayer.objs.body.hasClass('showing-search')) {
			// Clear search divs, to avoid redraw issues in IE 7
			radioplayer.objs.searchContainer.find('.tab-container').html('').removeClass('loaded has-error');
		}

		radioplayer.objs.body.removeClass('showing-menu showing-search showing-suggest showing-overlay');

		// Update menu button title and text
		$('.radioplayer-globalnav .menu-btn').attr('title', radioplayer.lang.general.open_menu).find('.menu-btn-accessible').html(radioplayer.lang.general.open_menu);
        $('.radioplayer-globalnav .menu-btn-icon').removeClass('icon-chevron-left');

		// Reset station logo title attribute
		$('#station-logo-link').removeAttr('title');

		clearTimeout(radioplayer.inactivityTimer);
		radioplayer.playing.startUpdating();

		if ($('#search-clear').is(':visible')) {
			$('#search-clear').hide();
			$('#search-button').show();
		}

		//radioplayer.utils.output('hiding overlay');
		radioplayer.overlay.hidingTab();

		// IE7 bug - the radioplayer-body doesn't redraw in place, so we force it
		if ($.browser.msie && $.browser.version == 7) {
			$('.radioplayer-body').hide().show();
		}

	},


	/**
	 * Reset the inactivity timer
     *
     * @method resetInactivity
     */
	resetInactivity : function() {
		//radioplayer.utils.output('reset inactivity timer');
		clearTimeout(radioplayer.inactivityTimer);
		radioplayer.inactivityTimer = setTimeout(radioplayer.overlay.hide, radioplayer.overlay.inactivityCount);
	},


	/**
	 * Lazy load the visible contents of a container
     *
     * @method lazyLoad
     *
	 * @param $cont
     */
	lazyLoad : function($cont) {
		var currentViewTop = $cont.scrollTop(), // - this.inViewThreshold, -- removed threshold from above, so it doesnt load stations above and push down visible stations
			currentHeight = $cont.height(),
			currentViewBottom = $cont.scrollTop() + currentHeight + this.inViewThreshold;

		var loadMetaIds = [];

		$cont.find('.overlay-item.not-loaded-img').each(function(i, element){

            $overlayItem = $(this);

			var eleTopEdge = currentViewTop + $overlayItem.position().top,
				eleBotEdge = currentViewTop + $overlayItem.position().top + $overlayItem.outerHeight();

			if ((eleTopEdge < currentViewBottom && eleTopEdge >= currentViewTop)
			 || (eleBotEdge > currentViewTop && eleBotEdge < currentViewBottom)) {

				// This element is visible
				//radioplayer.utils.output('element, top: ' + eleTopEdge + ', bottom: ' + eleBotEdge + ', stnid ' + $(element).data('stationid'));
                $overlayItem.removeClass('not-loaded-img'); // in-view

                // Load image
                var $img = $overlayItem.find('.overlay-item-img img');
				if ($img.data('src')) {
					$img.attr('src', $img.data('src')).removeAttr('data-src');
				}

				if ($overlayItem.hasClass('not-loaded-meta') && !$overlayItem.hasClass('checking-for-meta')) {

					loadMetaIds.push( $overlayItem.attr('data-stationid') );

					$overlayItem.removeClass('not-loaded-meta').addClass('checking-for-meta');

				}

			}

		});

		if (loadMetaIds.length > 0) {
			// Load multiple stations meta data in one request
			var csvIds = loadMetaIds.join(",");

			radioplayer.services.getAPI(radioplayer.consts.api.onAir +
										"?rpIds=" + csvIds +
										"&descriptionSize=70" +
										"&callback=radioplayer.overlay.receiveStnNowInfo");
		}

	},


	/**
	 * Select a display a tab - both menu and search
     *
     * @method selectTab
     *
	 * @param $tabLI
     */
	selectTab : function($tabLI) {

		var tabContent = $tabLI.data('content'),
			$tabList = $tabLI.parent(),
			tabIndex = $tabList.children().index($tabLI),
			$tabListDiv = $tabList.parent(),
			$tabsWrapper = $tabListDiv.next(),
			$tabsContainers = $tabsWrapper.children('.tab-container');

		if (!$tabLI.hasClass('on')) {
			// Not already on

			$tabList.children('li').removeClass('on no-divide');

			$tabLI.addClass('on').next().addClass('no-divide');

			$tabsContainers.removeClass('showing');

			var $tabCont = $tabsContainers.eq(tabIndex);

			$tabCont.addClass('showing');

			$tabListDiv.css('border-bottom-color', $tabLI.data('color'));

			this.hideMenuSpinner(); // hide, in case it is still showing from clicking another tab that hasn't finished loading

			if (radioplayer.overlay.tabShowingName != '') {
				this.hidingTab();
			}

			this.showingTab(tabContent, $tabCont);

		}

	},


	/**
	 * Called when a tab is being shown
     *
     * @method showingTab
     *
	 * @param id
     * @param $tabCont
     */
	showingTab : function(id, $tabCont) {

		this.tabShowingName = id;

		if (id == 'azlist') {

            radioplayer.services.analytics.sendEvent('Navigation', 'Main Menu', 'A - Z List', null, null);

			if (!$tabCont.hasClass('loaded')) {
				// Initialise A-Z List
				$tabCont.addClass('loaded');
				radioplayer.overlay.requestAZList();

			} else {
				if ($.browser.msie) {
					// IE resets scroll position when hiding div, so we need to restore this
					$('#azlist-container').scrollTop($('#azlist-container').data('scrollpos'));
				}
			}

		} else if (id == 'mystations') {
            radioplayer.services.analytics.sendEvent('Navigation', 'Main Menu', 'My Stations', null, null);
            if(!$tabCont.hasClass('loaded')) {
			    // Initialise My Stations
			    $tabCont.addClass('loaded');
			    radioplayer.mystations.populateList(radioplayer.settings.presets, 'mystations');
            }
		} else if (id == 'history') {
            radioplayer.services.analytics.sendEvent('Navigation', 'Main Menu', 'Recent', null, null);
            if(!$tabCont.hasClass('loaded')) {
                // Initialise History
                $tabCont.addClass('loaded');
                radioplayer.mystations.populateList(radioplayer.settings.history, 'history');
            }
		} else if (id == 'recommended') {
			// Initialise Recommended List
			$tabCont.removeClass('has-error');
			radioplayer.overlay.requestRecommend();
            radioplayer.services.analytics.sendEvent('Navigation', 'Main Menu', 'Recommended', null, null);

		} else if (id == 'searchlive' && !$tabCont.hasClass('loaded')) {
			// Live Search
			$tabCont.addClass('loaded');
			radioplayer.search.tabRequest('live');

		} else if (id == 'searchod' && !$tabCont.hasClass('loaded')) {
			// OD Search
			$tabCont.addClass('loaded');
			radioplayer.search.tabRequest('od');

		}

	},


	/**
	 * Called when a tab is being hidden
     *
     * @method hidingTab
     */
	hidingTab : function() {

		//radioplayer.utils.output('hiding tab ' + radioplayer.overlay.tabShowingName);

		if (radioplayer.overlay.tabShowingName == "mystations") {
			radioplayer.mystations.purgeRemovedMyStations();
		}

		radioplayer.overlay.tabShowingName = '';
	},


	/**
	 * Show the menu spinner (ajax loading indicator)
     *
     * @method showMenuSpinner
     */
	showMenuSpinner : function() {
		$('.menu-container .tabs-wrapper .spinner').show();
	},


	/**
	 * Hide the menu spinner (ajax loading indicator)
     *
     * @method hideMenuSpinner
     */
	hideMenuSpinner : function() {
		$('.menu-container .tabs-wrapper .spinner').hide();
	},


	/**
	 * Request data from the A-Z List API
     *
     * @method requestAZList
     */
	requestAZList : function() {
		this.showMenuSpinner();

		// Set up fail safe
		this.requestFailed = false;
		this.requestFailTimer = setTimeout(function() { radioplayer.overlay.showFailMsg('azlist'); }, 15000);

		radioplayer.services.getAPI(radioplayer.consts.api.az + "/?callback=radioplayer.overlay.receiveAZList");
	},

    /**
     * Highlights the truncated A-Z tab based on where we scroll to in the list
     *
     * @method highlightMinimisedAlphabetTab
     *
     * @param letter
     */
    highlightMinimisedAlphabetTab : function(letter) {
        if (letter === 'num') {
            $('#letter-min-' + letter).addClass('on');
        }
        else { 
            var array = radioplayer.lang.azlist.alphabet_minimised_array;
            var length = array.length;
            for (var i=0; i < length; i++) {
                if ($.inArray(letter, array[i].letters) > -1) {
                    $('#letter-min-' + array[i].displayText[0]).addClass('on');
                    break;
                }
            }
        }
    },


	/**
	 * Receive data from the A-Z List API
     *
     * @method receiveAZList
     *
	 * @param data
     */
	receiveAZList : function(data) {

		clearTimeout(this.requestFailTimer);

		if (!this.requestFailed) {

			var arrAllLetters = radioplayer.lang.azlist.alphabet_array,
                arrMinimisedLetters = radioplayer.lang.azlist.alphabet_minimised_array,
				AZListHtml = '<h2 class="access">' + radioplayer.lang.menu_tabs.tab_4_text + '</h2>',
				arrGotLetters = [];

			$.each(arrAllLetters, function(i, letter){

				var upperLetter = letter.toUpperCase();

				if (data.stations[letter]) {

					AZListHtml += '<div class="letter-divide" data-letter="' + upperLetter + '" id="letter-divide-' + (letter == '#' ? 'num' : letter) + '">' + upperLetter + '</div>';

					arrGotLetters.push(letter);

					var stns = data.stations[letter];

					AZListHtml += radioplayer.overlay.iterateResults(stns, 'az', letter);

				} else {
					// No stations for this letter
					AZListHtml += '<div class="letter-divide" data-letter="' + upperLetter + '" id="letter-divide-' + (letter == '#' ? 'num' : letter) + '">' + upperLetter + '</div><div class="no-stations-item">' + radioplayer.lang.azlist.no_stations + '</div>';

				}
			});

			var lettersHtml = '',
                lettersMinimisedHtml = '',
				hasStations = false,
				titleTag = '',
                stnLetterId;

			$.each(arrAllLetters, function(i, letter){
				hasStations = (arrGotLetters.indexOf(letter) > -1);
				titleTag = (hasStations ?
							radioplayer.lang.azlist.view_stations_beginning :
							radioplayer.lang.azlist.no_stations_beginning);

				titleTag = titleTag.replace("{letter}", (letter == '#' ? radioplayer.lang.azlist.a_number : letter.toUpperCase()));

				lettersHtml += '<li id="letter-' + (letter == '#' ? 'num' : letter) + '" class="' + (hasStations ? '' : 'no-stations') + '">' +
								'<a href="#" title="' + titleTag + '">' + letter.toUpperCase() + '</a></li>';
			});

            $.each(arrMinimisedLetters, function(i, obj){
                titleTag = radioplayer.lang.azlist.view_stations_from;
                titleTag += obj.displayText.replace("-", " to ");

                var alphabetId = obj.displayText[0] === "0" ? "num" : obj.displayText[0];

                lettersMinimisedHtml += '<li id="letter-min-' + alphabetId + '">' + 
                                '<a href="#" title="' + titleTag + '">' + obj.displayText.toUpperCase() + '</a></li>';
            });
			
			this.hideMenuSpinner();
			
			$('.alphabet ul.alphabet--regular').html(lettersHtml);
      $('.alphabet ul.alphabet--minimised').html(lettersMinimisedHtml);

			$('#azlist-container').html(AZListHtml);

			if ($.browser.msie && $.browser.version == 7) {
				// Don't use sticky divide on IE 7, it performs poorly
				$('.sticky-divide').remove();

			} 
			else {
				// Set the width of the sticky divide
				radioplayer.objs.stickyLetterDivide = $('.sticky-divide');
				radioplayer.objs.stickyLetterDivide.css({'display': 'block', 'width': $('#letter-divide-num').width() + 'px'});
				$(window).on('resize', function(){
					radioplayer.objs.stickyLetterDivide.css({'width': $('#letter-divide-num').width() + 'px'});
				});

				this.azDivideHeight = radioplayer.objs.stickyLetterDivide.outerHeight();

				$("#azlist-container").on('scroll.update-sticky-divide', function() {
					radioplayer.overlay.updateStickyDivide($(this));
				});
			}

			// Detect what letter to scroll to
			var saveCookieFlag = false;
			if (radioplayer.settings.stationlistprefix != '') {
				var initialId = radioplayer.settings.stationlistprefix === '#' ? 'num' : radioplayer.settings.stationlistprefix;
			}
			else {
				saveCookieFlag = true;
				var stnLetter = currentStationName.substr(0, 1).toLowerCase();
				var initialId = stnLetter === '#' ? 'num' : stnLetter;
			}
			radioplayer.utils.output('we have the letter ' + initialId);
			radioplayer.overlay.currentDivideLetter = initialId;

			// Jump to our initial letter
			this.detectScrolling = false;

			setTimeout(function(){
				$("#azlist-container").scrollTo("#letter-divide-" + initialId, {
					axis: "y",
					duration: 10,
					onAfter: function(){
						radioplayer.utils.output('completed initial scroll');
						radioplayer.overlay.detectScrolling = true;
					}
				});
			},100)

			// Highlight this letter
			$('#letter-' + initialId).addClass('on');
      radioplayer.overlay.highlightMinimisedAlphabetTab(initialId);

      if (saveCookieFlag) {
				radioplayer.services.saveCookie("stationlistprefix/s", "stationlistprefix", stnLetter);
			}
		}

	},


	/**
	 * While scrolling the A-Z List, this function updates the sticky divide letter and the position, if the next divide down is overlapping it
     *
     * @method updateStickyDivide
     */
	updateStickyDivide : function($cont) {
		var currentViewTop = $cont.scrollTop(),
			gotNextDivide = false,
			currentDivideLetter = '';

		$cont.find('.letter-divide').each(function(i, element){

            $divideItem = $(this);

			var eleTopEdge = currentViewTop + $divideItem.position().top,
				eleBotEdge = currentViewTop + $divideItem.position().top + $divideItem.outerHeight();

			if (eleTopEdge <= currentViewTop) {
				// Divide is above the viewport
				currentDivideLetter = $divideItem.data('letter');
			} 
			else {
				// Divide is either partly visible at the top, full visible, or below the viewport

				if (!gotNextDivide) {
					gotNextDivide = true;

					if (eleTopEdge < (currentViewTop + radioplayer.overlay.azDivideHeight)) {

						var distanceFromVPTopToNextDivide = $divideItem.position().top;

						radioplayer.objs.stickyLetterDivide.css('top', '-' + (radioplayer.overlay.azDivideHeight - distanceFromVPTopToNextDivide) + 'px');
					} else {
						radioplayer.objs.stickyLetterDivide.css('top', '0');
					}

				}

			}

		});

		radioplayer.overlay.currentDivideLetter = currentDivideLetter.toLowerCase();
		radioplayer.objs.stickyLetterDivide.html(currentDivideLetter);
	},


	/**
	 * Request data from the recommendation API
     *
     * @method requestRecommend
     */
	requestRecommend : function() {
		// optional params:
		// guid
		// historyRpIds	csv
		// presetRpIds	csv
		// locale		defaults to en_GB
		// callback		defaults to callback

		$('#recom-container').html('');
		this.showMenuSpinner();

		// Set up fail safe
		this.requestFailed = false;
		this.requestFailTimer = setTimeout(function() { radioplayer.overlay.showFailMsg('recom'); }, 15000);

        var QS = "?callback=radioplayer.overlay.receiveRecommend&locale=" +
			radioplayer.lang.recommendations.locale +
			'&lang=' + langCode;

        if (radioplayer.settings.history.length > 0) {
			// Get comma separated list of preset station IDs
			QS += "&historyRpIds=" + radioplayer.settings.history.join(",");
		}

		if (radioplayer.settings.presets.length > 0) {
			// Get comma separated list of preset station IDs
			QS += "&presetRpIds=" + radioplayer.settings.presets.join(",");
		}

		if (radioplayer.settings.guid != '') {
			// Get GUID
			QS += "&guid=" + radioplayer.settings.guid;
		}

		radioplayer.services.getAPI(radioplayer.consts.api.recommend + QS);
	},


	/**
	 * Receive recommendations API data
     *
     * @method receiveRecommend
     *
	 * @param data
     */
	receiveRecommend : function(data) {

		clearTimeout(this.requestFailTimer);

		if (!this.requestFailed) {

			var html = '<h2 class="access">' + radioplayer.lang.menu_tabs.tab_3_text + '</h2>' +
					   this.iterateResults(data.recommendations, 'recommend');

			this.hideMenuSpinner();

			$('#recom-container').html(html);

			this.lazyLoad($('#recom-container'));

		}
	},


	/**
	 * Fail Message
     *
     * @method showFailMsg
	 */
	showFailMsg : function(tab) {
		this.requestFailed = true;

		// Hide loading indicator
		this.hideMenuSpinner();

		// Populate overlay
		var fail_message = '<div class="error-message fail">' + radioplayer.lang.general.fail_message + '</div>';

		$('#' + tab + '-container').addClass('has-error')
									 .html(fail_message);

		// Send analytics event for fail message
        radioplayer.services.analytics.sendEvent('Errors', 'Failed Message', tab, null, null); // Send Analytics for failed search
	},


	/**
	 * Iterate over a results set, to produce HTML
     *
     * @method iterateResults
     *
	 * @param dataset
     * @param reqType
	 * @param letter for reqType=az, letter will be letter used for grouping
     * @returns {string} resultsHtml
     */
	iterateResults : function(dataset, reqType, letter) {
		// dataset is an array or array-like object
		// reqType can be 'search', 'mystations', 'history', 'recommend', 'az'

		var resultsHtml = '',
			now = new Date(),
			nowInEpochSeconds = Math.round(now.getTime()* 0.001);

		// The outer result set
		$.each(dataset, function(index, resItem) {

			// Does this result contain more than one sub-result? If so, wrap it in a group
			if (reqType == 'search' && resItem.results[2]) { // Detect a 2nd sub-result

				resultsHtml += '<div data-brand="' + resItem.groupID + '" class="station-group collapsed">';

				$.each(resItem.results, function(subIndex, resItem2) {
					// A sub result
					var subItemsHtml = radioplayer.overlay.oneResult(reqType, resItem2, subIndex, resItem.groupID, nowInEpochSeconds);

					resultsHtml += (subIndex == 2 ? '<div class="station-group-hidden">' : '') +
								   subItemsHtml;
				});

				resultsHtml +=   '</div>' +
							   '</div>';

			} else {
				// Just a regular single result

				if (reqType == 'search') {
					var itemHtml = radioplayer.overlay.oneResult(reqType, resItem.results[1], 0, '', nowInEpochSeconds);
				} else if (reqType == 'az') {
					// Include grouping letter for a-z results
					var itemHtml = radioplayer.overlay.oneResult(reqType, resItem, 0, '', nowInEpochSeconds, letter);
				} else {
					// recommend, mystations, history
					var itemHtml = radioplayer.overlay.oneResult(reqType, resItem, 0, '', nowInEpochSeconds);
				}

				resultsHtml += itemHtml;
			}

		});

		return resultsHtml;

	},


	/**
	 * Return markup for one result
     *
     * @method oneResult
     *
	 * @param reqType
     * @param resItem
     * @param subIndex
     * @param brandName
     * @param nowInEpochSeconds
	 * @param letter
     * @returns {string} itemHtml
     */
	oneResult : function(reqType, resItem, subIndex, brandName, nowInEpochSeconds, letter) {

		var resRpId = resItem.rpId,
			resImage = (resItem.imageUrl ? resItem.imageUrl : radioplayer.consts.assetBaseUrl + 'img/result-placeholder.png'),
			resName = resItem.serviceName,
			resSubtitle = '',
			resDescr = '',
			resType = 'SI',
			resLink = resItem.consoleUrl,
			resStatus = null,
			showCurrentStatus = true;

		if (reqType == 'search') {
			// Search result
			resSubtitle = radioplayer.overlay.getSubtitle(resItem);
			resDescr = resItem.description;
			resType = resItem.type; // overwrite default
			resStatus = radioplayer.overlay.calculateStationStatus(resItem, nowInEpochSeconds);

		} else if (reqType == 'recommend') {
			// Recommendation
			resSubtitle = (resItem.type == 'ONDEMAND' ? resItem.name : '');
			resDescr = (resItem.description ? resItem.description : '');
			resType = (resItem.type == 'SERVICE' ? 'SI' : 'OD'); // overwrite default
			resStatus = radioplayer.overlay.calculateStationStatus(resItem, nowInEpochSeconds);

		} else if (reqType == 'mystations' || reqType == 'history' || reqType == 'az') {
			// My Stations / History / A-Z List
			resStatus = {
				stationType: radioplayer.lang.search.live, // LIVE
				timeToBroadcast: ''
			};
			showCurrentStatus = false;
		}

		var liveResult = (resType == 'SI' || resType == 'PI' || resType == 'PE_E' || resType == 'PI_E');

		var mayHaveMore = (liveResult ? 'not-loaded-meta' : '');

		// If station is in My Stations, show 'Added', or if presets are full show 'Full'
		var stnInMyStnsClass = '',
			myStnBtnHtml = '';

		// Only live results get My Stations icon
        // Don't show hearts in reduced functionality mode
		if (liveResult && !radioplayer.consts.reduced_func) {
			if ($.inArray(resItem.rpId, radioplayer.settings.presets) != -1) {
				stnInMyStnsClass = "in-mystations";
				myStnBtnHtml = '<span class="toggle-mystations" title="' + radioplayer.lang.mystations.remove_this + '">\
                            <button type="button" title="' + radioplayer.lang.mystations.remove_this + '" class="heart-container">\
                            		<span class="heart-container-ie8"></span>\
                                <span class="accessibility-text">' + radioplayer.lang.mystations.remove_this + '</span>\
                                <span class="icon-heart">\
                                    <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span><span class="path7"></span><span class="path8"></span>\
                                </span>\
                            </button>\
                        </span>';
			} else {
                //myStnBtnHtml = '<span class="toggle-mystations"><button type="button" title="' + radioplayer.lang.mystations.add_this + '"><span>' + radioplayer.lang.mystations.add_this + '</span></button></span>';
				myStnBtnHtml = '<span class="toggle-mystations" title="' + radioplayer.lang.mystations.add_this + '">\
                            <button type="button" title="' + radioplayer.lang.mystations.add_this + '" class="heart-container">\
                            		<span class="heart-container-ie8"></span> \
                                <span class="accessibility-text">' + radioplayer.lang.mystations.add_this + '</span>\
                                <span class="icon-heart">\
                                    <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span><span class="path7"></span><span class="path8"></span>\
                                </span>\
                            </button>\
                        </span>';
			}
		}

		var moreMsg = radioplayer.lang.search.show_more_stations,
			moreMsg = moreMsg.replace("{group}", brandName);

        if (reqType == 'recommend') {
                // For recommended results, we show factors in the more info section, so add this in straight away
                var factorList = resItem.factors.join(', ');
        }

//				'<div class="overlay-item-data" href="' + resLink + '"' + (reqType == 'az' ? ' data-letter="' + letter + '"' : '') + '>' +

		var itemHtml = '<div href="' + resLink + '"' + (reqType == 'az' ? ' data-letter="' + letter + '"' : '') + ' data-stationid="'+resRpId+'" data-type="'+resType+'" data-statustype="' + resStatus.stationType + '" data-section="' + reqType + '" class="overlay-item '+resType+' '+stnInMyStnsClass+' not-loaded-img '+mayHaveMore+'">' +

			'<div class="overlay-item-initial '+ (reqType == 'recommend' ? 'overlay-item-rec' : '') +'">' +
					'<a class="overlay-item-link" href="' + resLink + '"' + (reqType == 'az' ? ' data-letter="' + letter + '"' : '') + '>' +
					'<span class="overlay-item-img">' +
					  '<span class="play-icon"></span>' +
					  '<img src="' + radioplayer.consts.assetBaseUrl + 'img/result-placeholder.png" data-src="' + resImage + '" width="86" height="48" alt="" />' +
					'</span>' +
					'<span class="title">' + resName + '</span>' +
					'</a>' +


					'<p class="' + (resType == 'OD' || resType == 'PI_OD' ? 'programme-title' : 'subtitle') + ' truncate">' + resSubtitle + '</p>' +
					'<p class="description">' + resDescr + '</p>' +

				(showCurrentStatus ? '<p class="broadcast-info"><span class="status">' + resStatus.stationType + '</span> <span class="broadcast-time">' + resStatus.timeToBroadcast + '</span> '+

                    (reqType == 'recommend' ? '<span class="recommend-factors"><span class="icon-tag"></span>' + factorList + '</span>' : '') +

                    '</p>' : '') +

				myStnBtnHtml +
			'</div>';

			itemHtml += (subIndex == 1 ? '<a href="#" class="station-group-toggle" role="button"><i></i>' + moreMsg + '</a>' : '') +

		'</div>';
		return itemHtml;
	},


	/**
	 * Show more info for a result
     *
     * @method receiveStnNowInfo
     * @param data {Object}
	 */
	receiveStnNowInfo : function(data) {
		if (data.responseStatus == 'SUCCESS' && data.total > 0) {

			$.each(data.results, function(rpId, arrStation){

				// Run through each matching result
				radioplayer.objs.overlayContainer.find(".overlay-item.checking-for-meta[data-stationid='" + rpId + "']").each(function(i, element){

					$overlayItem = $(element);

					// Swap this class immediately to prevent doubling up.
					$overlayItem.removeClass("checking-for-meta");

					// Construct expanded content for this result here
					var z = 1,
						metaHtml = '',
						metaArray = [],
						metaTypesArray = [],
						subtitle,
						imageUrls = [],
						descriptions = [],
						resultTypes = [],
						resultType = $overlayItem.attr("data-type"),
						promoteData = ($.inArray($overlayItem.data('section'), ['mystations', 'history', 'recommend', 'az']) > -1), // should items be promoted to the top result?

						initialResultType = '',
						initialResultSubtitle = '',
						initialResultDescription = '';

					// Get bits of info in the context of this result
					imageUrls[0] = $(".overlay-item-initial .overlay-item-img img", element).attr("src");
					descriptions[0] = $(".overlay-item-initial .overlay-item-data .description", element).html();
					resultTypes[0] = resultType;
					var playerUrl = $(".overlay-item-initial .overlay-item-link", element).attr("href");

					// Run through all returned live data for this station
					$.each(arrStation, function(index, resItem) {

						// For My Stations and History, use the SI image as the logo, and name too
						if (resItem.type == 'SI' && ($overlayItem.data('section') == 'mystations' || $overlayItem.data('section') == 'history')) {
							$overlayItem.find('.overlay-item-img img').attr('src', resItem.imageUrl);
							$overlayItem.find('.title').html(resItem.serviceName);
						}


						// We're only interested in certain types of data
						if ($.inArray(resItem.type, ['SI', 'PI', 'PE_E', 'PI_E']) > -1) {

							subtitle = radioplayer.overlay.getSubtitle(resItem);

							/*
							 * Build up an array of data to include in the section if the down arrow is clicked
							 * An item may be removed from this array later, if it is selected to be added to the initial result
							 */

							// Don't add the same data that we already have for this result
							if (resItem.type != resultType) {

								// Check if we've already shown this image once
								if ($.inArray(resItem.imageUrl, imageUrls) != -1) {
									resItem.imageUrl = '';

								} else {
									// Show this image, but store it so we don't show it again
									imageUrls[z] = resItem.imageUrl;
								}

								// Check if we've already shown this description once
								if ($.inArray(resItem.description, descriptions) != -1) {
									resItem.description = '';

								} else {
									// Show this description, but store it so we don't show it again
									descriptions[z] = resItem.description;
								}

								resultTypes[z] = resItem.type;

								if (subtitle || resItem.description) {
									// Only add this item if we have at least one thing to display (after duplication removal)

									if (resItem.song && (resItem.type == 'PE_E' || resItem.type == 'PI_E')) {
										// For songs, show the song icon

										metaArray.push('<div class="overlay-item-song' +
															($overlayItem.data('section') !== 'recommend' && metaArray.length == 0 ? ' no-top-border' : '') +
															'">' +
													  '<i></i>' + subtitle +
													'</div>');

										metaTypesArray.push('song');

									} else {
										// Other meta types

										metaArray.push('<div class="overlay-item-extra' +
															(resItem.imageUrl ? ' hasImage' : '') +
															($overlayItem.data('section') !== 'recommend' && metaArray.length == 0 ? ' no-top-border' : '') +
															'">' +

													  (resItem.imageUrl ? '<a class="overlay-item-link" href="' + playerUrl + '">' +
														'<span class="overlay-item-img">' +
														  '<span class="play-icon"></span>' +
														  '<img width="86" height="48" alt="" src="' + resItem.imageUrl + '">' +
														'</span>' +
													  '</a>' : '') +

													  '<div class="overlay-item-data">' +
														'<p class="subtitle">' + subtitle + '</p>' +
														'<p class="description">' + resItem.description + '</p>' +
													  '</div>' +
													'</div>');

										metaTypesArray.push(resItem.type);
									}
								}

								z++;
							}


							/*
							 * For specific sections (promoteData is true), pick out a piece of data to be added to the initial result
							 * Select in order of Song, then other programme event, then PI, then SI
							 */

							if (promoteData && (subtitle || resItem.description)) {

								if (resItem.song && (resItem.type == 'PE_E' || resItem.type == 'PI_E')) {
									// Song

									initialResultType = 'song';
									initialResultSubtitle = subtitle;
									initialResultDescription = resItem.description;

								} else if (resItem.type == 'PE_E' || resItem.type == 'PI_E') {
									// Other type of event

									if (initialResultType != 'song') {
										initialResultType = resItem.type;
										initialResultSubtitle = subtitle;
										initialResultDescription = resItem.description;
									}

								} else if (resItem.type == 'PI') {
									// Programme

									if ($.inArray(initialResultType, ['song', 'PE_E', 'PI_E']) == -1) {
										initialResultType = resItem.type;
										initialResultSubtitle = subtitle;
										initialResultDescription = resItem.description;
									}

								} else if (resItem.type == 'SI') {
									// Station

									if ($.inArray(initialResultType, ['song', 'PE_E', 'PI_E', 'PI']) == -1) {
										initialResultType = resItem.type;
										initialResultSubtitle = subtitle;
										initialResultDescription = resItem.description;
									}

								}
							}

						}

					});


					/*
					 * If we have some info to add to the initial result, do that here
					 */

					if (initialResultType != '') {
						$overlayItem.find('.overlay-item-initial .subtitle').html(initialResultSubtitle);
						$overlayItem.find('.overlay-item-initial .description').html(initialResultDescription);

						if (initialResultType == 'song') {
							// Remove truncation for songs
							$overlayItem.find('.overlay-item-initial .subtitle').removeClass('truncate');
						}

						// If this data is in metaArray (for the dropdown) then remove it here
						if (metaArray.length > 0) {
							// Get index of the element we want, by getting the index from the metaTypesArray
							var removeIndex = $.inArray(initialResultType, metaTypesArray);
							if (removeIndex > -1) {
								metaArray.splice(removeIndex, 1);
							}
						}
					}


					/*
					 * If we have extra metadata to add to the dropdown, add it to the dom after the initial result
					 */

					$overlayItem.addClass("no-meta-available");

				});

			});

			// For A-Z list, once we've loaded extra info, we may need to update position of sticky divide
			if ($overlayItem.data('section') == 'az') {
				if ($.browser.msie && $.browser.version == 7) {
					// Don't use sticky divide on IE 7, it performs poorly
				} else {
					radioplayer.overlay.updateStickyDivide($("#azlist-container"));
				}
			}

		}
	},


	/**
	 * Collapse any expanded results
     *
     * @method collapseResult
	 */
	collapseResult : function() {
		if (radioplayer.objs.overlayContainer.find(".overlay-item.expanded").length == 1) {
			var openItem = radioplayer.objs.overlayContainer.find(".overlay-item.expanded");
			openItem.children(".overlay-item-extra-cont").slideUp(250, function(){
				$(this).hide();	// This is here so that if an expanded result is collapsed, but within a hidden group, it still gets collapsed. .slideUp() doesn't work when a parent is hidden.
			});
			openItem.find(".more-toggle").attr("title", radioplayer.lang.search.show_information).html('<span>' + radioplayer.lang.search.show_information + '</span>');
			openItem.removeClass("expanded").prev().removeClass("prevExpanded");
		}
	},


	/**
	 * Station status functions
     *
     * @method calculateStationStatus
     * @param result {Object}
     * @param nowInEpochSeconds {int} Epoch Timestamp
	 */
	calculateStationStatus : function(result, nowInEpochSeconds){

		var returnType = {};

		// startTime and stopTime are when the programme was broadcast
		// odStartTime and odStopTime are when the programme should be available

		// Recommendations
		// Off-schedule OD does not include startTime/stopTime, but has integers for odStartTime/odStopTime
		// Both are returned for on schedule OD (PI_OD)

		// Search
		// Off-schedule OD has blank strings for startTime/stopTime, and integers for odStartTime/odStopTime
		// Both are returned for on schedule OD (PI_OD)
		// PI and PE may have startTime and stopTime - should be looked at for coming up

		var startTimeMinusNow = null,
			stopTimeMinusNow = null;

		if (result.startTime && result.startTime != '' && result.stopTime && result.stopTime != '') {
			startTimeMinusNow = (result.startTime - nowInEpochSeconds);
			stopTimeMinusNow = (result.stopTime - nowInEpochSeconds);
		}

		// startTimeMinusNow is the offset in time from 'now' to when the prog started. if it is negative, the prog started in the past, else it starts in the future.
		// stopTimeMinusNow is the offset in time from 'now' to when the prog stopped. if it is negative, the prog stopped in the past, else it stops in the future.

		if (result.startTime && result.startTime != '' && startTimeMinusNow > 0) {
			// Coming up

			returnType.stationType = radioplayer.lang.search.coming_up;
			returnType.timeToBroadcast = this.getTimeBeforeBroadcast(startTimeMinusNow);

		} else if (result.stopTime && result.stopTime != '' && stopTimeMinusNow < 0) {
			// On schedule OD (Catch up)

			returnType.stationType = radioplayer.lang.search.broadcast;
			var nowMinusStopTime = nowInEpochSeconds - result.stopTime;
			returnType.timeToBroadcast = this.getTimePastSinceBroadcast(nowMinusStopTime);

		} else if (result.odStartTime && result.odStartTime != '') {
			// Off schedule OD

			returnType.stationType = radioplayer.lang.search.broadcast;
			returnType.timeToBroadcast = "";

		} else {
			// Live

			returnType.stationType = radioplayer.lang.search.live;
			returnType.timeToBroadcast = "";
		}

		return returnType;
	},


    /**
     * @method divideAndRound
     * @param timeInEpochSeconds {int} Epoch Timestamp
     * @param divideBy {int}
     * @return {mixed|int}
     */
	divideAndRound : function(timeInEpochSeconds, divideBy){
		var result = "";
		var tempTime;
		timeReturned = (timeInEpochSeconds / divideBy);
		if (timeReturned >= 1){
			timeReturned = Math.round(timeReturned);
			result = timeReturned;
			return result;
		}
		return 1;
	},


    /**
     * Get Time Before Broadcast
     *
     * @method getTimeBeforeBroadcast
	 *
     * @param timeInEpochSeconds {int}
     * @returns {string} Time before broadcast
     */
	getTimeBeforeBroadcast : function(timeInEpochSeconds){
		var minutesToBroadcast = (timeInEpochSeconds / 60);
		minutesToBroadcast = Math.round(minutesToBroadcast);
		if (minutesToBroadcast == 0) {
			return " " + radioplayer.lang.search.in_seconds; // in seconds
		} else if (minutesToBroadcast == 1) {
			return " " + radioplayer.lang.search.in_minute; // in 1 minute
		} else {
			var strMins = radioplayer.lang.search.in_minutes; // in {n} minutes
			strMins = strMins.replace("{n}", minutesToBroadcast);
			return " " + strMins;
		}
	},


    /**
     * Get Time Past Since Broadcast
	 *
	 * @method getTimePastSinceBroadcast
     *
     * @param timeInEpochSeconds {int}
     * @returns {string} Localised string of relative date
     */
	getTimePastSinceBroadcast : function(timeInEpochSeconds){
		var timeValue,retString, year, month, week, day, hour, minute;
		year = 31556926;
		month = 2629743;
		week = 604800;
		day = 86400;
		hour = 3600;
		minute = 60;
		if (timeInEpochSeconds >= week){
			if (timeInEpochSeconds >= year){
				timeValue = this.divideAndRound(timeInEpochSeconds, year);
				if (timeValue){
					return retString = this.getTimePastString(timeValue, radioplayer.lang.search.year_ago, radioplayer.lang.search.years_ago);
				}
			} else if(timeInEpochSeconds >= month){
				timeValue = this.divideAndRound(timeInEpochSeconds, month);
				if (timeValue){
					return retString = this.getTimePastString(timeValue, radioplayer.lang.search.month_ago, radioplayer.lang.search.months_ago);
				}
			} else if(timeInEpochSeconds >= week){
				timeValue = this.divideAndRound(timeInEpochSeconds, week);
				if (timeValue){
					return retString = this.getTimePastString(timeValue, radioplayer.lang.search.week_ago, radioplayer.lang.search.weeks_ago);
				}
			}
		} else {
			if (timeInEpochSeconds >= day){
				timeValue = this.divideAndRound(timeInEpochSeconds, day);
				if (timeValue){
					return retString = this.getTimePastString(timeValue, radioplayer.lang.search.day_ago, radioplayer.lang.search.days_ago);
				}
			} else if(timeInEpochSeconds >= hour){
				timeValue = this.divideAndRound(timeInEpochSeconds, hour);
				if (timeValue){
					return retString = this.getTimePastString(timeValue, radioplayer.lang.search.hour_ago, radioplayer.lang.search.hours_ago);
				}
			} else if(timeInEpochSeconds >= minute){
				timeValue = this.divideAndRound(timeInEpochSeconds, minute);
				if (timeValue){
					return retString = this.getTimePastString(timeValue, radioplayer.lang.search.minute_ago, radioplayer.lang.search.minutes_ago);
				}
			}
		}
		return retString = this.getTimePastString(timeInEpochSeconds, radioplayer.lang.search.second_ago, radioplayer.lang.search.seconds_ago);
	},


    /**
     * Get Time Past String
     *
     * @method getTimePastString
     * @param value {int}
     * @param single {string}
     * @param plural {string}
     * @returns {string} Localised string of relative date
     */
	getTimePastString : function(value, single, plural){
		if (value == 1) {
			return single;
		} else {
			plural = plural.replace("{n}", value);
			return plural;
		}
	},


    /**
     * Get Subtitle
     *
     * @method getSubtitle
     *
     * @param result {Object}
     * @returns {string} Subtitle
     */
	getSubtitle : function(result){
		if ((result.type == 'PE_E' || result.type == 'PI_E') && result.artistName) {
			return result.artistName + " - " + result.name;
		} else {
			return result.name;
		}
	}

};
/**
 * @name playing
 * @description All handling of the automatic populating of the Playing overlay
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
 * @overlay
 *
 * This file is called by:
 * @ overlay
 *
 * @class playing
 * @module playing
 */


radioplayer.playing = {
	requestFailTimer : null,

	requestPlayingSecs : (8 * 1000),
	requestPlayingTimer : null,

	requestPlayingSecs_Song : (150 * 1000), // 2:30 song length

	showingPlayingType : '',
	showingText : '',
	playingArtist : '',
	playingTitle : '',

	animateEasing : 'swing', //'linear',
	pxPerSecond : 90,

	scrollingContainerWidth : 0,
	scrollTimeout : null,
	scrollDirection : 'l',
	endPos : 0,

	nowPlayingStripWidth : 0,
  nowPlayingID3: '',

  receivedStreamData: false,

	songAction : null,

  terminateUpdating: false,

	windowHasFocus : true,

	nowNextToggleTiming: (7 * 1000),


	/**
	 * Initialise Playing Bar. This is only called for live audio.
     *
     * @method init
	 */
	init : function() {
		// Grab objects
		radioplayer.objs.nowPlayingStrip = $('.now-playing-strip');
		radioplayer.objs.scrollingContainer = $('.scrolling-container');
		radioplayer.objs.scrollerText = {
			"now" : $('.scrolling-text-now'),
			"next" : $('.scrolling-text-next')
		};
		radioplayer.playing.isScrolling = 'next';

		// Localisation
		$('#live-strip .live-indicator').html(radioplayer.lang.playing.live);
		
		// Store width
		this.nowPlayingStripWidth = radioplayer.objs.nowPlayingStrip.width() - 20;
        radioplayer.objs.scrollingContainer.css("left",radioplayer.lang.playing.live_width+"px");

		// Scroll when mouseover, return to starting position when mouseout
		radioplayer.objs.scrollingContainer.on('mouseenter.start-scroller', function(){

			radioplayer.objs.nowPlayingStrip.addClass('mouse-over');

			radioplayer.playing.startScrolling();

		}).on('mouseleave.reset-scroller', function(){

			radioplayer.playing.resetScroller(true);

		}).on('focus', function(){
			// Keyboard access for the ticker
			if (!radioplayer.mouseActive) {
				radioplayer.objs.scrollingContainer.trigger('mouseenter.start-scroller');
			}

		}).on('blur', function(){
			// Keyboard access for the ticker
			if (!radioplayer.mouseActive) {
				radioplayer.objs.scrollingContainer.trigger('mouseleave.reset-scroller');
			}

		});


		// When window is blurred, stop requesting now playing info
		$(window).on('blur', function(){
			if (radioplayer.playing.windowHasFocus) {
				radioplayer.playing.windowHasFocus = false;
				radioplayer.playing.stopUpdating();
			}

		}).on('focus', function(){
			if (!radioplayer.playing.windowHasFocus) {
				radioplayer.playing.windowHasFocus = true;

				if (!radioplayer.objs.body.hasClass('showing-overlay') && audioLive) {
					// Only resume polling when focussing, if overlay isn't showing. Polling will auto resume when overlay hides anyway.
					radioplayer.playing.startUpdating();
				}

			}
		});

		$(radioplayer.services).on('gotSongAction', function(){
			if (radioplayer.playing.showingText != '') {
				// We've already received playing text, so update it with the song action we now have
				radioplayer.utils.output('update text late with song action');
				radioplayer.playing.updateText(radioplayer.playing.showingText, radioplayer.playing.showingPlayingType);
			}
		});

    this.startUpdating();
	},

	/**
	 * Start Updating
	 *
	 * @method startUpdating
	 */
	startUpdating : function() {
		// Get Now Playing if auto populating this overlay
		if (audioLive && nowPlayingSource != 'stream') {
			// This can be called on hide of overlay and focus of window, but is only useful for Live audio
			// If source is locked to stream, don't start polling
			this.requestFailTimer = setTimeout(function() { radioplayer.playing.showFailMsg(); nowPlayingSource = 'stream'; }, 1000);
			this.requestPlaying();
			if (radioplayer.playing.artist_next) {
				clearTimeout(radioplayer.playing.nowNextToggleTimeout);
				radioplayer.playing.nowNextToggleTimeout = setTimeout(radioplayer.playing.toggleNowNext, radioplayer.playing.nowNextToggleTiming);
			}
		}
	},

    /**
     * Stop Updating
     *
     * @method stopUpdating
     */
	stopUpdating : function(terminateUpdates) {

    if(typeof terminateUpdates != "undefined" && terminateUpdates == true) {
      this.terminateUpdating = true;
    }

		clearTimeout(this.requestPlayingTimer);
		clearTimeout(this.requestFailTimer);
		clearTimeout(this.nowNextToggleTimeout);

		this.showingPlayingType = '';
		this.showingText = '';
	},


	/**
	 * Begin scrolling - occurs when user mouses over the text container
     *
     * @method startScrolling
	 */
	startScrolling : function() {
		clearTimeout(radioplayer.playing.nowNextToggleTimeout);
		clearTimeout(radioplayer.playing.scrollTimeout);
		// Which text are we scrolling
		if ($('.scrolling-text').hasClass('scrolling-text--showing-next')){
			radioplayer.playing.isScrolling = 'next';
		}
		else {
			radioplayer.playing.isScrolling = 'now';
		}

    if ($.browser.msie && $.browser.version == 7) {
        // IE7 can't calculate the width of the text element inside the container with overflow:hidden
        // So create a new element to calculate the width, then remove it
        $tempObj = $('<div style="position:absolute;top:-999px;font-size:11px;">' + radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').html() + '</div>');

        radioplayer.objs.body.append($tempObj);
        var scrollingTextWidth = $tempObj.outerWidth();
        $tempObj.remove();

    } 
    else {
    		var scrollingTextWidth = radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').outerWidth();
    }

		this.nowPlayingStripWidth = radioplayer.objs.nowPlayingStrip.width() - 20;
    this.scrollingContainerWidth = this.nowPlayingStripWidth - radioplayer.lang.playing.live_width;
    if ($(".song-action--"+radioplayer.playing.isScrolling).length) {
    	this.scrollingContainerWidth -= $(".song-action--"+radioplayer.playing.isScrolling).outerWidth() + 5;
    }

		if (scrollingTextWidth > this.scrollingContainerWidth) {
			// Content width is wider than container, so scroll
			this.endPos = scrollingTextWidth - this.scrollingContainerWidth + 10; // 4 added to allow for space between song action
			this.nextScroll();
		}
	},


	/**
	 * Animate this transition if animate is true
     *
     * @method nextScroll
	 */
	nextScroll : function() {

		// calculate animation duration
		var duration = radioplayer.playing.calcDuraToAnimate(radioplayer.playing.endPos);

		if (radioplayer.playing.scrollDirection == 'l') {
			radioplayer.utils.output('animate to the left');

			radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').animate({left: '-' + radioplayer.playing.endPos + 'px'}, duration, radioplayer.playing.animateEasing);

			radioplayer.playing.scrollDirection = 'r'; // next direction

			radioplayer.playing.scrollTimeout = setTimeout(radioplayer.playing.nextScroll, duration+3000);

		} else {
			radioplayer.utils.output('animate to the right (and reset)');
			radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').animate({left: '0'}, duration, radioplayer.playing.animateEasing, function(){
				radioplayer.objs.nowPlayingStrip.removeClass('mouse-over');
			});
			
			radioplayer.playing.scrollDirection = 'l'; // next direction
		}

		//radioplayer.playing.scrollTimeout = setTimeout(radioplayer.playing.nextScroll, duration+3000);

	},


	/**
	 * Reset the scroller back to the original position
	 * Animate this transition if animate is true
     *
     * @method resetScroller
	 * @param animate {Boolean}
	 */
	resetScroller : function(animate) {
		clearTimeout(radioplayer.playing.scrollTimeout);

		this.scrollDirection = 'l';

		if (animate) {
			// calculate animation duration
			var duration = this.calcDuraToAnimate(4 - radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').position().left);

			radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').stop(true).animate({left: '0'}, duration, radioplayer.playing.animateEasing, function(){
				radioplayer.objs.nowPlayingStrip.removeClass('mouse-over');
				if (radioplayer.playing.artist_next) {
					clearTimeout(radioplayer.playing.nowNextToggleTimeout);
					radioplayer.playing.nowNextToggleTimeout = setTimeout(radioplayer.playing.toggleNowNext, radioplayer.playing.nowNextToggleTiming);
				}
			});
		} else {
			radioplayer.objs.scrollerText[radioplayer.playing.isScrolling].children('.song-text').stop(true).css({left: '0'});
			radioplayer.objs.nowPlayingStrip.removeClass('mouse-over');
			if (radioplayer.playing.artist_next) {
				clearTimeout(radioplayer.playing.nowNextToggleTimeout);
				radioplayer.playing.nowNextToggleTimeout = setTimeout(radioplayer.playing.toggleNowNext, radioplayer.playing.nowNextToggleTiming);
			}
		}
	},


	/**
	 * Calculate the duration needed to animate something, based on the pixels to move by, and the pxPerSecond
     *
     * @method calcDuraToAnimate
	 * @param pxToMove {Integer}
     * @return {int} Time of animation duration
	 */
	calcDuraToAnimate : function(pxToMove) {
		return Math.floor(pxToMove / (this.pxPerSecond / 1000));
	},

	/**
	 * Request info for now playing bar
     *
     * @method requestPlaying
	 */
	requestPlaying : function() {
		if (!radioplayer.consts.block_now_next) {
			var url = radioplayer.consts.api.nowNext + "?rpId=" + currentStationID + "&descriptionSize=200&callback=radioplayer.playing.receiveNowNext";
			radioplayer.services.getAPI(url);

			// Start timer to request PI again
			clearTimeout(this.requestPlayingTimer);
			this.requestPlayingTimer = setTimeout(function() { radioplayer.playing.requestPlaying(); }, radioplayer.playing.requestPlayingSecs);
		}
	},

	/**
	 * Receive PI from server for station currently playing
     *
     * @method receive
     * @param data {Object}
	 */
	receiveNowNext : function(data) {
		clearTimeout(this.requestFailTimer);

		if (radioplayer.controls.noSupportShowing) {
			return false;
		}

		if(data.results.now) {
			var receivedData = {};
			var useText = null;
			var useType = null;
			var nextText = null;
			var nextType = null;

			if (data && data.results && data.results.now) {
				var resItem = data.results.now;
				if (resItem.type == 'PE_E' || resItem.type == 'PI_E' && data.results.now.song) {
					// Track
					receivedData.PEText = resItem.artistName + ' - ' + resItem.name;
					radioplayer.playing.artist = resItem.artistName;
					radioplayer.playing.title = resItem.name;
					useText = receivedData.PEText;
					useType = 'PE';
				}
				else if (resItem.type == 'PI') {
					// Programme
					receivedData.PIText = resItem.programmeName;
					useText = receivedData.PIText;
					useType = "PI";
				}
				else if (resItem.type == 'SI') {
					// Station
					receivedData.PIText = resItem.name;
					if(resItem.serviceDescription) {
	        	receivedData.SIDesc = resItem.serviceDescription;
	        	useText = receivedData.SIDesc;
	        } else {
	          receivedData.SITitle = resItem.serviceName;
	          useText = receivedData.SITitle;
	        }
	        useType = 'SI';
				}
			}

			if (data && data.results && data.results.next && data.results.next[0]) {
				var resItem = data.results.next[0];
				if (resItem.type == 'PE_E' || resItem.type == 'PI_E' && data.results.now.song) {
					radioplayer.playing.artist_next = resItem.artistName;
					radioplayer.playing.title_next = resItem.name;
					nextText = "NEXT: "+resItem.artistName + ' - ' + resItem.name;
					nextType = 'PE';
					if (useType && useType === 'PE') {
						useText = "NOW: "+useText;
					}
				}
			}

			if (useText !== this.showingText) {
				this.updateText(useText, useType);
			}

			if (nextText && nextText !== this.showingNextText) {
				this.updateNextText(nextText, nextType);
			}
			else if (!nextText) {
				clearTimeout(radioplayer.playing.nowNextToggleTimeout);
				$('.scrolling-text').removeClass('scrolling-text--showing-next');
				radioplayer.playing.artist_next = null;
				radioplayer.playing.title_next = null;
				this.showingNextText = null;
			}
		}
		else {	
			radioplayer.playing.showFailMsg();
			nowPlayingSource = 'stream';
		}
		
	},

	/**
	 * Receive PI from server for station currently playing
     *
     * @method receive
     * @param data {Object}
	 */
	receive : function(data) {
	},

	/**
	 * Update the scroller with new text
     *
     * @method updateText
     * @param useText {String}
     * @param useType {String}
	 */
	updateText : function(useText, useType) {
		if (audioLive) {
			// Live Ticker
			var insertedSongAction = false;
      $('.song-action--now').remove();

			if (useType == 'PE') {        
				if (this.songAction) {
					// We have a song action
					var songUrl = radioplayer.playing.songAction.baseurl;

					// Double encoded versions
					songUrl = songUrl.replace(/\[\[artist\]\]/gi, encodeURIComponent(encodeURIComponent(radioplayer.playing.artist)));
					songUrl = songUrl.replace(/\[\[title\]\]/gi, encodeURIComponent(encodeURIComponent(radioplayer.playing.title)));

					// Normal encoded versions
					songUrl = songUrl.replace(/\[artist\]/gi, encodeURIComponent(radioplayer.playing.artist));
					songUrl = songUrl.replace(/\[title\]/gi, encodeURIComponent(radioplayer.playing.title));

					// Create song action object
					$songAction = $('<a class="song-action song-action--now" href="' + songUrl + '" target="_blank">' + radioplayer.playing.songAction.type + '</a>');
					// Insert Song Action into DOM after scrolling container
					$('.scrolling-text').append($songAction);

					insertedSongAction = true;
					// Adjust the position of the scroller text to account for song action 
					radioplayer.objs.scrollerText['now'].css('right', $(".song-action--now").outerWidth() + 10 + 'px');
				}
				else {
					radioplayer.objs.scrollerText['now'].css('right', '0px');
				}

				if (this.showingPlayingType != 'PE' && this.showingPlayingType != '') {
					// The previous item wasn't a song, or blank, and this is a song, so wait longer before requesting again
					radioplayer.utils.output('now waiting long for now playing as this is a song');
					clearTimeout(this.requestPlayingTimer);
					this.requestPlayingTimer = setTimeout(function() { radioplayer.playing.requestPlaying(); }, radioplayer.playing.requestPlayingSecs_Song);
				}
			}

      radioplayer.objs.scrollerText['now'].children('.song-text').html(useText);

			this.resetScroller(false);
    } 
    else {
		// OD Title
        $('#od-title').html(useText);
    }

		this.showingPlayingType = useType;
		this.showingText = useText;
	},

	/**
	 * Update the scroller with new next track text
     *
     * @method updateNextText
     * @param useText {String}
     * @param useType {String}
	 */
	updateNextText : function(nextText, nextType) {
		if (audioLive) {
			// Live Ticker
			var insertedSongAction = false;
      $('.song-action--next').remove();

      radioplayer.objs.scrollerText['next'].children('.song-text').html(nextText);
			clearTimeout(radioplayer.playing.nowNextToggleTimeout);
			if (radioplayer.playing.artist_next) {
      	radioplayer.playing.nowNextToggleTimeout = setTimeout(radioplayer.playing.toggleNowNext, radioplayer.playing.nowNextToggleTiming);
      }

      if (nextType == 'PE') {        
      	if (this.songAction) {
      		// We have a song action
      		var songUrl = radioplayer.playing.songAction.baseurl;

      		// Double encoded versions
      		songUrl = songUrl.replace(/\[\[artist\]\]/gi, encodeURIComponent(encodeURIComponent(radioplayer.playing.artist_next)));
      		songUrl = songUrl.replace(/\[\[title\]\]/gi, encodeURIComponent(encodeURIComponent(radioplayer.playing.title_next)));

      		// Normal encoded versions
      		songUrl = songUrl.replace(/\[artist\]/gi, encodeURIComponent(radioplayer.playing.artist_next));
      		songUrl = songUrl.replace(/\[title\]/gi, encodeURIComponent(radioplayer.playing.title_next));

      		// Create song action object
      		$songAction = $('<a class="song-action song-action--next" href="' + songUrl + '" target="_blank">' + radioplayer.playing.songAction.type + '</a>');
      		// Insert Song Action into DOM after scrolling container
      		$('.scrolling-text').append($songAction);

      		insertedSongAction = true;
      		// Adjust the position of the scroller text to account for song action 
      		radioplayer.objs.scrollerText['next'].css('right', $(".song-action--next").outerWidth() + 10 + 'px');
      	}
      	else {
      		radioplayer.objs.scrollerText['next'].css('right', '0px');
      	}
      }

			this.showingNextText = nextText;

    } 
	},

	toggleNowNext : function() {

		if(radioplayer.controls.noSupportShowing) {
			$('.scrolling-text').removeClass('scrolling-text--showing-next');
			clearTimeout(radioplayer.playing.nowNextToggleTimeout);
			return false;
		}

		$('.scrolling-text').toggleClass('scrolling-text--showing-next');
		if (radioplayer.playing.artist_next) {
			clearTimeout(radioplayer.playing.nowNextToggleTimeout);
    	radioplayer.playing.nowNextToggleTimeout = setTimeout(radioplayer.playing.toggleNowNext, radioplayer.playing.nowNextToggleTiming);
    }
	},

	/**
	 * Receive just SI from server, as a fallback for AOD that does not have associated search data
     *
     * @method receiveOD
     * @param data {Object}
	 */
	receiveOD : function(data) {
		var APIreturnedName = false;

		if (data.responseStatus == 'SUCCESS' && data.total > 0) {
			$.each(data.results, function(index, resItem) { // Only interested in the one OD result
				if ((resItem[0].type == 'PI_OD' || resItem[0].type == 'OD') && resItem[0].name && resItem[0].name != "") {
					APIreturnedName = true;
					radioplayer.playing.updateText(resItem[0].name, "OD");
        }
			});
		}

		if (!APIreturnedName) {
			// Nothing returned from the API, so fallback to using stream metadata, if there is any
			nowPlayingSource = "stream";
			if (radioplayer.playing.receivedStreamData) {
				this.updateText(radioplayer.playing.nowPlayingID3, "OD");
			}
		}
	},

	/**
	 * Show fail message
	 * Updates the ticker with the station name
     *
     * @method showFailMsg
	 */
	showFailMsg : function() {
		this.updateText(currentStationName, 'fallback');
	},
    /**
     *
     * Metadata Received
     *
     * @event metadataReceived
     * @param type
     * @param event {object}
     * @see http://en.wikipedia.org/wiki/ID3
     */
	metadataReceived : function(type, event) {
		radioplayer.utils.output('Stream metadata received.');
		if (radioplayer.consts.consolelog) console.dir(event);

		if (event.type == 'metadata') { // If we have metadata
      radioplayer.playing.receivedStreamData = true;

      if(typeof event.data.TIT2 != "undefined" || typeof event.data.songName != "undefined") { // And the metadata contains ID3

        radioplayer.utils.output('id3 received');

        // Parse the ID3 info and save to variables
        if(event.data.TIT2) {
            radioplayer.playing.title = event.data.TIT2;
        } else if(event.data.songName) {
            radioplayer.playing.title = event.data.songName;
        }

        if(event.data.TPE1) {
            radioplayer.playing.artist = event.data.TPE1;
        } else if(event.data.artist) {
            radioplayer.playing.artist = event.data.artist;
        }

        var tickerText = radioplayer.playing.swapPlaceholdersForSong();

        radioplayer.playing.nowPlayingID3 = tickerText;

        // If locked to stream, show the info in the ticker
        if (nowPlayingSource == "stream") {
            radioplayer.playing.updateText(tickerText, (audioLive ? "" : "OD"));
        }

      } 
      else { // Treat the metadata as in stream (not ID3)
        radioplayer.utils.output('StreamTitle: ' + event.data.StreamTitle);
        radioplayer.utils.output('StreamUrl: ' + event.data.StreamUrl);
        radioplayer.utils.output('Name: ' + event.data.name);

				if (nowPlayingSource == "stream") {
					// If locked to stream, show the info in the ticker

					var songData = event.data.StreamTitle.split('~');
					if (songData[4] == 'MUSIC') {

						radioplayer.playing.artist = songData[0];
						radioplayer.playing.title = songData[1];

						var tickerText = radioplayer.playing.swapPlaceholdersForSong();

						radioplayer.playing.nowPlayingID3 = tickerText;

						// If locked to stream, show the info in the ticker
						radioplayer.playing.updateText(tickerText, (audioLive ? "" : "OD"));

					} else {
						// If it's not a song, update with the station name
						radioplayer.playing.updateText(currentStationName, (audioLive ? "" : "OD"));
					}
				}
			}
		}
	},


    /**
     * Swap `{artist}` and `{track}` placeholders for the current playing track, using the set format
     *
     * @method swapPlaceholdersForSong
     * @return {string} Ticker text, with placeholders swapped for real values
     */
	swapPlaceholdersForSong : function() {
		var tickerText = radioplayer.lang.playing.format;
		tickerText = tickerText.replace("{artist}", radioplayer.playing.artist);
		tickerText = tickerText.replace("{track}", radioplayer.playing.title);
		return tickerText;
	},


    /**
     * Header Received
     *
     * @event headerReceived
     * @param type
     * @param event {object}
     */
	headerReceived : function(type, event) {
		radioplayer.utils.output('header received');
		if (radioplayer.consts.consolelog) console.dir(event);
	}
};
/**
 * @name mystations
 * @description All handling of the My Stations overlay
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
 * @author Gav Richards <gav@gmedia.co.uk>
 *
 * This file calls:
 * @ services
 * @ overlay
 *
 * This file is called by:
 * @ overlay
 *
 * @class mystations
 * @module mystations
 */
 
radioplayer.mystations = {

	received : false,
	gotStnList : false,
	
	maxStations : 15,
    menuBtnNotificationTimeout: null,
    menuBtnNotificationTimeoutSub: null,

	
	/**
	 * Initialize
     *
     * @method init
	 */
	init : function() {
		
		/**
		 * Events to pick up when My Stations cookie and Station List are received
		 */		
		 
		$(radioplayer.services).on('gotMyStationsAndHistory', function(){
			radioplayer.mystations.received = true;
			if (radioplayer.mystations.gotStnList) {
				radioplayer.mystations.initPopulate();
			}
		});
		
		$(radioplayer.services).on('stationListSet', function(){
			radioplayer.mystations.gotStnList = true;
			if (radioplayer.mystations.received) {
				radioplayer.mystations.initPopulate();
			}
		});
		
		/**
		 * Preload heart sprite
		 */
		 
		// var img = new Image();
		// img.src = radioplayer.consts.assetBaseUrl + "img/heart-sprite.png";
		
	},


	/**
	 * This is called when we get both my stations and the station list
	 * Useful for when we've already opened the menu/my stations, but don't yet have the content we need
	 * so we initiate late
     *
     * @method initPopulate
 	 */
	initPopulate : function() {
		
		// If we've already opened the My Stations tab it will be empty, but we can now load in the stations
		radioplayer.utils.output('checking if my stations is already loaded');
		if ($('#mystations-container').hasClass('loaded')) {
			radioplayer.utils.output('loading in my stations late!');
			radioplayer.mystations.populateList(radioplayer.settings.presets, 'mystations');
		}
		
		
		// If we've already opened the History tab it will be empty, but we can now load in the stations
		if ($('#history-container').hasClass('loaded')) {
			radioplayer.mystations.populateList(radioplayer.settings.history, 'history');
		}
			
	},

    /**
     * Populate my stations and history list
     *
     * @method populateList
     * @param {object} obj Object containing radioplayer IDs
     * @param {string} type e.g. 'mystations'
     */
	populateList : function(obj, type) {
		
		if (obj.length == 0) {
			// This object has no items, so display an appropriate message
			
			if (type == 'mystations') {
				// We don't have a message for the history tab, but it shouldn't ever need one anyway
				$('#' + type + '-container').addClass('has-no-items').html('<div class="no-overlay-items">' + radioplayer.lang.mystations.no_items + '</div>');
			}
				
		} else {
		
			var newObj = [];
			
			$.each(obj, function(i, val){
				
				if (radioplayer.stnList[val]) {
				
					var stationListData = radioplayer.stnList[val];
				
					newObj.push({
						rpId: val,
						serviceName: '', //stationListData.name,
						consoleUrl: stationListData.playerUrl,
						imageUrl: '' //stationListData.logoUrl
					});
				
				} else {
					radioplayer.utils.output('Cant add station ' + val + ' to mystns list, not found in station list');	
				}
			});
			
			var html = '<h2 class="access">' + (type == 'mystations' ? radioplayer.lang.menu_tabs.tab_1_text : radioplayer.lang.menu_tabs.tab_2_text) + '</h2>' + 
					   radioplayer.overlay.iterateResults(newObj, type);
	
			$('#' + type + '-container').html(html);
			
			radioplayer.overlay.lazyLoad($('#' + type + '-container'));
		
		}
		
	},
	

	/**
	 * Add a station to My Stations
     *
     * @method add
     *
	 * @param rpId {integer} ID of the station to add
     * @param containerId {string} ID of the div which is the parent of the overlay-item we are adding
     */
	add : function(rpId, containerId, $contObj) {
		
		rpId = rpId.toString();

    radioplayer.services.analytics.sendEvent('Navigation', 'Add to Favourites', rpId, null, null);

		var oldListLength = radioplayer.settings.presets.length;

		if (radioplayer.settings.presets.length == radioplayer.mystations.maxStations) {
			// Is array already full? Remove last one
			
			var removedId = radioplayer.settings.presets.pop();
			
			// If My Stations list is populated, remove from DOM too
			if ($('#mystations-container').hasClass('loaded')) {
				$('#mystations-container .overlay-item[data-stationid="' + removedId + '"]').remove();
			}
			
			// Update state of all overlay-item's with this rpId
			radioplayer.objs.overlayContainer.find('.overlay-item[data-stationid="' + removedId + '"]')
											 .removeClass('in-mystations')
											 .find('.toggle-mystations button').attr('title', radioplayer.lang.mystations.add_this)
											 .find('.accessibility-text').html(radioplayer.lang.mystations.add_this);
			
			// Update head toggle My Stations icon, if this is current station
			if (removedId == currentStationID) {
				$('#toggle-mystations').removeClass('in-mystations')
									   .attr('title', radioplayer.lang.mystations.add_this)
									   .find('.accessibility-text').html(radioplayer.lang.mystations.add_this);
                if (radioplayer.mystations.menuBtnNotificationTimeout) {
                    clearTimeout(radioplayer.mystations.menuBtnNotificationTimeout);
                    $('.menu-btn-notification').removeClass('menu-btn-notification--active');
                }
                if (radioplayer.mystations.menuBtnNotificationTimeoutSub) {
                    clearTimeout(radioplayer.mystations.menuBtnNotificationTimeoutSub);
                }
			}
			
		}
		
		// Add to start of array
		radioplayer.settings.presets.unshift(rpId);
		
		// If we click the add button in the head/controls
		// AND the station is in My Stations but unselected
		// We don't want to add it again
		if (containerId == 'head-controls' && $('#mystations-container .overlay-item[data-stationid="' + rpId + '"]:not(.in-mystations)').length > 0) {
			radioplayer.utils.output('dont add it again');
		
		} else if ($('#mystations-container').hasClass('loaded') && containerId !== 'mystations-container') {
			// If My Stations list is populated AND we haven't clicked on a station in it, add to DOM too
		
			var stationListData = radioplayer.stnList[rpId];
			
			var newObj = [{
				rpId: rpId,
				serviceName: stationListData.name,
				consoleUrl: stationListData.playerUrl,
				imageUrl: stationListData.logoUrl
			}];
			
			var html = radioplayer.overlay.iterateResults(newObj, 'mystations');
	
			if (oldListLength == 0) {
				// Remove the 'no items' placeholder first
				$('#mystations-container').removeClass('has-no-items').html('');
			}
	
			$('#mystations-container').prepend(html);
			
			radioplayer.overlay.lazyLoad($('#mystations-container'));
			
		}
			
		// Update state of all overlay-item's with this rpId
		radioplayer.objs.overlayContainer.find('.overlay-item[data-stationid="' + rpId + '"]')
										.addClass('in-mystations')
										.find('.toggle-mystations button').attr('title', radioplayer.lang.mystations.remove_this)
										.find('.accessibility-text').html(radioplayer.lang.mystations.remove_this);

		// Animate the head control heart, using a PNG sprite like a film reel, as we can't do smooth GIF animation on a varying background

		if ($contObj) {
			// This is a list item heart
			
			// Create an instances of heartAnimation - this class has its own properties and timer
			var myHeart = new radioplayer.mystations.heartAnimation( $contObj.find('button'), false );

			// Update head control heart, if this is current station
			if (rpId == currentStationID) {
				$('#toggle-mystations').addClass('in-mystations')
									   .attr('title', radioplayer.lang.mystations.remove_this)
									   .find('.accessibility-text').html(radioplayer.lang.mystations.remove_this);
			}
			
		} else if (containerId == 'head-controls') {
			// This is the head control heart
			
			// Create an instances of heartAnimation - this class has its own properties and timer
			var myHeart = new radioplayer.mystations.heartAnimation( $('#toggle-mystations'), true );
		}
		
		// Set cookie with updated list of my stations
		radioplayer.services.saveMyStationsOrder();
		
	},
	
	
	/**
	 * Remove a station from My Stations
     *
     * @method remove
     *
	 * @param rpId {integer} ID of the station to remove
     * @param containerId {string} ID of the div which is the parent of the overlay-item we are removing
     */
	remove : function(rpId, containerId, $contObj) {
		
		rpId = rpId.toString();
		
		// Remove from array
		radioplayer.settings.presets = jQuery.grep(radioplayer.settings.presets, function(value) {
			return value != rpId;
		});

		radioplayer.services.analytics.sendEvent('Navigation', 'Remove from Favourites', rpId, null, null);
		
		// If My Stations list is populated AND we haven't clicked on a station in it, remove from DOM too
		// We want to leave stations in My Stations if we remove them there, until we leave that view
		if ($('#mystations-container').hasClass('loaded') && (containerId !== 'mystations-container' && !($('#mystations-container').hasClass('showing') && $('body').hasClass('showing-menu')))) {
			$('#mystations-container .overlay-item[data-stationid="' + rpId + '"]').remove();
			
			if (radioplayer.settings.presets.length == 0) {
				// We've removed the last of the stations, so display the 'no items' message
				$('#mystations-container').addClass('has-no-items').html('<div class="no-overlay-items">' + radioplayer.lang.mystations.no_items + '</div>');
			}
		}
			
		// Update state of all overlay-item's with this rpId
		radioplayer.objs.overlayContainer.find('.overlay-item[data-stationid="' + rpId + '"]')
										 .removeClass('in-mystations')
										 .find('.toggle-mystations button').attr('title', radioplayer.lang.mystations.add_this)
										 .find('.accessibility-text').html(radioplayer.lang.mystations.add_this);
		
		// Update head toggle My Stations icon, if this is current station
		if (rpId == currentStationID) {
			$('#toggle-mystations').removeClass('in-mystations')
								   .attr('title', radioplayer.lang.mystations.add_this)
								   .find('.accessibility-text').html(radioplayer.lang.mystations.add_this);
            if (radioplayer.mystations.menuBtnNotificationTimeout) {
                clearTimeout(radioplayer.mystations.menuBtnNotificationTimeout);
                $('.menu-btn-notification').removeClass('menu-btn-notification--active');
            }
            
            if (radioplayer.mystations.menuBtnNotificationTimeoutSub) {
                clearTimeout(radioplayer.mystations.menuBtnNotificationTimeoutSub);
            }
		}
		
		// Set cookie with updated list of My Stations
		radioplayer.services.saveMyStationsOrder();
		
	},
	
	
	/**
	 * Call when hiding the My Stations tab-view. It removes any unselected stations from the DOM.
     *
     * @method purgeRemovedMyStations
     */
	purgeRemovedMyStations : function() {
		
		radioplayer.utils.output('purge my stations');
		$('#mystations-container .overlay-item:not(.in-mystations)').remove();
		
		if (radioplayer.settings.presets.length == 0) {
			// We've removed the last of the stations, so display the 'no items' message
			$('#mystations-container').addClass('has-no-items').html('<div class="no-overlay-items">' + radioplayer.lang.mystations.no_items + '</div>');
		}
		
	},
	
	
	/**
	 * Class to initiate a heart animation
     *
     * @method heartAnimation
	 * 
	 * @param btnObj {object} Button object
	 * @param headHeart {boolean} Animation on head heart?
     */
    heartAnimation: function(btnObj, headHeart) {
        var self = this;

        if (headHeart) {
            $('#toggle-mystations').addClass('in-mystations');

            // If we are not showing the menu, show a heart icon over the menu button
            if (!$('body').hasClass('showing-overlay')) {
            		var timeoutLength = 2000;
            		// IE8 does not benefit from fade out, so lengthen timeout
            		if ($('html').hasClass('ie8')) {
            			timeoutLength = 6000;
            		}
                $('.menu-btn-notification').show();
                $('.menu-btn-notification').addClass('menu-btn-notification--active');
                // Hide the heart icon after a timeout
                radioplayer.mystations.menuBtnNotificationTimeout = setTimeout(function(){
                    $('.menu-btn-notification').removeClass('menu-btn-notification--active');
                }, timeoutLength);
            } 
        }
    }
};/**
 * @name search
 * @description All handling of the Search overlay
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
 *
 * Also contains functionality from Radioplayer V1
 * @author Cathy Bartlett <cathy.bartlett@bbc.co.uk>
 * @author Sergejs Vaskevics <sergejs.vaskevics@ubcmedia.com>
 *
 * This file calls:
 * @ services
 * @ overlay
 *
 * This file is called by:
 * @ services
 * @ overlay
 *
 * @class search
 * @module search
 */
 
radioplayer.search = {
	lastSuggestQ : '',
	q : '',
	
    /**
     * @requestFailTimer
     */
	requestFailTimer : null,
	
    /**
     * @property requestFailed
     * @type Boolean
     * @default false
     */
	requestFailed : false,
	
	suggestQueryDelay : null,
	
	/**
	 * Initialize
     *
     * @method init
	 */
	init : function() {
		
		/**
		 * Store DOM objects
		 */
		radioplayer.objs.searchBox = $('.search-box');
		radioplayer.objs.searchInput = $('#search-input');
		radioplayer.objs.searchContainer = $('.search-container');
		radioplayer.objs.searchResults = $('.search-container .scrollable-wrapper');
		radioplayer.objs.suggestContainer = $('.suggest-container');
		
		radioplayer.objs.searchAllContainer = $('#search-all-cont');
		radioplayer.objs.searchLiveContainer = $('#search-live-cont');
		radioplayer.objs.searchODContainer = $('#search-od-cont');
		
		/**
		 * Set initial textbox
		 */
		
		setTimeout(function(){
			radioplayer.objs.searchInput.val(radioplayer.lang.search.search_radioplayer);
        $('.mirrored-input').html(radioplayer.lang.search.search_radioplayer);
		}, 100);

		/**
		 * Localisation
		 */

		$('.search-box h2').html(radioplayer.lang.search.search);
		$('.search-box #search-button').attr('title', radioplayer.lang.search.search).find('.search-btn-accessible').html(radioplayer.lang.search.search);
		$('.search-box #search-clear').attr('title', radioplayer.lang.search.clear).find('.search-btn-accessible').html(radioplayer.lang.search.clear);
		$('.search-container .tabs ul li').eq(0).find('a span').html(radioplayer.lang.search.tab_all);
		$('.search-container .tabs ul li').eq(1).find('a span').html(radioplayer.lang.search.tab_live);
		$('.search-container .tabs ul li').eq(2).find('a span').html(radioplayer.lang.search.tab_catchup);
		
		
		radioplayer.objs.searchInput.on('focus click', function(){
			/**
			 * Focus or click search input box
			 * Also called because resetSearchInput() calls focus()
			 */
			 
			if (radioplayer.objs.searchInput.val() == radioplayer.lang.search.search_radioplayer 
			 && !radioplayer.objs.searchBox.hasClass('active')) {
				  
				// Focussed on text field when it contains default, and box is not active
				// Set cursor to start
				radioplayer.utils.setCaretToPos(document.getElementById("search-input"), 0);
                radioplayer.objs.searchInput.val('');

			} else if (radioplayer.objs.searchInput.val() != '' 
					&& radioplayer.objs.searchBox.hasClass('active')
				    && radioplayer.objs.suggestContainer.data('results') > 0 
				    && !radioplayer.objs.body.hasClass('showing-overlay')) {
				
				// Search input is not blank, but we're not showing an overlay
				// Show suggest overlay				
				radioplayer.overlay.show(radioplayer.lang.general.close_search);
				radioplayer.objs.body.addClass('showing-suggest');
				
				// Re-execute suggest search, if value has changed since last suggest search
				if (radioplayer.search.lastSuggestQ != radioplayer.objs.searchInput.val()) {
					radioplayer.search.execSuggest();
				}
				
			}
			
			
		}).on('blur', function(){
			/**
			 * Blur search input box
			 */
      if (radioplayer.objs.searchInput.val() == "") {
          radioplayer.objs.searchInput.val(radioplayer.lang.search.search_radioplayer);
      }
			 
			if (radioplayer.objs.searchBox.hasClass('active') 
			 && radioplayer.objs.searchInput.val() == "") {
				// Search input is active but input is blank
				
				if (radioplayer.objs.body.hasClass('showing-suggest')) {
					// Suggest is showing, hide the results (also resets the search input)
					radioplayer.search.clearAndCloseSuggestResults();
					
				} else {
					radioplayer.search.resetSearchInput();
				}
			}
			
			
		}).on('keydown', function(event) {
			/**
			 * Keydown on search input box
			 */

			if(event.which == 13) {
				event.preventDefault();
			}
			
			if (event.which == 9) {
				// pressed tab - allow regular behaviour
			
			} 
			else if (radioplayer.objs.searchInput.val() == '' && !radioplayer.objs.searchBox.hasClass('active')) {
				// Input is default value
				// Only interested in real characters - http://stackoverflow.com/questions/8742790/keydown-only-with-real-characters
				// added 8 backspace, 32 space, 46 delete
				if ($.inArray(event.which, [8,13,16,17,18,19,20,27,32,35,36,37,38,39,40,46,91,93,224]) !== -1) {
					event.preventDefault();					
				} 
				else {
					radioplayer.objs.searchInput.val('').enableSelection();
					radioplayer.objs.searchBox.addClass('active');
					
					if (!radioplayer.objs.body.hasClass('showing-search') && !radioplayer.objs.body.hasClass('showing-suggest')) {
						// We're not already showing search or suggest, so show the suggest overlay
						radioplayer.overlay.show(radioplayer.lang.general.close_search);
						radioplayer.objs.body.addClass('showing-suggest');
					}
				}
				
			// We've closed suggest/search but still have characters in the input
			// Then we click in the input and continue typing. At this point, show suggest again.
			} 
			else if (radioplayer.objs.searchInput.val() !== '' && !radioplayer.objs.body.hasClass('showing-search') && !radioplayer.objs.body.hasClass('showing-suggest')) {
				// We're not already showing search or suggest, so show the suggest overlay
				radioplayer.overlay.show(radioplayer.lang.general.close_search);
				radioplayer.objs.body.addClass('showing-suggest');
			}
				
		}).on('keyup', function(event){
			/**
			 * Keyup on search input box
			 */

			if(event.which == 13) {
				event.preventDefault();
			}
	
			radioplayer.overlay.resetInactivity();
			
			var $sc = radioplayer.objs.suggestContainer; // store ref here to keep code tidy
			
			if (event.which == 38 && radioplayer.objs.body.hasClass('showing-suggest')) {
				// Key up
				
				if ($sc.find(".suggest-item.on").length == 0) {
					$sc.find(".suggest-item:last").addClass("on kb-focus");
				} else {
					var index = $sc.find(".suggest-item").index($sc.find(".suggest-item.on"));
					$sc.find(".suggest-item.on").removeClass("on kb-focus");
					$sc.find(".suggest-item").eq(index-1).addClass("on kb-focus");
				}
				
			} 
			else if (event.which == 40 && radioplayer.objs.body.hasClass('showing-suggest')) {
				// Key down
				
				if ($sc.find(".suggest-item.on").length == 0) {
					$sc.find(".suggest-item:first").addClass("on kb-focus");
				} else if ($sc.find(".suggest-item:last").hasClass("on")) {
					$sc.find(".suggest-item:last").removeClass("on kb-focus");
					$sc.find(".suggest-item:first").addClass("on kb-focus");
				} else {
					var index = $sc.find(".suggest-item").index($sc.find(".suggest-item.on"));
					$sc.find(".suggest-item.on").removeClass("on kb-focus");
					$sc.find(".suggest-item").eq(index+1).addClass("on kb-focus");
				}	
					
			} 
			else if (event.which == 13) {
				// Enter				
				if (radioplayer.objs.body.hasClass('showing-suggest')) {
					// When suggest results are visible
				
					var $selItem = $sc.find(".suggest-item.on.kb-focus");
				
					if ($selItem.length == 1) {
						// If an item is selected using keyboard
						
						if ($selItem.hasClass("show-all")) {
							// User has keyboard navigated down to 'show all' and pressed enter - execute full results
							radioplayer.search.execFull();
						
						} else {
							// User has keyboard navigated down to a result and pressed enter - jump to that console
							var href = $selItem.find("a").attr("href");
							window.location.href = href;
						}
						
					} else {
						radioplayer.search.execFull();
					}
				
				} 
				else if (radioplayer.objs.body.hasClass('showing-search')) {
					// Full search results are visible					
					radioplayer.search.execFull();	
				}
			// Only interested in real characters - http://stackoverflow.com/questions/8742790/keydown-only-with-real-characters
			// added 9 tab
			} 
			else if ($.inArray(event.which, [9,13,16,17,18,19,20,27,35,36,37,38,39,40,91,93,224]) == -1) {
                $('.mirrored-input').html(radioplayer.objs.searchInput.val());

			/*} else if (event.which == 8 // backspace
				   || (event.which >= 32 && event.which <= 127) // most characters including a-z, 0-9, space, punctuation, delete key
			 	   || (event.which >= 192 && event.which <= 255) // latin characters
			 ) {*/
				// Key press
				 
				$('#search-clear').hide();
				$('#search-button').show();
				
				if (radioplayer.objs.body.hasClass('showing-suggest')) {
					// Suggest is showing
					
					$sc.find('.suggest-item.show-all').removeClass('on kb-focus');
					
					if (radioplayer.objs.searchInput.val() === '') {
						// Search box is now blank, hide the results
						radioplayer.search.clearAndCloseSuggestResults();
						
					} else {
						// Search box is not blank, execute a suggest request
						radioplayer.search.execSuggest();
					}

				} else {
					// Suggest is not showing
					
					if (radioplayer.objs.searchInput.val() === '') {
						// Reset the search input box
						radioplayer.search.resetSearchInput();
					}
				}
				
			}
			
			
		/**
		 * Disable selection of the search input box by default
		 */
		}).disableSelection();
		
		
		radioplayer.objs.suggestContainer.on('click touchstart touchend', '.suggest-item.show-all a', function(e){
			/**
			 * Click the 'show all' suggest result to execute a full search
			 */
			
			e.preventDefault();
			e.stopPropagation();

			radioplayer.search.execFull();
			
		}).on('click', '#suggest-results .suggest-item a', function(e) {
			/**
			 * Click a suggest result to go to that console
			 */
			
            e.preventDefault();

            var stationId = $(this).parent().data('rpid');
            var href = $(this).attr('href');

            radioplayer.services.analytics.sendEvent('Search', 'Autosuggest', stationId.toString(), null, null);

            setTimeout(function() {
                window.location.href = href;
            }, 100);
			
		}).on("mouseenter", ".suggest-item", function(){
			/**
			 * Mouse over a suggest result item
			 * Remove 'on' class from any other items, add it to this one
			 */

			radioplayer.objs.suggestContainer.find(".suggest-item").removeClass("on kb-focus");
			$(this).addClass("on");
			
		}).on("mouseleave", ".suggest-item", function(){
			/**
			 * Mouse out a suggest result item
			 */

			$(this).removeClass("on kb-focus");
		});
		

		$("#search-button").on('click', function(e){
			if (radioplayer.objs.searchInput.val() && radioplayer.objs.searchInput.val() !== radioplayer.lang.search.search_radioplayer) {
				radioplayer.search.execFull();
			}
		});

		$("#search-clear").on('click', function(e){
			/**
			 * Click the cross icon to clear the search box
			 */
			 
			radioplayer.search.resetSearchInput();
			
		});
		
		
		/**
		 * Toggle Station Groups
		 */
		
		$('#search-all-cont, #search-live-cont, #search-od-cont').on("click", ".station-group a.station-group-toggle", function(e){
			
			e.preventDefault();
			
			// Is group currently collapsed?
			var $groupBtn = $(this),
				$group = $groupBtn.parent().parent(),
				brand = $group.attr("data-brand");
			
			if ($group.hasClass("collapsed")) {
				// Show the station group
				$group.removeClass("collapsed");
				var fewerMsg = radioplayer.lang.search.show_fewer_stations;
				fewerMsg = fewerMsg.replace("{group}", brand);
				$groupBtn.html('<i></i>' + fewerMsg);
				
				$parentContainer = $group.parent();
				
				radioplayer.overlay.lazyLoad($parentContainer);
				
			} else {
				// Hide the station group
				$group.addClass("collapsed");
				var moreMsg = radioplayer.lang.search.show_more_stations;
				moreMsg = moreMsg.replace("{group}", brand);
				$groupBtn.html('<i></i>' + moreMsg);
			}
		});
		
	},
	
	
	/**
	 * Execute a suggest search
     *
     * @method execSuggest
	 */
	execSuggest: function() {
		
		// Get value and trim
		var q = $.trim( radioplayer.objs.searchInput.val() );
		
		// Remove tags
			regex = /(<([^>]+)>)/ig,
			q = q.replace(regex, "");
	
		var show_all_msg = radioplayer.lang.search.show_all_results_for.replace("{terms}", '<strong>' + q + '</strong>');
	
		$('.suggest-item.show-all a').html(show_all_msg);
	
		clearTimeout(radioplayer.search.suggestQueryDelay);
		radioplayer.search.suggestQueryDelay = setTimeout(function(){
	
			// Don't search for blank, or same as previous query
			if (q != "" && q != radioplayer.search.lastSuggestQ) {
				
				radioplayer.search.lastSuggestQ = q;
			
				radioplayer.services.getAPI(radioplayer.consts.api.suggest +
					"?query=" + encodeURIComponent(q) +
					"&callback=radioplayer.search.receiveSuggest" +
					"&lang=" + langCode);
			}
			
		}, 150);
		
	},

    /**
     * Called when receiving suggest results data
     *
     * @method receiveSuggest
     * @param data
     * @private
     */
	receiveSuggest: function(data) {
		
		var insHTML = '<h2 class="access">' + radioplayer.lang.search.suggested_title + '</h2>';
		var results = 0;
		
		if (data.live.length > 0) {
			
			insHTML += '<div class="suggest-divider">' + radioplayer.lang.search.suggested_stations + '</div>';
			
			$.each(data.live, function(index, resVal){
				
				insHTML += '<div class="suggest-item' + (resVal.name ? ' has-prog-name' : '') + '" data-rpid="'+ resVal.rpId +'"><a href="' + resVal.url + '">' +
							  '<img class="image" src="' + resVal.imageUrl + '" alt="" /><span class="name">' + resVal.serviceName + '</span>' + (resVal.name ? '<span class="prog-name">' + resVal.name + '</span>' : '') + 
						   '</a></div>';
						   
				results++;
				
			});
			
		}
		
		if (data.onDemand.length > 0) {
			
			insHTML += '<div class="suggest-divider">' + radioplayer.lang.search.suggested_catch_up + '</div>';
			
			$.each(data.onDemand, function(index, resVal){
				
				insHTML += '<div class="suggest-item has-prog-name" data-rpid="'+ resVal.rpId +'"><a href="' + resVal.url + '">' +
							  '<img class="image" src="' + resVal.imageUrl + '" alt="" /><span class="name">' + resVal.serviceName + '</span><span class="prog-name">' + resVal.name + '</span>' +
						   '</a></div>';
						   
				results++;
				
			});
			
		}
		
		radioplayer.objs.suggestContainer.data('results', results);
		
		$('#suggest-results').html(insHTML);
		
	},
	
	
	/**
	 * Clear the search box, return to default state
     *
     * @method resetSearchInput
	 */
	resetSearchInput : function() {
		
		$('#search-clear').hide();
		$('#search-button').show();
		
		// Remove active class before giving focus back to search input, so we can detect it is no longer active
		radioplayer.objs.searchBox.removeClass('active');
		radioplayer.objs.searchInput.val(radioplayer.lang.search.search_radioplayer).disableSelection().focus();
        $('.mirrored-input').html(radioplayer.lang.search.search_radioplayer);

		radioplayer.utils.setCaretToPos(document.getElementById("search-input"), 0);
		
	},
	
	
	/**
	 * Clear the search box, return to default state
     *
     * @method clearAndCloseSuggestResults
	 */
	clearAndCloseSuggestResults : function() {	
		$('#suggest-results').html('');
		$('.suggest-item.show-all a').html('');
		
		radioplayer.search.lastSuggestQ = '';
	
		radioplayer.overlay.hide();

		// Reset the search input box
		radioplayer.search.resetSearchInput();
	},
	
	
	/**
	 * Execute a full search
     *
     * @method execFull
	 */
	execFull : function() {
		// Get value and trim
		var q = $.trim( radioplayer.objs.searchInput.val() ), 

		// Remove tags
			regex = /(<([^>]+)>)/ig,
			q = q.replace(regex, "");

		// Don't search for blank or the default text
		if (q != "") {
		
			if (radioplayer.objs.body.hasClass('showing-search')) {
				// Don't close the search overlay if it's already showing
			} else {
				//radioplayer.overlay.show(radioplayer.lang.general.close_search);
				radioplayer.objs.body.addClass('showing-search');
			}
			
			// Unbind actions
			radioplayer.objs.searchContainer.off();
			
			// Clear existing results
			radioplayer.objs.searchContainer.find('.tab-container').html('').removeClass('loaded has-error');
			
			// Reset tabs
			$prevSelTab = $('.search-container .tabs li.on');
			$prevSelTab.removeClass('on');
			radioplayer.overlay.selectTab(radioplayer.objs.searchContainer.find('.tabs li').eq(0));
			
			// Show loading indicator
			radioplayer.search.showTabSpinner();
			
			// Give focus back to textbox, if not iOS
			if(!radioplayer.consts.is_iOS) {
				radioplayer.objs.searchInput.focus();
			}
			
			// Show cross instead of magnify button
			$('#search-button').hide();
			$('#search-clear').show();
			
			// Set up fail safe
			radioplayer.search.requestFailed = false;
			radioplayer.search.requestFailTimer = setTimeout(function() { radioplayer.search.showFailMsg('all'); }, 15000);
			
			// Build search query string
			var QS = "?query=" + encodeURIComponent(q) + 
					 "&descriptionSize=70" + 
					 "&rpId=" + currentStationID + 
					 "&callback=radioplayer.search.receiveall" +
					 "&lang=" + langCode;
			
			if (radioplayer.settings.guid != '') {
				// Get GUID
				QS += "&guid=" + radioplayer.settings.guid;	
			}
			
			// Perform search query
			radioplayer.services.getAPI(radioplayer.consts.api.search + QS);
			
			// Store query for later
			radioplayer.search.q = q;
		
		} else {
			if(!radioplayer.consts.is_iOS) { // Give the focus to the search box.
				radioplayer.objs.searchInput.focus();
			}
		}
		
	},
	
	
	/**
	 * Click Live or OD tab - request the data for that tab
     *
     * @method tabRequest
	 * @param tab {String} either 'live' or 'od'
	 */
	tabRequest : function(tab) {
		this.showTabSpinner();
		
		// Set up fail safe
		radioplayer.search.requestFailed = false;
		radioplayer.search.requestFailTimer = setTimeout(function() { radioplayer.search.showFailMsg(tab); }, 15000);
		
		var QS = "?query=" + encodeURIComponent(radioplayer.search.q) + 
				 "&descriptionSize=70" + 
				 "&rpId=" + currentStationID + 
				 "&callback=radioplayer.search.receive" + tab +
				 "&lang=" + langCode;
		
		if (radioplayer.settings.guid != '') {
			// Get GUID
			QS += "&guid=" + radioplayer.settings.guid;	
		}
		
		radioplayer.services.getAPI(radioplayer.consts.api.search + "/" + tab + QS);
	},

    /**
     * @method receiveall
     * @param data
     * @private
     */
	receiveall : function(data) {
		this.receiveParse('all', data);
	},

    /**
     * @method receivelive
     * @param data
     * @private
     */
	receivelive : function(data) {
		this.receiveParse('live', data);
	},

    /**
     * @method receiveod
     * @param data
     */
	receiveod : function(data) {
		this.receiveParse('od', data);
	},

    /**
     * @method showTabSpinner
     */
	showTabSpinner : function() {
		radioplayer.objs.searchContainer.find('.tabs-wrapper .spinner').show();
	},

    /**
     * @method hideTabSpinner
     */
	hideTabSpinner : function() {
		radioplayer.objs.searchContainer.find('.tabs-wrapper .spinner').hide();
	},

	/**
	 * Receive search results
     *
     * @method receiveParse
     * @param data {Object} Search result data
	 */
	receiveParse : function(tab, data){
		
		clearTimeout(this.requestFailTimer);
		
		if (!this.requestFailed) {
			// If the request has already failed (and now we've received the results after the timeout period) then DON'T show them now
		
			if (data.responseStatus == 'SUCCESS') {
				
				var resultsHtml = '<h2 class="access">' + radioplayer.lang.search["tab_" + tab + "_title"] + '</h2>';
					
				if (data.total == 0) {
					// No results
					
					// Escape HTML and truncate string
					resultsHtml = this.noResultsMsg(tab, radioplayer.search.q);
					
					$('#search-' + tab + '-cont').addClass('has-error');
					
				} else {
					// We have results
				
					// Iterate over search result items, build HTML
					// We use the shared iterateResults() function
					resultsHtml += radioplayer.overlay.iterateResults(data.results, 'search');

				} // end - we have results
				
				// Hide loading indicator
				this.hideTabSpinner();
				
				// Show search results
				$('#search-' + tab + '-cont').html(resultsHtml);
				
				// Scroll to the top
				$('#search-' + tab + '-cont').scrollTop(0);
				
				radioplayer.overlay.lazyLoad($('#search-' + tab + '-cont'));

			} else { // responseStatus is not 'SUCCESS'
				// Show fail message
				this.showFailMsg(tab);
			}
		}

	},
	
	
	/**
	 * No Results Message
     *
     * @method noResultsMsg
	 * @param tab {String} all, live or od
     * @param searchString {String}
     * @return {String} Localised no results message
	 */
	noResultsMsg : function(tab, searchString) {
		// Replace {terms} in the message with the search terms
		
		if (tab == 'live') {
			var no_results_msg = radioplayer.lang.search.no_live_results;	
		} else if (tab == 'od') {
			var no_results_msg = radioplayer.lang.search.no_od_results;	
		} else {
			var no_results_msg = radioplayer.lang.search.no_all_results;	
		}
		
		no_results_msg = '<div class="error-message no-results">' + no_results_msg.replace("{terms}", searchString) + '</div>';

        radioplayer.services.analytics.sendEvent('Search', 'Zero Results', searchString, null, null); // Send Analytics for no results

		return no_results_msg;
	},
	
	
	/**
	 * Fail Message
     *
     * @method showFailMsg
	 */
	showFailMsg : function(tab) {
		this.requestFailed = true;
		
		// Hide loading indicator
		this.hideTabSpinner();
		
		// Populate overlay
		var fail_message = '<div class="error-message fail">' + radioplayer.lang.general.fail_message + '</div>';
		
		$('#search-' + tab + '-cont').addClass('has-error')
									 .html(fail_message);
		
        radioplayer.services.analytics.sendEvent('Errors', 'Failed Search', currentStationID, null, null); // Send Analytics for failed search
	}
};
// Ad Blocker will block this file if it is turned on.
// We can detect for this var in our index to manually override 
// vast ads and adswizz if this is the case
var canRunAds = true;/**
 * @name adswizz
 * @description All handling of AdsWizz personalised advertising functionality
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
 * @author Andy Buckingham <andy.buckingham@togglebit.co.uk>
 * @author Frank Sattler <frank@invantio.com>
 *
 * @class adswizz
 * @module adswizz
 */
var com_adswizz_synchro_decorateUrl = false;
radioplayer.adswizz = {
	DEBUG: false,
	overlayTimeout: null,
    enabled: false,
    playerId: 'UKRP',
	adswizzDomain: '',
	prerollZoneId: 0,
	midrollZoneId: 0,
	adswizzCookie: {
		name: 'adswizz_oaid',
		path: '/',
		secure: false
	},

	/**
	 * Initialisation for AdsWizz support.
	 *
	 * @method init
	 */
  init: function() {
        this.enabled = adsWizz.enabled || false;
        if (!this.enabled) {
            return;
        }

		if (this.DEBUG) radioplayer.utils.output('[adswizz] Initialising adswizz.');

		this.playerId = adsWizz.playerId || 'UKRP';
		this.adswizzDomain = adsWizz.domain || 'demo';
		this.prerollZoneId = adsWizz.prerollZoneId || 0;
		this.midrollZoneId = adsWizz.midrollZoneId || 0;

		if (this.DEBUG) {
            radioplayer.utils.output('[adswizz] playerId: ' + this.playerId + '\n          domain: ' + this.adswizzDomain + '\n          preroll zone Id: ' + this.prerollZoneId + '\n          midroll zone Id: ' + this.midrollZoneId);
        }

		if (!this.decorateAllStreamUrls()) {
			this.enabled = false;
		}

		if (this.DEBUG) {
            radioplayer.utils.output('[adswizz] AdsWizz ' + (this.enabled ? 'enabled.' : 'disabled.'));
        }
  },


	/**
	 * Decorates all stream URLs
	 *
	 * @method decorateAllStreamUrls
	 * @returns		{Boolean}			true if at least one stream was decorated successfully, false if not.
	 */
	decorateAllStreamUrls: function() {
		var lastStreamDecorated = -1;
		var result = false;

		if (!com_adswizz_synchro_decorateUrl) {
			return false;
		}

        for (var i = 0; i < audioArray.length; i++) {
            try {
                audioArray[i].audioUrl = this.decorateStreamUrl(audioArray[i].audioUrl);
                lastStreamDecorated = i;

                if (this.DEBUG) {
                    radioplayer.utils.output('[adswizz] Decorated stream: ' + audioArray[i].audioUrl);
                }
            } 
            catch(decorateStreamURLException) {
                radioplayer.utils.output('[adswizz] Stream decoration failed: ' + decorateStreamURLException.message);
            }
        }

        if (-1 === lastStreamDecorated) {
         // no stream URLs have been successfully decorated
            result = false;
            radioplayer.utils.output('[adswizz] All streams failed to decorate.');
        } 
        else {
         // at least one stream URL has been successfully decorated
            result = true;
            if (this.DEBUG) {
                radioplayer.utils.output('[adswizz] Stream(s) decorated. ListenerId: ' + this.getListenerId());
            }
        }

		return result;
	},

	/**
	 * Decorates a stream URL using the AdsWizz API.
	 *
	 * @method decorateStreamUrl
	 * @param			{String}		url													Un-decorated stream URL
	 * @throws		{Exception}	decorateStreamURLException	Exception thrown when AdsWizz API call fails.
	 * @returns		{String}		Returns decorated URL
	 */
    decorateStreamUrl: function(url) {
		var amsParams = encodeURIComponent('amsparams=playerid:' + this.playerId + ';skey:' + String(parseInt(new Date().getTime() / 1000)) );
		url += (url.indexOf('?') > 0 ? '&' : '?') + amsParams;

        try {
			url = com_adswizz_synchro_decorateUrl(url);
        } catch(e) {
            radioplayer.utils.output('[adswizz] Could not decorate stream ' + url + '\n          Error [' + e.name + ']: ' + e.message);
            var ex = new radioplayer.exceptions.decorateStreamURLException();
            ex.message = 'Could not decorate stream URL (' + url + ').';
            throw ex;
        }
        return url;
    },


	/**
	 * Persists an AdsWizz listener id in a cookie.
	 *
	 * @method setListenerId
	 * @param			{String}	listenerId		A unique listenerId
	 */
  setListenerId: function(listenerId) {
		var expiryDate = new Date(2030, 31, 11, 0, 0, 0, 0).toUTCString();
		radioplayer.utils.setLocalCookie(	this.adswizzCookie.name, listenerId, expiryDate, this.adswizzCookie.path, this.adswizzCookie.domain, this.adswizzCookie.secure);

		if (this.DEBUG) {
            radioplayer.utils.output('[adswizz] Persisted listenerId: ' + listenerId);
        }
  },


	/**
	 * Retrieves an AdsWizz listener id from a cookie. If no cookie exists, a listener id is generated and persisted.
	 *
	 * @method getListenerId
	 * @return		{String}	Unique AdsWizz listener id
	 */
  getListenerId: function() {
    var listenerId = radioplayer.utils.getLocalCookie(this.adswizzCookie.name);

    if ('' === listenerId) {
      listenerId = this.generateListenerId();
			this.setListenerId(listenerId);
		}

		if (this.DEBUG) radioplayer.utils.output('[adswizz] Retrieved listenerId: ' + listenerId);

    return listenerId;
  },


	/**
	 * Generates an AdsWizz listerner id first through an AdsWizz API call. In case of failure, a
	 * pseudo-random value is generated and used instead. (according to "AdsWizz Integration v2.4").
	 *
	 * @method getListenerId
	 * @return		{String}	Unique AdsWizz listener id
	 */
  generateListenerId: function() {
    var listenerId = com_adswizz_synchro_listenerid;
    if ((listenerId === null) || (typeof listenerId === 'undefined')) {
      listenerId = new Date().getTime() + '_' + Math.random();
    }

		if (this.DEBUG) radioplayer.utils.output('[adswizz] Generated new listenerId: ' + listenerId);

    return listenerId;
  },


	/**
	 * Parses the AdsWizz metadata and displays an overlay ad.
	 * @method parseMetadata
	 * @param obj			{Object}	jQuery event object
	 * @param event		{Event}		Captured event containing AdsWizz metadata in the payload
	 */
  parseMetadata: function (x, event) {
		if ((radioplayer.adswizz.enabled) && (event.type == 'metadata')) {

			var data = event.data;

			// if the metadata comes from AdsWizz
			if (	('undefined' !== (typeof data.durationMilliseconds)) &&
						('undefined' !== (typeof data.insertionType)) &&
						('undefined' !== (typeof data.metadata))) {

				if (radioplayer.adswizz.DEBUG) radioplayer.utils.output('[adswizz] Adswizz metadata received. Data:');
				 if (radioplayer.adswizz.DEBUG) radioplayer.utils.output(data);

				if (data.metadata.indexOf('adswizzContext=') !== -1) {
					// clear old overlay timeout
					if (radioplayer.adswizz.overlayTimeout !== null) {
						clearTimeout(radioplayer.adswizz.overlayTimeout);
					}

					var duration = parseInt(data.durationMilliseconds);

					var id = data.metadata.replace('adswizzContext=', '');
					if (!id) {
						if (radioplayer.adswizz.DEBUG) radioplayer.utils.output('[adswizz] Did not receive AdsWizz Context within metadata.');
						return; // no context
					}
					if (radioplayer.adswizz.DEBUG) radioplayer.utils.output('[adswizz] AdsWizz Context: ', id);
					var zoneId = 'zoneid=';
					if ('midroll' === data.insertionType) {
						zoneId += radioplayer.adswizz.midrollZoneId;
					} else {
						zoneId += radioplayer.adswizz.prerollZoneId;
					}
					var cacheBuster = 'cb=' + String(new Date().getTime());
					var url = '//' + radioplayer.adswizz.adswizzDomain + '.adswizz.com/www/delivery/afr.php?' + zoneId + '&playerid=' + radioplayer.adswizz.playerId + '&context=' + id + '&' + cacheBuster;

					if (radioplayer.adswizz.DEBUG) radioplayer.utils.output('[adswizz] Showing companion ad in overlay. Resource URL: ' + url);
					
					// SHOW THIS AD IN AN OVERLAY
					radioplayer.services.overlay.adswizz(url, duration);

					if (radioplayer.adswizz.DEBUG) radioplayer.utils.output('[adswizz] AdsWizz Duration: ' + (duration / 1000) + 'sec');
				}
			}
		}
	}
};

$(radioplayer.emp).on('metadata', radioplayer.adswizz.parseMetadata);
/**
 * @name controls
 * @description Initialization of EMP and controls
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
 * @author Robin Wilding <robin@wilding.co.uk>
 *
 * @class controls
 * @module controls
 */


radioplayer.controls = {
		/**
		 * @property rawDuration
		 * @type Int
	 * @default 0
		 */
	rawDuration:0,
		/**
		 * @property duration
		 * @type String
		 */
	duration:"00:00",
		/**
		 * If the stream is currently muted
	 *
		 * @property muted
		 * @type Boolean
	 * @default false
		 */
	muted:false,
		/**
		 * @property currentVolume
		 * @type Int
	 * @default 100
		 */
	currentVolume:100,
		/**
		 * Used to store the volume when muting, so unmuting can restore to the previous volume
	 *
		 * @property savedVolume
		 * @type Int
		 * @default 0
		 */
	savedVolume:0,
		/**
		 * This current position of a OD clip, in seconds.
	 *
		 * @property currentPosition
		 * @type Int
	 * @default 0
		 */
		currentPosition: 0,
		/**
		 * If the volume control is currently locked because a commercial overlay is visible
	 *
		 * @property volumeLocked
		 * @type Boolean
	 * @default false
		 */
	volumeLocked:false,
		/**
		 * @property volumeScrubHeight
		 * @type Int
		 * @default 80
		 */
	volumeScrubHeight:44,
		/**
		 * @property progressScrubWidth
		 * @type Int
		 * @default 305
		 */
	progressScrubWidth:262,
		/**
		 * @property volumeScrubOffsetY
		 * @type Int
		 * @default 5
		 */
	volumeScrubOffsetY:5,
		/**
		 * @property dragging
		 * @type Boolean
	 * @default false
		 */
	dragging:false,
		/**
		 * @property isAllLoaded
		 * @type Boolean
	 * @default false
		 */
	isAllLoaded:false,
		/**
		 * @property isLoading
		 * @type Boolean
	 * @default false
		 */
	isLoading:false,
		/**
		 * Boolean to show whether the accessibility buttons have been inserted into the DOM yet.
		 *
		 * @property insertedODButtons
		 * @default false
		 * @type Boolean
	 * @default false
		 */
		insertedODButtons: false,
		/**
		 *
		 * Whether or not the stream is playing
		 *
		 * @property isPlaying
		 * @type Boolean
	 * @default false
		 */
		isPlaying: false,
		/**
		 * Whether the user changed the play state, or if it was sent from the EMP
		 *
		 * @property userClickedControls
	 * @type Boolean
	 * @default false
		 */
		userClickedControls: false,
		/**
		 * Whether the user clicked on paused
		 *
		 * @property userPaused
	 * @type Boolean
	 * @default false
		 */
		userPaused: false,
		/**
		 * Whether or not the user can actually hear the stream
		 *
		 * @propery isListening
		 * @type Boolean
	 * @default false
		 */
		isListening: false,
		/**
		 * @property mouseOverProgress
		 * @type Boolean
	 * @default false
		 */
	mouseOverProgress:false,
		/**
		 * @property volControlLeft
		 * @type Int
	 * @default 0
		 */
	volControlLeft: 0,
		/**
		 * @property volControlWidth
		 * @type Int
	 * @default 0
		 */
	volControlWidth: 0,
		/**
		 * @property muteThres
		 * @type Int
	 * @default 15
		 */
	muteThres: 15,
		/**
		 * @property topEndThres
		 * @type Int
	 * @default 6
		 */
	topEndThres: 6,
		/**
		 * @property volWavesWidth
		 * @type Int
	 * @default 0
		 */
	volWavesWidth: 0,
		/**
		 * @property mouseDownOnVolume
		 * @type Int
	 * @default 0
		 */
	volumeHover: 0,
		/**
		 * @property mouseDownOnVolume
		 * @type Boolean
	 * @default false
		 */
	mouseDownOnVolume: false,
		/**
		 * @property pressPlayPromptShowing
		 * @type Boolean
	 * @default false
		 */
	pressPlayPromptShowing : false,
		/**
		 * @property streamHasStarted
		 * @type Boolean
	 * @default false
		 */
	streamHasStarted: false,
		/**
		 * @property noSupportShowing
		 * @type Boolean
	 * @default false
		 */
	noSupportShowing: false,

	/**
	 * Show the 'press play' prompt
		 *
		 * @method showPressPlayPrompt
		 */
	showPressPlayPrompt : function() {
		if (!radioplayer.controls.pressPlayPromptShowing) {
			if (radioplayer.consts.is_Android || radioplayer.consts.is_iOS) {
				$('#volume-control').addClass('disabled');
			}
			
			$('#live-strip').removeClass('loading');
			$('#live-strip').addClass('live-play-prompt');

			var $pressPlayPrompt = $(".icon-play");

			$(".icon-play").addClass("play-prompt");
			radioplayer.controls.pressPlayPromptShowing = true;

			$pressPlayPrompt.on('click', function(){
				radioplayer.controls.hidePressPlayPrompt();
			});

			this.hideLoader();

			// When the stream starts playing, hide the prompt
			$(radioplayer.emp).on('startPlaying.hidePlayPrompt', function(){
				radioplayer.controls.hidePressPlayPrompt();
				$(radioplayer.emp).off('startPlaying.hidePlayPrompt');
			});
		}
	},


	/**
	 * Hide the 'press play' prompt
		 *
		 * @method hidePressPlayPrompt
		 */
	hidePressPlayPrompt : function() {
		if (radioplayer.controls.pressPlayPromptShowing) {
			radioplayer.controls.pressPlayPromptShowing = false;
			$(".icon-play").removeClass("play-prompt");
			$("#live-strip").removeClass("live-play-prompt");
		}
	},


	/**
	 * Format milliseconds into hours:minutes:seconds for displaying progress/duration
		 *
		 * @method formatPosition
		 * @param position {int} Position in Milliseconds
		 * @returns {String} Position as human readable string
		 */
	formatPosition : function(position) {
		if (position < 0) {
			position = 0;
		}

		var seconds = Math.floor((position / 1000) % 60) ;
		var minutes = Math.floor(((position / (1000*60)) % 60));
		var hours   = Math.floor(((position / (1000*60*60)) % 24));

		//if(String(hours).length < 2) hours = '0'+hours;
		if(String(minutes).length < 2) minutes = '0'+minutes;
		if(String(seconds).length < 2) seconds = '0'+seconds;
		return hours + ":" + minutes + ":" + seconds;
	},


	/**
	 * Clean up controls variables - should be called if for resetting the stream in place.
		 *
		 * @method cleanup
		 * @deprecated
	 */
	cleanup : function() {
		this.isAllLoaded = false;
		this.isLoading = false;
	},


	/*******************************************************************************************************
	 *                                                                                                     *
	 *                                                                                                     *
	 *                                  Volume Controls                                                    *
	 *                                                                                                     *
	 *                                                                                                     *
	 *******************************************************************************************************/

	/**
	 * Event handler mute buttons
		 *
		 * @event mute
	 */
	mute : function () {
		this.muted = !this.muted;
		if (this.muted) {
			this.savedVolume = this.currentVolume;
			this.currentVolume = 0;
			if((radioplayer.emp.player.flash && radioplayer.emp.player.flash.used) || (radioplayer.emp.player.html && radioplayer.emp.player.html.used)) {
				radioplayer.emp.setVolume(0);
			}
		} else {
			radioplayer.emp.setVolume(Math.round(this.savedVolume));
		}
	},

	/**
	 * Event handler for when the emp's volume has changed
		 *
		 * @event onVolumeUpdate
		 * @param type {string}
		 * @param event {Object} Event
	 */
	onVolumeUpdate : function(type, event) {
		this.currentVolume = event.volume;

		//radioplayer.utils.output('on volume update: ' + event.volume);

		var setClass = '';

				if (event.volume == 0) {
						if (this.isListening && this.isPlaying) {
								radioplayer.controls.onSilent('mute');
								this.isListening = false;
						}
				} else {
						if (!this.isListening && this.isPlaying) { // The user has started / resumed listening
								radioplayer.controls.onAudible();
								this.isListening = true;
						}
				}

		if (event.volume == 0) {
				setClass = 'muted';
		} else if (event.volume < 20) {
			setClass = 'p20';
		} else if (event.volume < 40) {
			setClass = 'p40';
		} else if (event.volume < 60) {
			setClass = 'p60';
		} else if (event.volume < 80) {
			setClass = 'p80';
		} else {
			setClass = 'p100';
		}

		$('#volume-control').removeClass('muted p20 p40 p60 p80 p100').addClass(setClass);

	},

		/**
		 *
		 * Event handler for hovering over the volume controls
		 *
		 * @event volumeIconMouseEnter
		 *
		 */
	volumeIconMouseEnter : function() {
		if ((!radioplayer.consts.is_iOS && !this.volumeLocked) || (!radioplayer.consts.is_Android && !this.volumeLocked) ) {
			// Set position and width of volume control
			// We do this now, in case the user has changed the browser zoom level, and these need to be recalculated
			this.volControlLeft = $('#volume-control').offset().left;
			this.volControlWidth = $('#volume-control').outerWidth();
			this.volWavesWidth = this.volControlWidth - this.muteThres - this.topEndThres;

			$('#volume-control').addClass('hover');
		}
	},

		/**
		 *
		 * Event handler for when mouse leaves volume controls
		 *
		 * @event volumeIconMouseLeave
		 *
		 */
	volumeIconMouseLeave : function() {
		if ((!radioplayer.consts.is_iOS && !this.volumeLocked) || (!radioplayer.consts.is_Android && !this.volumeLocked)) {
			$('#volume-control').removeClass('hover muted p20 p40 p60 p80 p100');

			// Which off state to show?
			if (radioplayer.controls.muted) {
				$('#volume-control').addClass('muted');
			} else if (radioplayer.controls.currentVolume < 20) {
				$('#volume-control').addClass('p20');
			} else if (radioplayer.controls.currentVolume < 40) {
				$('#volume-control').addClass('p40');
			} else if (radioplayer.controls.currentVolume < 60) {
				$('#volume-control').addClass('p60');
			} else if (radioplayer.controls.currentVolume < 80) {
				$('#volume-control').addClass('p80');
			} else {
				$('#volume-control').addClass('p100');
			}
		}
	},

		/**
		 *
		 * Handler for moving the mouse in the volume controls.
		 *
		 * @event volumeIconMouseMove
		 *
		 * @param e {object} Position
		 */
	volumeIconMouseMove : function(e) {
		if ((!radioplayer.consts.is_iOS && !this.volumeLocked) || (!radioplayer.consts.is_Android && !this.volumeLocked)) {
			/**
			 * When moving over volume control,
			 * update the visual state and record the value we would set if we were to click
			 */

			var cursorX = e.pageX - radioplayer.controls.volControlLeft,
			setClass = '';

			if (cursorX < radioplayer.controls.muteThres) {
				// Hovering over mute icon
				// If currently muted, show the mute state
				// Else show the current volume level, so that when we click, we see it change to the muted state

				if (radioplayer.controls.mouseDownOnVolume) {
					// Mouse button is currently held down, so show the mute state, to indicate what would happen if we let go
					setClass = 'muted';
					$('#volume-control').attr('title', radioplayer.lang.controls.unmute);
				} else if (radioplayer.controls.muted) {
					// Volume is already muted
					setClass = 'muted';
					$('#volume-control').attr('title', radioplayer.lang.controls.unmute);
				} else if (radioplayer.controls.currentVolume < 20) {
					// Volume is not muted, show the current state (and same for all following values)
					setClass = 'p20';
					$('#volume-control').attr('title', radioplayer.lang.controls.mute);
				} else if (radioplayer.controls.currentVolume < 40) {
					setClass = 'p40';
					$('#volume-control').attr('title', radioplayer.lang.controls.mute);
				} else if (radioplayer.controls.currentVolume < 60) {
					setClass = 'p60';
					$('#volume-control').attr('title', radioplayer.lang.controls.mute);
				} else if (radioplayer.controls.currentVolume < 80) {
					setClass = 'p80';
					$('#volume-control').attr('title', radioplayer.lang.controls.mute);
				} else {
					setClass = 'p100';
					$('#volume-control').attr('title', radioplayer.lang.controls.mute);
				}

			} else if (cursorX >= (radioplayer.controls.volControlWidth - radioplayer.controls.topEndThres)) {
				// Hovering over the top end threshold, where we assume level is 100
				setClass = 'p100';
				radioplayer.controls.volumeHover = 100;
				$('#volume-control').attr('title', radioplayer.lang.controls.set_volume_100);

			} else {
				// Hovering over the waves
				// Calculate the volume level from 0 to 100
				radioplayer.controls.volumeHover = Math.round(((cursorX - radioplayer.controls.muteThres) / radioplayer.controls.volWavesWidth) * 100);

				if (radioplayer.controls.volumeHover < 20) {
					setClass = 'p20';
				} else if (radioplayer.controls.volumeHover < 40) {
					setClass = 'p40';
				} else if (radioplayer.controls.volumeHover < 60) {
					setClass = 'p60';
				} else if (radioplayer.controls.volumeHover < 80) {
					setClass = 'p80';
				} else {
					setClass = 'p100';
				}
				$('#volume-control').attr('title', radioplayer.lang.controls.set_volume);
			}

			$('#volume-control').removeClass('muted p20 p40 p60 p80 p100').addClass(setClass);

		}
	},


		/**
		 *
		 * Volume Icon Mouse Down
		 *
		 * @event volumeIconMouseDown
		 * @param e
		 */
	volumeIconMouseDown : function(e) {
		if ((!radioplayer.consts.is_iOS && !this.volumeLocked) || (!radioplayer.consts.is_Android && !this.volumeLocked)) {
			if(e.originalEvent.preventDefault) {
				e.originalEvent.preventDefault()
			}
			else {
				e.originalEvent.returnValue = false; // This adds support for older IEs
			}

			if (e.which === 1) {
				radioplayer.controls.mouseDownOnVolume = true;
			}
		}
	},


		/**
		 *
		 * Volume Icon Mouse Up
		 *
		 * @event volumeIconMouseUp
		 * @param e
		 */
	volumeIconMouseUp : function(e) {
		if ((!radioplayer.consts.is_iOS && !this.volumeLocked) || (!radioplayer.consts.is_Android && !this.volumeLocked)) {
			if (e.which === 1) {
				radioplayer.controls.mouseDownOnVolume = false;
			}
		}
	},


		/**
		 *
		 * Volume Icon Click
		 *
		 * @event volumeIconClick
		 * @param e
		 */
	volumeIconClick : function(e) {
		if (!radioplayer.consts.is_iOS && !radioplayer.consts.is_Android) {

			if (!this.volumeLocked) {

				var cursorX = e.pageX - radioplayer.controls.volControlLeft;

				if (cursorX < radioplayer.controls.muteThres) {
					// Click the mute icon

					radioplayer.utils.output('clicked mute');
					radioplayer.controls.mute();

				} else {
					// Click anywhere else in the volume icon

					radioplayer.utils.output('SET TO ' + radioplayer.controls.volumeHover);

					if (radioplayer.controls.muted) { // if muted, unmute first
						radioplayer.controls.mute();
					}

					radioplayer.emp.setVolume(radioplayer.controls.volumeHover);

					radioplayer.services.saveCookie("vl/s", "vl", radioplayer.controls.volumeHover);
				}

			}

		} else {
			// Volume is disabled, so show the iOS prompt
			if (!$('#volume-controls').hasClass('showing-prompt')) {

				// Hide the play prompt if it's showing
				radioplayer.controls.hidePressPlayPrompt();

				$('#volume-controls').addClass('showing-prompt')
									 .append('<div class="point-prompt volume-prompt" id="volume-prompt">' + radioplayer.lang.controls.use_device_controls + '<span class = "icon-info_outline"></span><div class="point-prompt-arrow"></div></div>');

				$('#volume-prompt').on('click', function(){
					$('#volume-controls').removeClass('showing-prompt');
					$('#volume-prompt').remove();
				});

				// Auto remove the prompt after 4 seconds
				setTimeout(function(){
					$('#volume-controls').removeClass('showing-prompt');
					$('#volume-prompt').remove();
				}, 4000);
			}

		}
	},


	/**
	 * Used by accessibility buttons to set volume to preset levels
	 *
	 * @method setVolumeTo
	 * @param pc {int} Percentage for new volume value to set
	 */
	setVolumeTo : function(newVol) {
		radioplayer.utils.output('access log '+newVol);

		if (this.muted) { // unmute, if muted
			this.mute();
		}
		radioplayer.emp.setVolume(Math.round(newVol));

		radioplayer.services.saveCookie("vl/s", "vl", newVol);
	},



	/****************************************************************************************************************************
	 *
	 *
	 * Generic button handling
	 *
	 *
	 */


	/**
	 * Show play button. Called on emp reporting stop /end / pause
		 *
		 * @method showPlay
		 * @param type {String}
		 * @param event {Object}
	 */
	showPlay : function(type, event) {
		if ($('#pause').is(':visible')) {
			$("#pause").hide();
		}
		if ($('#stop').is(':visible')) {
			$("#stop").hide();
		}
		if (!$('#play').is(':visible')) {
			$("#play").show();

						if ( $.browser.msie ) {
								$("#play").css('display', 'block');
						}
		}

				if(this.userClickedControls) { // If user triggered event
						$("#play").focus(); // Give focus back to play
				}
				this.userClickedControls = false; // Reset state
	},

	/**
	 * Hide play button. Called on emp reporting start / resume
		 *
		 * @method hidePlay
		 * @param type {String}
		 * @param event {Object}
	 */
	hidePlay : function(type, event) {
		if (this.isLive()) {
			if ($('#pause').is(':visible')) {
				$("#pause").hide();
			}
			if (!$('#stop').is(':visible')) {
				$("#stop").show();

								if ( $.browser.msie ) {
										$("#stop").css('display', 'block');
								}
			}
			if ($('#progress-scrubber-load-bar').is(':visible')) {
				$("#progress-scrubber-load-bar").hide();
			}

		} else {
			if (!$('#pause').is(':visible')) {
				$("#pause").show();

								if ( $.browser.msie ) {
										$("#pause").css('display', 'block');
								}
			}
			if ($('#stop').is(':visible')) {
				$("#stop").hide();
			}
			if (!$('#progress-scrubber-load-bar').is(':visible')) {
				$("#progress-scrubber-load-bar").show();
			}
		}

		if ($('#play').is(':visible')) {
			$("#play").hide();
		}

				// If the user clicked the controls that triggered this event,
				// we need to give focus to the appropriate new button
				if(this.userClickedControls) {
						if(audioLive) {
								$("#stop").focus();
						} else {
								$("#pause").focus();
						}
				}

				this.userClickedControls = false; // Reset the flag back to default

		},

	/**
	 * Click heart to add or remove the current station from My Stations
		 *
		 * @method toggleMyStations
		 * @param type {String}
		 * @param event {Object}
	 */
	toggleMyStations : function(event) {
		event.preventDefault();

		if ($('#toggle-mystations').hasClass('in-mystations')) {
			// Current in My Stations, so remove
			radioplayer.mystations.remove(currentStationID, 'head-controls');

		} else if (!$('#toggle-mystations').hasClass('animating')) {
			// Not in My Stations, so add
			radioplayer.mystations.add(currentStationID, 'head-controls');
		}

	},



	/******************************************************************************************************************************
	 *
	 *
	 * On Demand
	 *
	 *
	 */


	/**
	 * Event handler for emp reporting play progress update.
		 *
		 * @event onPositionUpdate
		 * @param type {string}
		 * @param event {Object}
	 */
	onPositionUpdate : function(type, event, useExisting) {
		this.currentPosition = useExisting ? this.currentPosition : event.position / 1000;

		var rawPosition = useExisting ? (this.currentPosition * 1000) : event.position;

		if(this.isAllLoaded) {
				$("#progress-scrubber-load-bar").width($("#progress-scrubber-background").width() +"px");
				$("#duration").html(this.formatPosition(rawPosition) + "/" + this.duration);
		} else {
			if($('#progress-scrubber-handle').is(':visible')) $("#progress-scrubber-handle").hide();
		}

		var trackPosition = rawPosition / this.rawDuration;
		var handlePos = trackPosition * ($("#progress-scrubber-background").width());
		if (!this.dragging) {
			$("#progress-scrubber-handle").css('left', handlePos + "px");
		}

		var progressBarWidth = trackPosition * ($("#progress-scrubber-background").outerWidth());
		$("#progress-scrubber-playback-bar").width(progressBarWidth);
	},

	/**
	 * Event handler for emp reporting loading progress
		 *
		 * @event onLoadProgressUpdate
		 * @param type {String}
		 * @param event {Object}
	 */
	onLoadProgressUpdate : function(type, event) {
		if (this.isLive()) {
			$("#progress-scrubber-load-bar").width("0px");
			this.isLoading = false;
			if($('#duration').is(':visible')) $("#duration").hide();
			return;
		}

		$("#progress-scrubber-load-bar").width(($('#progress-scrubber-background').width())*event.loadProgress+"px");

		if (event.loadProgress >= 0.99) {
			this.isAllLoaded = true;
			radioplayer.utils.output("fire emp loaded event");
			$(radioplayer.emp).trigger("loaded");
			$("#progress-scrubber-load-bar").width($("#progress-scrubber-background").width()+"px");
		} 
		else {
			this.isAllLoaded = false;
		}
	},

	/**
	 * Hide loading graphics in controls - called on emp reporting start
		 *
		 * @method hideLoaderOnStart
		 * @param type {String}
		 * @param event {Object}
	 */
	hideLoaderOnStart : function (type, event) {
		this.hideLoader();
		//radioplayer.utils.output(" begin ");
		if(this.isLive()) this.isAllLoaded = true;
	},

	/**
	 * Hide loading graphics in controls
		 *
		 * @method hideLoader
		 * @param type {String}
		 * @param event {Object}
	 */
	hideLoader : function (type, event) {
				this.isLoading = false;

				if(this.isLive()) {
						$("#live-strip").removeClass('loading');
						$("#live-strip").removeClass('play-prompt-indicator');
				} else {
						$('#od-strip #duration').show();
						if (!$('#progress-scrubber-playback-bar').is(':visible')) $("#progress-scrubber-playback-bar").show();
				}
	},

	/**
	 * Show loading graphics in controls
		 *
		 * @method showLoader
		 * @param type {String}
		 * @param event {Object}
	 */
	showLoader : function(type, event) {
				this.isLoading = true;

				if(this.isLive()) {
						$("#live-strip").addClass('loading');
				} else {
						if ($('#progress-scrubber-handle').is(':visible')) $("#progress-scrubber-handle").hide();
						//if ($('#progress-scrubber-playback-bar').is(':visible')) $("#progress-scrubber-playback-bar").hide();
						$("#duration").html(radioplayer.lang.controls.loading);
						if($('#duration').css('display') === "none") $("#duration").show();
				}
	},

	/**
	 * EMP callback for when duration has been set (OD)
		 *
		 * @method setDuration
		 * @param type {String}
		 * @param event {Object}
	 */
	setDuration : function(type, event) {
				if(!audioLive) { // Only apply duration once clip has fully loaded
						this.rawDuration = event.duration;
						this.duration = this.formatPosition(this.rawDuration);
						this.checkDuration();

						var durationSeconds = Math.floor(event.duration / 1000);

						if(this.insertedODButtons == false) {
								// Generate HTML for skip buttons
								var fiveSecondSkip = '<button type="button" class="access od-skip" data-offset="5" tabindex="0">' + radioplayer.lang.controls.skip_forward_5_seconds + '</button>' +
												'<button type="button" class="access od-skip" data-offset="-5" tabindex="0">' + radioplayer.lang.controls.skip_back_5_seconds + '</button>',

										thirtySecondSkip = '<button type="button" class="access od-skip" data-offset="30" tabindex="0">' + radioplayer.lang.controls.skip_forward_30_seconds + '</button>' +
												'<button type="button" class="access od-skip" data-offset="-30" tabindex="0">' + radioplayer.lang.controls.skip_back_30_seconds + '</button>',

										oneMinuteSkip = '<button type="button" class="access od-skip" data-offset="60" tabindex="0">' + radioplayer.lang.controls.skip_forward_1_minute + '</button>' +
												'<button type="button" class="access od-skip" data-offset="-60" tabindex="0">' + radioplayer.lang.controls.skip_back_1_minute + '</button>',

										fiveMinSkip = '<button type="button" class="access od-skip" data-offset="300" tabindex="0">' + radioplayer.lang.controls.skip_forward_5_minutes + '</button>' +
												'<button type="button" class="access od-skip" data-offset="-300" tabindex="0">' + radioplayer.lang.controls.skip_back_5_minutes + '</button>',

										tenMinSkip = '<button type="button" class="access od-skip" data-offset="600" tabindex="0">' + radioplayer.lang.controls.skip_forward_10_minutes + '</button>' +
												'<button type="button" class="access od-skip" data-offset="-600" tabindex="0">' + radioplayer.lang.controls.skip_back_10_minutes + '</button>',

										thirtyMinuteSkip = '<button type="button" class="access od-skip" data-offset="1800" tabindex="0">' + radioplayer.lang.controls.skip_forward_30_minutes + '</button>' +
												'<button type="button" class="access od-skip" data-offset="-1800" tabindex="0">' + radioplayer.lang.controls.skip_forward_30_minutes + '</button>';

								if(durationSeconds > 3600) { // Duration greater than an hour
										$('#od-strip').append(oneMinuteSkip + tenMinSkip + thirtyMinuteSkip);
								} else if(durationSeconds > 600) { // Between 10 minutes and an hour
										$('#od-strip').append(thirtySecondSkip + oneMinuteSkip + fiveMinSkip);
								} else if(durationSeconds > 120) { // Between 2 and 10 minutes
										$('#od-strip').append(fiveSecondSkip + thirtySecondSkip + oneMinuteSkip);
								} else if(durationSeconds > 30) { // Between 30 seconds and 2 minutes
										$('#od-strip').append(fiveSecondSkip + thirtySecondSkip);
								} else { // Less than 30 seconds
										$('#od-strip').append(fiveSecondSkip);
								}

								this.insertedODButtons = true;
						}
				}
	},

	/**
	 * Ensure that the controls are showing the appropriate state depending on playbackmode and loading progress
		 *
		 * @method checkDuration
		 *
	 */
	checkDuration : function() {
		if (this.isLive()) {
			// LIVE
			$('#live-strip').show();
			$('#od-strip').hide();

		} 
		else {
			// ON DEMAND
			$('#live-strip').hide();
			$('#od-strip').show();

			// If not all loaded, ensure that scrubber is hidden
			if (this.isAllLoaded) {
				if($('#progress-scrubber-playback-bar').css('display') === "none") $("#progress-scrubber-playback-bar").show();
			} 
			else {
				if($('#progress-scrubber-handle').is(':visible')) $("#progress-scrubber-handle").hide();
				if($('#progress-scrubber-playback-bar').is(':visible')) $("#progress-scrubber-playback-bar").hide();
				$("#duration").html(radioplayer.lang.controls.loading);
			}

			// Force position update resize
			$(window).on('resize', function(){
				if (!radioplayer.controls.isPlaying) {
					radioplayer.controls.onPositionUpdate(null,null,true)
				}
			})
		}

		if(this.isPlaying) { // If the stream is playing, hide the play button
			this.hidePlay();
		}

		if(this.isLoading) {
			$("#duration").html(radioplayer.lang.controls.loading);
		}
	},


		/**
	 * Check the playback mode
		 *
		 * @method isLive
		 * @return {Boolean} Whether playback mode is live
	 */
	isLive : function() {
		var isLive = (this.rawDuration === 0 || this.rawDuration == null);
		if (radioplayer.emp.ready && radioplayer.emp.currentPlayer) {
			isLive = radioplayer.emp.getPlaybackMode() === "live";
		} else {
			isLive = (this.rawDuration === 0 || this.rawDuration == null);
		}
		return isLive;
	},

	/**
	 * Run when EMP is reset
		 *
		 * @method resetDuration
		 * @param type {String}
		 * @param event {Object}
	 */
	resetDuration : function(type, event) {
		this.rawDuration = 0;
		this.duration = this.formatPosition(0);
		this.onPositionUpdate(null, {position:0});
		this.checkDuration();
	},

	/**
	 * Progress scrub bar handle drag event handler (NB: this is only for the drag event)
		 *
		 * @event seek
		 * @param event {Object}
	 */
	seek : function(event) {

		if (this.lastPosition !== $("#progress-scrubber-handle").offset().left ) {
			var handleOffset = 14;
			var widthOffset = -5;
			if ($('html').hasClass('ie8')) {
				handleOffset = 9;
				widthOffset = 0;
			}

			var handlePosition = $("#progress-scrubber-handle").position().left;
			var handleOffsetLeft = handlePosition;
			this.lastPosition = handleOffsetLeft;

			var barArea = $("#progress-scrubber-background").width();
			var percent = handlePosition / barArea;

			var trackPosition = percent * this.rawDuration;

			$("#duration").html(this.formatPosition(trackPosition) + "/" + this.duration);
			$("#progress-scrubber-playback-bar").outerWidth(percent * $("#progress-scrubber-background").width());
		}

	},

	/**
	 * Starts the seek - on handle press
		 *
		 * @event seekStart
	 */
	seekStart : function() {
		this.dragging = true;
		radioplayer.emp.pause();
	},

	/**
	 * Stops the seek - on handle release
		 *
		 * @event seekStop
	 */
	seekStop : function(event) {
		this.dragging = false;
		this.updateSeekPosition(event);
		if ($('#progress-scrubber-handle').is(':visible') && !this.mouseOverProgress) {
			$("#progress-scrubber-handle").fadeOut(200);
			$('#od-title').fadeIn(200);
		}
		radioplayer.services.analytics.sendEvent('Navigation', 'On Demand Slider', window.location.href, null, null);
	},

	/**
	 * Seek to a point in the OD clip, defined by 'offset' from the current position
		 *
		 * @method seekOffset
	 * @param offset {integer}
	 */
	seekOffset : function(offset) {
		var seekTo = this.currentPosition + parseInt(offset);
		var totalDurationSeconds = this.rawDuration / 1000;

		if(seekTo > totalDurationSeconds) {
			 seekTo = totalDurationSeconds;
		}
		
		radioplayer.emp.seek(seekTo);
	},

	/**
	 * Sends the new seek position to the EMP
		 *
		 * @method updateSeekPosition
		 * @param event {Object}
	 */
	updateSeekPosition : function(event) {
		var barArea = $("#progress-scrubber-background").width();
		var percent = this.lastPosition / barArea;
		var seekPosition = (percent * this.rawDuration) / 1000;

		seekPosition = Math.max(seekPosition, 0);
		radioplayer.emp.seek(seekPosition);
	},

	/**
	 * Progress bar click sends new seek position to EMP
		 *
		 * @event progressBarClick
		 * @param event {Object}
	 */
	progressBarClick : function (event) {
		if(this.isLive() || !this.isAllLoaded) return; // Don't do anything if live, or stream not fully loaded

		var relClickPosition = event.pageX - $("#progress-scrubber-background").offset().left;
		var lowerEdge = $('#progress-scrubber-handle').outerWidth() / 2;
		var upperEdge = $("#progress-scrubber-background").outerWidth() - ($('#progress-scrubber-handle').outerWidth() / 2);
		var seekPosition = 0;

		if(relClickPosition < lowerEdge) { // Clicked in lower bound
			seekPosition = 0;
		} else if(relClickPosition > upperEdge) { // Clicked in upper bound
				seekPosition = 1;
		} else { // Clicked inside the progress bar range
				seekPosition = relClickPosition / $("#progress-scrubber-background").outerWidth();
		}

		var trackPosition = (seekPosition * this.rawDuration) / 1000;

		radioplayer.emp.seek(trackPosition);
		radioplayer.services.analytics.sendEvent('Navigation', 'On Demand Slider', window.location.href, null, null);
	},

		/**
		 * Mouse Enter Progress
		 *
		 * @method mouseEnterProgress
		 *
		 */
	mouseEnterProgress : function() {
		if(this.isLive() || !this.isAllLoaded) return;

		this.mouseOverProgress = true;
		$('#progress-scrubber-handle').stop(true, true).fadeIn(200);
		$('#od-title').stop(true, true).fadeOut(200);
	},

		/**
		 *
		 * Mouse Leave Progress
		 *
		 * @method mouseLeaveProgress
		 *
		 */
	mouseLeaveProgress : function() {
		if(this.isLive() || !this.isAllLoaded) return;

		this.mouseOverProgress = false;
		if (!this.dragging) {
			$('#progress-scrubber-handle').stop(true, true).fadeOut(200);
			$('#od-title').stop(true, true).fadeIn(200);
		}
	},

		/**
		 * Log security error
		 *
		 * @event logSecurityError
		 *
		 * @param type {String}
		 * @param event {Object}
		 */
	logSecurityError : function(type, event) {
		radioplayer.utils.output("EMP has encountered a security error, audio may not play.");

		// If we get a security error with HLS flash, abort playback attempt
		if (radioplayer.emp.currentPlayer === 'flash' && window.audioArray[radioplayer.emp.audioArrayInteger].audioType === 'hls') {
			radioplayer.emp.player.flash.ioErrorCount = 0;
			clearTimeout(radioplayer.emp.player.flash.ioErrorTimeout);
			radioplayer.emp.player.flash.stop();
			radioplayer.emp.player.flash.cleanup();
			$.proxy(this.onNoSupport, this)();
		}
	},

	/**
	 * Callback for when a stream reaches it's end (from EMP)
	 *
	 * @event onEnd
		 * @param type {String}
		 * @param event {Object}
	 */
	onEnd : function (type, event) {
		radioplayer.utils.output("end");
				this.onPositionUpdate(null, { position: this.rawDuration }); // Update the seek bar to the end


	},


		/**
		 * Called when something occurs that would cause the user to be able to hear the stream
		 *
		 * @event onAudible
		 */
		onAudible: function() {
				if(this.isListening == false && this.currentVolume > 0) {
						radioplayer.services.analytics.sendPageview("");
						this.isListening = true;
				}
		},

		/**
		 * On Silent
		 *
		 * @event onSilent
		 * @param reason
		 */
		onSilent: function(reason) {
				if(this.isListening == true) {
						radioplayer.services.analytics.sendPageview("/" + reason);
						this.isListening = false;
				}
		},

		/**
		 * On Player Start
		 *
		 * @event onStart
		 */
		onStart: function() {
			this.isPlaying = true;
			this.hideLoader();
			this.hideErrorMsg();
		},

		/**
		 * On Player Stop
		 *
		 * @event onStop
		 */
		onStop: function() {
				this.isPlaying = false;

			if (audioLive && nowPlayingSource == "stream") {
				// For live streams with data locked to stream metadata, on stop we should reset the ticker to station name
				radioplayer.playing.updateText(currentStationName, "");
			}
		},

		/**
		 * User Clicked Pause Button
		 *
		 * @event onClickPause
		 */
		onClickPause: function() {
				this.userClickedControls = true;
				this.userPaused = true;
		},

		/**
		 * User Clicked Play Button
		 *
		 * @event onClickPlay
		 */
		onClickPlay: function() {
				if (radioplayer.adswizz.enabled) {
					// if Adswizz is enabled, we need to decorate the streams every time we start start so that 'skey' can be updated.
					radioplayer.adswizz.decorateAllStreamUrls();
				}
				this.showLoader();
				this.userClickedControls = true;
		},

		/**
		 * User Clicked Stop Button
		 *
		 * @event onClickStop
		 */
		onClickStop: function() {
				this.hideLoader();
				this.userClickedControls = true;
		},

		/**
		 * Triggered when the browser / flash EMPs do not support the current stream
		 *
		 * @event onNoSupport
		 */
		onNoSupport: function() {
				radioplayer.utils.output("The EMP player does not support the audio format. (Varies by browser and whether Flash available.). Just tried using "+radioplayer.emp.currentPlayer);
				this.hideLoader();
				if ( radioplayer.emp.audioArrayInteger < (window.audioArray.length - 1)) {
					radioplayer.emp.audioArrayInteger++;
					radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
					radioplayer.emp.dataReady();
				}
				else if (radioplayer.emp.audioPreference < 1) {
					radioplayer.emp.audioPreference++;
					radioplayer.emp.audioArrayInteger = 0;
					radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
					radioplayer.emp.dataReady();
				}
				else if (radioplayer.emp.player.html.audioHTMLFallback) {
					var audioToUse = $.extend(true,[],radioplayer.emp.player.html.audioHTMLFallback);
        	radioplayer.emp.player.html.audioHTMLFallback = null;
        	radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime, audioToUse);
					radioplayer.emp.dataReady();
				}
				else {
					this.showPlay();
					if (this.noSupportShowing) {
						return false;
					}
					this.noSupportShowing = true;
					radioplayer.playing.stopUpdating();
					radioplayer.playing.showFailMsg();
					this.showErrorMsg(radioplayer.lang.stream_error.device_incompatible);
					radioplayer.services.analytics.sendEvent('Error', 'Device Incompatible', null, null, null);
				}	
		},

		/**
		 * Triggered when the browser / flash EMPs do not support the current stream
		 *
		 * @event onNoSupport
		 */
		ioError: function() {
			radioplayer.emp.player.flash.ioErrorCount++;
			if (radioplayer.emp.player.flash.ioErrorTimeout) {
				clearTimeout(radioplayer.emp.player.flash.ioErrorTimeout);
			}
			// After one minute, reset the count
			radioplayer.emp.player.flash.ioErrorTimeout = setTimeout(function(){
				radioplayer.emp.player.flash.ioErrorCount = 0;
			}, 60000)
			// If we have had 3 or more ioErrors, we need to think about trying a new stream
			if (radioplayer.emp.player.flash.ioErrorCount >= 3) {
				// If we have more streams we should try that
				// If not we should just keep on trying with this one
					radioplayer.emp.player.flash.ioErrorCount = 0;
					clearTimeout(radioplayer.emp.player.flash.ioErrorTimeout);
					radioplayer.emp.player.flash.stop();
					radioplayer.emp.player.flash.cleanup();
					$.proxy(this.onNoSupport, this)();
			}
		},

		/**
		 * When the EMP has an error that cannot be resolved
		 *
		 * E.g. dead streams
		 *
		 * @event onError
		 */
		onError: function() {
			this.hideLoader();
			this.showPlay();
			radioplayer.emp.resetAttemptCount();
			radioplayer.services.analytics.sendEvent('Error', 'Stream Unavailable', rpId, null, null);
			this.showErrorMsg(radioplayer.lang.stream_error.unavailable);
		},

		/**
		 * Show a stream error message
		 *
		 * @method showErrorMsg
		 */
	showErrorMsg : function(message) {
		$('.radioplayer-body').append('<div class="radioplayer-erroroverlay">' + message + '</div>');
	},

		/**
		 * Hide any showing stream error message
		 *
		 * @method hideErrorMsg
		 */
	hideErrorMsg : function() {
		$('.radioplayer-erroroverlay').remove();
	},

	startPlayingInit : function(that) {
		console.log(':::: startPlayingInit ::::');
		if ((vastAds && vastAds.enabled && !vastAds.shownVideo) && (tritonAds && tritonAds.enabled)) {
			if(audioLive){
				radioplayer.emp.stop();
			}
			else {
				radioplayer.emp.pause();
			}
			return false;
		}
		else {
   		$.proxy(this.hidePlay, this)();
   		$.proxy(this.hideLoaderOnStart, this)();
   		$.proxy(this.onStart, this)();
   		$.proxy(this.onAudible, this)();

   		// Set this so that we can determine whether it is safe to show any announcements
   		this.streamHasStarted = true;
		}
	},

	resumeInit: function(that) {
		console.log(':::: resumeInit ::::');
		if ((vastAds && vastAds.enabled && !vastAds.shownVideo) && (tritonAds && tritonAds.enabled)) {
			if(audioLive){
				radioplayer.emp.stop();
			}
			else {
				radioplayer.emp.pause();
			}
			return false;
		}
		else {
			if(this.isLive()) {
				if (!$('#progress-scrubber-playback-bar').is(':visible')) $("#progress-scrubber-playback-bar").show();
			}
			$.proxy(this.hidePlay, this)();
			$.proxy(this.onAudible, this)();
		}
	},

	resumeProxy: function() {
		if ((this.isLive() || this.isAllLoaded || this.userPaused) && !this.noSupportShowing) {
			this.userPaused = false;
			$.proxy(radioplayer.emp.resume, radioplayer.emp)();
		}
		else {
			radioplayer.emp.audioArrayInteger = 0;
			radioplayer.emp.audioPreference = 0;
			radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
			radioplayer.emp.dataReady();
		}
	},

	/**
	 * Initialise the controls
		 *
		 * @method init
		 * @contructor
	 */
	init : function() {
		// Localisation
		$('#controls h2').html(radioplayer.lang.controls.player_controls);
		$('#controls #play .accessibility-text').html(radioplayer.lang.controls.play);
		$('#controls #play').attr('title', radioplayer.lang.controls.play);
		$('#controls #pause .accessibility-text').html(radioplayer.lang.controls.pause);
		$('#controls #pause').attr('title', radioplayer.lang.controls.pause);
		$('#controls #stop .accessibility-text').html(radioplayer.lang.controls.stop);
		$('#controls #stop').attr('title', radioplayer.lang.controls.stop);
		$('#controls #duration').html(radioplayer.lang.controls.loading);
		$('#volume-1').html(radioplayer.lang.controls.set_volume_20);
		$('#volume-2').html(radioplayer.lang.controls.set_volume_40);
		$('#volume-3').html(radioplayer.lang.controls.set_volume_60);
		$('#volume-4').html(radioplayer.lang.controls.set_volume_80);
		$('#volume-5').html(radioplayer.lang.controls.set_volume_100);

		$('.loading-indicator').html(radioplayer.lang.controls.loading);
		$('.play-prompt-indicator').html(radioplayer.lang.controls.play_prompt);

		if(radioplayer.consts.is_Android || radioplayer.consts.is_iOS) {
			$('#volume-control').addClass('disabled');
		}

		// register event callbacks
		$(radioplayer.emp).on('update', $.proxy(this.onPositionUpdate, this))
											.on('volumeSet', $.proxy(this.onVolumeUpdate, this))
											.on('pausePlaying', $.proxy(this.showPlay, this))
											.on('ended', $.proxy(this.showPlay, this))
											.on('ended', $.proxy(this.onEnd, this))
											.on('stopped', $.proxy(this.showPlay, this))
											.on('cleanedup', $.proxy(this.resetDuration, this))
											.on('cleanedup', $.proxy(this.showLoader, this))
											.on('startPlaying', $.proxy(this.startPlayingInit, this))
											.on('resumed', $.proxy(this.resumeInit, this))

											.on('durationSet', $.proxy(this.setDuration, this))
											.on('loadProgress', $.proxy(this.onLoadProgressUpdate, this))
											.on('securityError', $.proxy(this.logSecurityError, this))

				// Events to detect whether the user is actually listening or not. i.e. playing / stopped / muted
											.on('pausePlaying', $.proxy(this.onSilent, this, 'pause'))
											.on('stopped', $.proxy(this.onSilent, this, 'stop'))
											.on('ended', $.proxy(this.onSilent, this, 'stop'))

				// Events to set whether the stream is playing or not, regardless of whether the user can hear it.
											.on('pausePlaying', $.proxy(this.onStop, this))
											.on('stopped', $.proxy(this.onStop, this))
											.on('ended', $.proxy(this.onStop, this))
											.on('error', $.proxy(this.onError, this))
											.on('noSupport', $.proxy(this.onNoSupport, this))
											.on('ioError', $.proxy(this.ioError, this))

		// Metadata events
											.on('metadata', $.proxy(radioplayer.playing.metadataReceived, this))
											.on('id3', $.proxy(radioplayer.playing.id3Received, this))
											.on('header', $.proxy(radioplayer.playing.headerReceived, this));

		//register control behaviours.
		$('#pause').on('click', $.proxy(this.onClickPause, this));
		$('#play').on('click', $.proxy(this.onClickPlay, this));
		$('#stop').on('click', $.proxy(this.onClickStop, this));

		$('#pause').on('click', $.proxy(radioplayer.emp.pause, radioplayer.emp));
		$('#play').on('click', $.proxy(this.resumeProxy, this));
		$('#stop').on('click', $.proxy(radioplayer.emp.stop, radioplayer.emp));

				// Accessibility buttons
		$('#volume-mute').on('click', $.proxy(this.mute, this));
		$('#volume-1').on('click', $.proxy(this, 'setVolumeTo', 20));
		$('#volume-2').on('click', $.proxy(this, 'setVolumeTo', 40));
		$('#volume-3').on('click', $.proxy(this, 'setVolumeTo', 60));
		$('#volume-4').on('click', $.proxy(this, 'setVolumeTo', 80));
		$('#volume-5').on('click', $.proxy(this, 'setVolumeTo', 100));

		$('#volume-control').on('mouseenter', $.proxy(this.volumeIconMouseEnter, this))
							.on('mouseleave', $.proxy(this.volumeIconMouseLeave, this))
							.on('mousemove', $.proxy(this.volumeIconMouseMove, this))
							.on('mousedown', $.proxy(this.volumeIconMouseDown, this))
							.on('mouseup', $.proxy(this.volumeIconMouseUp, this))
							.on('click', $.proxy(this.volumeIconClick, this));

		$('#toggle-mystations').on("click", $.proxy(this.toggleMyStations, this));

		$("#progress-scrubber-handle").draggable({axis: 'x', containment: "#progress-scrubber-container" })
												.on('drag', $.proxy(this.seek, this))
												.on('dragstart', $.proxy(this.seekStart, this))
												.on('dragstop', $.proxy(this.seekStop, this));

		$("#progress-scrubber-background").on('click', $.proxy(this.progressBarClick, this));
		$("#progress-scrubber-container").on('mouseenter', $.proxy(this.mouseEnterProgress, this))
											.on('mouseleave', $.proxy(this.mouseLeaveProgress, this));

		// If on a touch device, we need to show the scrubber handle all the time
		if (radioplayer.consts.is_iOS || radioplayer.consts.is_Android) {
				$("#progress-scrubber-handle").addClass('progress-scrubber-handle-on');
		}

		// Accessibility buttons for skipping on demand
		$('#od-strip').on('click', 'button.od-skip', function(){
			var secsOffset = $(this).attr('data-offset');
						radioplayer.controls.showLoader();
						radioplayer.controls.seekOffset(secsOffset);
		});

		$(document).bind("contextmenu", function(e) {
			radioplayer.utils.output("version:"+radioplayer.emp.getVersion());
		});
	}
};
function createVideoHtml() {
  var isiPad = navigator.userAgent.match(/iPad/i) != null;
  var attributes = 'autoplay';
  if (radioplayer.consts.is_iOS && isiPad) {
    attributes = 'playsinline autoplay';
  }
  var html = '<div class="vast-container" id="vast-container">\
			<div id="ima-video-container">\
				<video id="video-element" '+ attributes +'>\
				</video>\
			</div>\
			<div id="ima-ad-container" class="companion-container">\
      </div>\
      <div id="ima-play-button">\
        <div id="ima-play-icon">\
          <div id="ima-play-icon-triangle"></div>\
        </div>\
        <div id="ima-play-text">\
          Play advert\
        </div>\
      </div>\
      <div id="ima-skip-button">\
        Skip\
      </div>\
    </div>';

  var width = 720;
  var height = 665;
  radioplayer.utils.resizeViewPort(720, 665);
  
  radioplayer.services.overlay.vast(html, true);
}

/**
 * Initialises the ad container and the ad loader.
 * This is called regardless of whether autoplay is
 * enabled, and before we even have any ads.
 */
function setUpIMA() {
  var el = document.getElementById('ima-ad-container');
  // Initialise the IMA SDK
  radioplayer.ima.adContainer = new google.ima.AdDisplayContainer(el, radioplayer.ima.videoContent);
  radioplayer.ima.adsLoader = new google.ima.AdsLoader(radioplayer.ima.adContainer);

  // Add listeners
  radioplayer.ima.adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false);
  radioplayer.ima.adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false);
}

/**
 * Initialises the ad container and the ad loader.
 * Called from init, this checks whether the 
 * video element we have (with a 1 sec video) can
 * play.
 * It sets a variable, and whether autoplay is
 * enabled or not, it calls the next function to
 * load the advert.
 */
function checkAutoplaySupport() {
  var playbackTestTimeout = null;
  var testsComplete = false;
  var playPromise = radioplayer.ima.videoContent.play();
  if (playPromise !== undefined) {
    playPromise.then(function () {
      testsComplete = true;
      clearTimeout(playbackTestTimeout);    
      radioplayer.ima.videoContent.pause();
      radioplayer.ima.autoplayAllowed = true;
      autoplayChecksResolved();
    }).catch(function () {
      testsComplete = true;
      clearTimeout(playbackTestTimeout);
      radioplayer.ima.videoContent.pause();
      radioplayer.ima.autoplayAllowed = false;
      autoplayChecksResolved();
    });
  }
  else {
    playbackTestTimeout = setTimeout(function () {
      if (!testsComplete) {
        radioplayer.ima.videoContent.pause();
        radioplayer.ima.autoplayAllowed = false;
        autoplayChecksResolved();
      }
    }, 500)
  }

}

/**
 * Requests the advert based on the supplied URL.
 * 
 * When the advert is returned and loaded, the
 * listener function onAdsManagerLoaded is called
 * (as defined in setUpIMA), and the content is 
 * handled.
 */
function autoplayChecksResolved() {
  // Request video ads.
  var adsRequest = new google.ima.AdsRequest();

  /** If we already have a response (from vast.js via 
   * vast-client - we likely will) then we ask the IMA
   * SDK to process this.
   * Alternatively, we ask the IMA SDK to request a new
   * ad from our specified url
   * */
  var length = radioplayer.vast.vastResponse.length;
  if (length) {
    var tracking = [];
    var clicks = [];
    var impressions = [];
    var inlineRef = -1;

    // If we have more than one xml doc, we need to 
    // attempt to merge them together. To do this, we 
    // look for any Tracking Events, Impressions, or
    // video-click events in any Wrapper documents, and
    // we extract those (so that we can later add them
    // in to any InLine doc elements we have).
    // Note: if we only have one xml document, we will
    /// later simply pass that in to the IMA SDK directly.
    if (length > 1) {
      for (var i = 0; i < length; i++) {
        var xml = radioplayer.vast.vastResponse[i];
        var ads = xml.getElementsByTagName("Ad");

        if (ads && ads.length) {
          for (var a = 0; a < ads.length; a++) {
            var ad = ads[a];
            if (ad.getElementsByTagName("Wrapper").length) {
              var impressionEls = ad.getElementsByTagName("Wrapper")[0].getElementsByTagName("Impression");
              if (impressionEls.length) {
                for (var b = 0; b < impressionEls.length; b++) {
                  impressions.push(impressionEls[b]);
                }
              }

              var creativeWrapper = ad.getElementsByTagName("Wrapper")[0].getElementsByTagName("Creatives");
              if (creativeWrapper && creativeWrapper.length) {
                var creatives = creativeWrapper[0].getElementsByTagName('Creative');
                if (creatives && creatives.length) {
                  for (var j = 0; j < creatives.length; j++) {
                    var creative = creatives[j];
                    var linear = creative.getElementsByTagName('Linear');
                    if (linear && linear.length) {
                      for (var k = 0; k < linear.length; k++) {
                        if (linear[k].getElementsByTagName('TrackingEvents').length) {
                          tracking.push(linear[k].getElementsByTagName('TrackingEvents'));
                        } // if <TrackingEvents>
                        if (linear[k].getElementsByTagName('VideoClicks').length) {
                          clicks.push(linear[k].getElementsByTagName('VideoClicks'));
                        } // if <VideoClicks>
                      } // for each <Linear>
                    } // if <Linear>
                  } // for each <Creative>
                } // if <Creative>s
              } // if <Creatives>
            } // if <Wrapper>
            else if (ad.getElementsByTagName("InLine").length && inlineRef < 0) {
              inlineRef = i;
            } // else if <InLine>
          } // for each <Ad>
        } // if <Ad>
        //str += new XMLSerializer().serializeToString(ad);
      } // For each xml response
    }

    // If we have an xml doc with an InLine node, we want to
    // add any events we have extracted above into this document.
    if (inlineRef >= 0) {
      var xml = radioplayer.vast.vastResponse[inlineRef];
      var ads = xml.getElementsByTagName("Ad");
      if (ads && ads.length) {
        var ad = ads[0];
        if (ad.getElementsByTagName("InLine").length) {
          // Add impression tags
          if (impressions && impressions.length) {
            var impLength = impressions.length;
            for (var im = 0; im < impLength; im++) {
              ad.getElementsByTagName("InLine")[0].appendChild(impressions[im]);
            }   
          }

          var creativeWrapper = ad.getElementsByTagName("InLine")[0].getElementsByTagName("Creatives");
          if (creativeWrapper && creativeWrapper.length) {
            var creatives = creativeWrapper[0].getElementsByTagName('Creative');
            if (creatives && creatives.length) {
              var creative = creatives[0];
              var linear = creative.getElementsByTagName('Linear');
              if (linear && linear.length) {
                // If this does not already have a TrackingEvents node,
                // then create one and append it
                if (!linear[0].getElementsByTagName('TrackingEvents').length){
                  var child = document.createElementNS('http://www.w3.org/1999/xhtml',"TrackingEvents");
                  linear[0].appendChild(child);                
                }
                // Grab the TrackingEvents tag
                var container = linear[0].getElementsByTagName('TrackingEvents')[0];

                // Go through each each of our existing tracking arrays
                var trackingArrayLength = tracking.length;
                for (var x = 0; x < trackingArrayLength; x++) {
                  var els = tracking[x][0].getElementsByTagName('Tracking');
                  $(els).each(function(index) {
                    container.appendChild(this);
                  }); // for tracking elements
                } // for tracking arrays

                // If this does not already have a VideoClicks node,
                // then create one and append it
                if (!linear[0].getElementsByTagName('VideoClicks').length) {
                  var child = document.createElementNS('http://www.w3.org/1999/xhtml', "VideoClicks");
                  linear[0].appendChild(child);
                }
                // Grab the TrackingEvents tag
                var clicksContainer = linear[0].getElementsByTagName('VideoClicks')[0];

                var clicksArraysLength = clicks.length;
                for (var x = 0; x < clicksArraysLength; x++) {
                  var clickThroughEls = clicks[x][0].getElementsByTagName('ClickThrough');
                  $(clickThroughEls).each(function (index) {
                    clicksContainer.appendChild(this);
                  }); // for tracking elements

                  var clickTrackingEls = clicks[x][0].getElementsByTagName('ClickTracking');
                  $(clickTrackingEls).each(function (index) {
                    clicksContainer.appendChild(this);
                  }); // for tracking elements

                  var customClickEls = clicks[x][0].getElementsByTagName('CustomClick');
                  $(customClickEls).each(function (index) {
                    clicksContainer.appendChild(this);
                  }); // for tracking elements
                }
              }
            }
          }
        }
      }
    }
    else {
      // Set the first document to be used: it can then
      // simply be handled by the IMA SDK
      inlineRef = 0;
    }

    // We have merged the xml docs, so now we serialise them
    // and add them to our adsRequest
    adsRequest.adsResponse = new XMLSerializer().serializeToString(radioplayer.vast.vastResponse[inlineRef]);
  }
  else {
    // We do not have an existing vast doc, so pass in
    // a VAST URL
    adsRequest.adTagUrl = radioplayer.vast.vastTag;
  }

  radioplayer.ima.adsLoader.requestAds(adsRequest);
}

/**
 * The ads have loaded, so if autoplay is enabled, 
 * play the ads, and if not, show the play button.
 */
function onAdsManagerLoaded(adsManagerLoadedEvent) {
  radioplayer.ima.adsManager = adsManagerLoadedEvent.getAdsManager(radioplayer.ima.videoContent);
  // Add event listeners
  radioplayer.ima.adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    onContentResumeRequested);
  radioplayer.ima.adsManager.addEventListener(
    google.ima.AdEvent.Type.COMPLETE,
    adComplete);
  radioplayer.ima.adsManager.addEventListener(
    google.ima.AdEvent.Type.STARTED,
    adStarted);
  radioplayer.ima.adsManager.addEventListener(
    google.ima.AdEvent.Type.CLICK,
    adClicked);

  radioplayer.ima.videoContent.addEventListener('webkitendfullscreen', function() {
    radioplayer.ima.skipButton.style.display = 'block';
  });

  var events = ['ALL_ADS_COMPLETED', 'CONTENT_RESUME_REQUESTED', 'CONTENT_PAUSE_REQUESTED', 'DURATION_CHANGE', 'FIRST_QUARTILE', 'IMPRESSION', 'INTERACTION', 'LINEAR_CHANGED', 'LOG', 'MIDPOINT', 'PAUSED', 'RESUMED', 'SKIPPABLE_STATE_CHANGED', 'SKIPPED', 'THIRD_QUARTILE', 'USER_CLOSE', 'VOLUME_CHANGED', 'VOLUME_MUTED', 'LOADED', 'AD_METADATA', 'AD_BREAK_READY'];
  var length = events.length;
  for (var i = 0; i < length; i++) {
    radioplayer.ima.adsManager.addEventListener(
      google.ima.AdEvent.Type[events[i]],
      miscAdEvent);
  }
  
  if (radioplayer.ima.autoplayAllowed) {
    playAds();
  }
  else {
    radioplayer.ima.playButton.style.display = 'block';
  }
}

function playButtonClick() {
  radioplayer.ima.adContainer.initialize();
  radioplayer.ima.adsInitialized = true;
  radioplayer.ima.playButton.style.display = 'none';
  
  radioplayer.ima.videoContent.load();
  radioplayer.ima.videoContent.addEventListener(
  'loadedmetadata', function() {
    if (radioplayer.ima.hasLoaded) {
      return;
    }
    radioplayer.ima.hasLoaded = true;
    playAds();      
  });
}


/**
 * Initialise the ad container and manager
 * (with size), and start the ad.
 */
function playAds() {
  try {
    if (!radioplayer.ima.adsInitialized) {
      radioplayer.ima.adContainer.initialize();
      radioplayer.ima.adsInitialized = true;
    }
    // Determine width and height
    var actualWidth = radioplayer.utils.getViewportWidth();
    if (radioplayer.vast.vastSize.width > actualWidth) {
      radioplayer.vast.vastSize.width = actualWidth;
      radioplayer.vast.vastSize.height = $('.radioplayer-plugin').height();
    }

    // Start the ads
    radioplayer.ima.adsManager.init(radioplayer.vast.vastSize.width, radioplayer.vast.vastSize.height, google.ima.ViewMode.NORMAL);
    radioplayer.ima.adsManager.start();
  } catch (adError) {
    finishAds();
  }
}


function adStarted(adEvent) {
  var ad = adEvent.getAd();
  var selectionCriteria = new google.ima.CompanionAdSelectionSettings();
  selectionCriteria.resourceType = google.ima.CompanionAdSelectionSettings.ResourceType.ALL;
  selectionCriteria.creativeType = google.ima.CompanionAdSelectionSettings.CreativeType.ALL;
  selectionCriteria.sizeCriteria = google.ima.CompanionAdSelectionSettings.SizeCriteria.IGNORE;

  // Get a list of companion ads for an ad slot size and CompanionAdSelectionSettings
  var companionAds = ad.getCompanionAds(radioplayer.vast.vastSize.width, radioplayer.vast.vastSize.height, selectionCriteria);

  // Set duration and close timeout
  if (radioplayer.vast.showSkipButton) {
    var potentialDuration = ad.getDuration();
    if (potentialDuration && potentialDuration < 100) {
      radioplayer.ima.rawDuration = potentialDuration;
      radioplayer.vast.duration = (potentialDuration + radioplayer.vast.skipButtonBuffer) * 1000;
    }

    var duration = radioplayer.vast.duration || 33000;
    radioplayer.vast.closeTimeout = setTimeout(function () {
      var remaining = radioplayer.ima.adsManager.getRemainingTime();
      if (radioplayer.ima.rawDuration <= remaining) {
        radioplayer.ima.skipButton.style.display = 'block';
      }
    }, duration);
  }

  radioplayer.ima.hasStarted = true;
}

/**
     * We want to pause VAST ads when clicked: the IMA SDK does
     * not handle this automatically. As it is hard to programmatically
     * distinguish between ads that auto-pause and ads that don't, we
     * have to do a slightly hacky detection of whether the ad has 
     * already auto-paused after a click.
     * To do this, we set a timeout to detect whether the pause event
     * has been fired (automatically) within the SDK after a small timeout.
     * If it hasn't, we want to manually pause the ad, and then add
     * an overlay that will allow users to restart the ad if they so wish.
     */
function adClicked(event) {
  if (!radioplayer.ima.paused) {
    radioplayer.ima.pauseTimeout = setTimeout(function () {
      if (!radioplayer.ima.paused) {
        manuallyPauseVideo();
      }
    }, 500);
  }  
}

/**
 * Called when the ad doesn't auto-pause after an ad click.
 * This function pauses the ad, and then adds an overlay 
 * (with event listener) that can later resume the ad on
 * a second click.
 */
function manuallyPauseVideo() {
  radioplayer.ima.paused = true;
  radioplayer.ima.adsManager.pause();
  $('#vast-container').append('<div id="vast-controls-overlay">\
    <div id="ima-play-button">\
        <div id="ima-play-icon">\
          <div id="ima-play-icon-triangle"></div>\
        </div>\
        <div id="ima-play-text">\
          Play advert\
        </div>\
      </div>\
    </div>')

  $('#vast-controls-overlay').on('click', function() {
    clearTimeout(radioplayer.ima.pauseTimeout);
    radioplayer.ima.adsManager.resume();
    radioplayer.ima.paused = false;
    $(this).remove();
  });
}


/**
 * This SDK event gets fired when the ad has finished and the
 * main 'content' is ready to resume.
 * We use this event to destroy the ad instance, after a small
 * timeout (we use this event (rather than adcomplete) plus a timeout
 * because it is the only way to ensure that ad end events are
 * successfully fired)
 */
function onContentResumeRequested() {
  setTimeout(function() {
    if (radioplayer.ima.adsManager) {
      radioplayer.ima.adsManager.destroy();
    }
    radioplayer.services.overlay.hide();
  }, 500);  
}

/** Triggered by the SDK */
function adComplete() {
  finishAds();
}

function miscAdEvent(adEvent) {
  if (adEvent.type === 'pause') {
    radioplayer.ima.paused = true;
  }
  else if (adEvent.type === 'resume') {
    clearTimeout(radioplayer.ima.pauseTimeout);
    radioplayer.ima.paused = false;
  }
}

function skipAd() {
  radioplayer.ima.adsManager.skip();
  radioplayer.ima.adsManager.stop();
  finishAds();
}

function finishAds() {
  radioplayer.ima.hasStarted = false;
  radioplayer.ima.hasLoaded = false;
  radioplayer.utils.resizeViewPort(380, 665);
  vastAds.shownVideo = true;

  if (radioplayer.vast.closeTimeout) {
    clearTimeout(radioplayer.vast.closeTimeout);
  }
  
  /// We can now start the stream
  radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
  radioplayer.emp.dataReady();

  //radioplayer.ima.adsManager.stop();
  radioplayer.ima.adsLoader.contentComplete();
}

function onAdError(adErrorEvent) {
  finishAds();
}



radioplayer.ima = {
  isVpaid: false,
  adsInitialized: false,
  videoContent: null,
  playButton: null,
  skipButton: null,
  adContainer: null,
  adsManager: {},
  autoplayAllowed: false,

  hasLoaded: false,
  hasStarted: false,

  rawDuration: 0,

  init: function (vpaid) {
    if (vpaid) {
      radioplayer.ima.isVpaid = true;
      google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
    }

    // Create video player, companion, and
    // playe button html
    createVideoHtml();

    // Get reference to html elements, and 
    // add any required attributes
    radioplayer.ima.playButton = document.getElementById('ima-play-button');
    // Hide the play button until we need it
    radioplayer.ima.playButton.style.display = 'none';
    radioplayer.ima.videoContent = document.getElementById('video-element');
    radioplayer.ima.skipButton = document.getElementById('ima-skip-button');
    // Give the video some dummy content, to test autoplay
    radioplayer.ima.videoContent.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

    // Add an event listener in case the play
    // button is needed
    radioplayer.ima.playButton.addEventListener('click', playButtonClick);
    radioplayer.ima.skipButton.addEventListener('click', skipAd);

    setUpIMA();
    checkAutoplaySupport();
  }
};function ajaxUtil(url, onLoadCallback, progressCallback) {
  var xmlhttp;

  if (window.XDomainRequest) {
    xmlhttp = new XDomainRequest();
  }
  else if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  }
  else {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onload = function () {
    pendingXDR = [];
    if (onLoadCallback) {
      onLoadCallback(xmlhttp.responseXML);
    }
  };

  xmlhttp.open("GET", url, true);
  //xmlhttp.withCredentials = true;
  xmlhttp.onerror = function (err) { }; // Create empty functions, to add IE reliability
  xmlhttp.onprogress = function (data, res) {
    if (data.srcElement && data.srcElement.response && progressCallback) {
      progressCallback(data);
    }
  };
  xmlhttp.ontimeout = function () { };
  xmlhttp.send();
}

function guid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function parseStreamDataResponse(data) {
  var obj = {};
  // Parse XML response

  // This determines the transport, eg http
  var transport = data.getElementsByTagName("transport");
  for (var h = 0; h < transport.length; h++) {
    if (transport[h] && transport[h].innerHTML && transport[h].innerHTML !== 'hls' && transport[h].innerHTML !== 'hlsts') {
      obj.transport = transport[h].innerHTML;
    }
  }

  var server = data.getElementsByTagName("server");
  for (var g = 0; g < server.length; g++) {
    // IPs
    var ips = server[g].getElementsByTagName("ip");
    for (var f = 0; f < ips.length; f++) {
      obj.ip = ips[f].innerHTML;
    }
    // Ports
    var ports = server[g].getElementsByTagName("port");
    for (var e = 0; e < ports.length; e++) {
      obj.port = ports[e].innerHTML;
    }
  }

  // Get the mount
  // "Triton Digital provides the mount name when a new mount is configured. The value is case-sensitive." eg "S3_FLV_MP3"
  var mount = data.getElementsByTagName("mount");
  for (var d = 0; d < mount.length; d++) {
    obj.mount = mount[d].innerHTML;
  }
  

  var ext = '.aac';
  var audioType = 'aac';
  if (obj.mount.indexOf('MP3') > -1) {
    ext = '.mp3';
    audioType = 'http';
  }

  var url = obj.transport + '://';
  url += obj.ip + ':';
  url += obj.port + '/';
  url += obj.mount;

  return { 'url': url, 'audioType': audioType, 'audioExtension': ext };
}

var _console = {
  log: function(msg) {
    if (radioplayer.triton.DEBUG) {
      console.log('[TRITON]: '+msg);
    }
  }
}

radioplayer.triton = {
  DEBUG: false,
  OD: false,

	/**
	 * Initialisation for AdsWizz support.
	 *
	 * @method init
	 */
  init: function (isLive) {
    /* Generates/gets a cookie as per
    https://userguides.tritondigital.com/spc/stream/cookie_synchronization_sg.htm */
    jQuery.ajax({
      url: 'http://playerservices.live.streamtheworld.com/api/idsync.js?stationId=' + tritonAds.stationId,
      dataType: 'script',
      async: true,
      cache: false,
      xhrFields: {
        withCredentials: true
      },
      beforeSend: function (xhr) {
        xhr.withCredentials = true;
      },
      crossDomain: true,
      success: function (data, status, xhr) {
        radioplayer.triton.OD = !isLive;
        if (radioplayer.triton.OD || tritonAds.forceOD) {
          radioplayer.triton.initOD();
        }
        else {
          radioplayer.triton.initStream();
        }
      }
    });
  },

  initOD: function() {
    vastAds.vastTag = tritonAds.tritonBase + '/ondemand/ars?type=preroll&stid=' + tritonAds.stationId + '&fmt=vast&ua=2Day%20FM/370%20CFNetwork/758.5.3%20Darwin/15.6.0';
    vastAds.enabled = true;
    radioplayer.vast.init();
  },

  initStream: function() {
    var url = tritonAds.tritonBase + '/api/livestream?version=1.9&';
    if (tritonAds.stationName) {
      url += 'station=' + tritonAds.stationName;
    }
    else if (tritonAds.tritonMount) {
      url += 'mount=' + tritonAds.tritonMount;
    }

    ajaxUtil(url, radioplayer.triton.processStream);
  },

  processStream: function (data) {
    // We have a big messy xml response: from this
    // we need to extract an audio url.
    var obj = parseStreamDataResponse(data);
    var url = obj.url;
    var audioExtension = obj.audioExtension;    
    var audioType = obj.audioType;
    // We need a session ID (to link audio and metadata urls)
    var sessionId = guid();
    // Set this as our player's audio url, and
    // then initialise our player.
    window.audioArray[0].audioUrl = url + audioExtension + '?sbmid=' + sessionId;
    window.audioArray[0].audioType = audioType;
    radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
    radioplayer.emp.dataReady();

    // ***************************** METADATA *****************************
    // Open a request for sideband metadata
    // See 
    // https://userguides.tritondigital.com/spc/stream/index.html?sideband_metadata.htm
    // for the logic on how these URLs should be 
    // constructed and (to an extent) handled
    // ********************************************************************
    var sse = null;
    var metadata = data.getElementsByTagName("metadata");
    for (var i = 0; i < metadata.length; i++) {
      var sses = metadata[i].getElementsByTagName("sse-sideband");
      for (var j = 0; j < sses.length; j++) {
        sse = sses[j].getAttribute('metadataSuffix');
      }
    }

    ajaxUtil(url + sse + '?sbmid=' + sessionId, null, radioplayer.triton.parseSidebandMetadata);
  },

  parseSidebandMetadata: function (data) {
    // Parse the data string we get back in
    // our onprogress response.
    var str = '';
    if (data.srcElement.response.indexOf('data:') > -1) {
      str = data.srcElement.response.split('\n').join('');
      str = str.split('data:').join('');
      str = str.split('{	"type"');
      var arr = [];
      for (var i = 0; i < str.length; i++) {
        if (str[i] && str[i].length > 1) {
          str[i] = '{	"type"' + str[i];
          arr.push(JSON.parse(str[i]));
        }
      }
    }

    // The most recent cuepoint can be handled
    // in handleSideband ad, if indeed it's an advert!
    if (arr.length && arr[arr.length - 1] && arr[arr.length - 1].name && arr[arr.length - 1].name === 'ad') {
      radioplayer.triton.handleSidebandAd(arr[arr.length - 1]);
    }
  },

  handleSidebandAd: function (item) {
    item.parameters = item.parameters || {};
    if (item.parameters.ad_vast) {
    }
    else if (item.parameters.ad_vast_url) {
      vastAds.enabled = true;
      vastAds.vastTag = item.parameters.ad_vast_url;
      radioplayer.vast.init(parseInt(item.parameters.cue_time_duration, 10));

    }
    else if (item.parameters.ad_url) {
    }
  }
};var vastTests = [];

var customVastURLHandler = (function () {
	function customXHRURLHandler() { }
	customXHRURLHandler.currentVast = [];

	// Run test if XHR is supported
	customXHRURLHandler.xhr = function () {
		var xhr;
		xhr = new window.XMLHttpRequest();
		if ('withCredentials' in xhr) {
			return xhr;
		}
	};

	// (Required) run by vast-client, returns if "custom handler" is supported
	customXHRURLHandler.supported = function () {
		return !!this.xhr();
	};

	customXHRURLHandler.shouldMakeRequest = function (url) {
		for (var i = customXHRURLHandler.currentVast.length - 1; i >= 0; i--) {
			var previousRequest = customXHRURLHandler.currentVast[i];
			if (previousRequest.url === url) {
				return previousRequest.response;
			}
		}
		return false;
	};

	/**
	 * Saves the current request and compares subsequent requests to
	 * avoid duplication
	 */
	customXHRURLHandler.get = function (url, options, cb) {
		var duplicateRequest = this.shouldMakeRequest(url);

		if (duplicateRequest) {
			/*
			 * This is weird, the callback needs to be pushed off the callstack, it was
			 * expecting a promise which would have done this however to keep support for
			 * IE we have simply done a setTimeout with a delay of a single frame (13ms)
			 * without this the return happens too early which triggers a second video request
			 * before the code can handle it and results in the second request being
			 * immediately paused and not played again.
			 */
			setTimeout(function () {
				cb(null, duplicateRequest)
			}, 13);
			return null;
		}
		else {
			var xhr;
			if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
				return cb(new Error('Cannot go from HTTPS to HTTP.'));
			}
			try {
				xhr = this.xhr();
				xhr.open('GET', url);
				xhr.timeout = options.timeout || 0;
				xhr.withCredentials = options.withCredentials || false;
				xhr.overrideMimeType && xhr.overrideMimeType('text/xml');
				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						customXHRURLHandler.currentVast.push({
							url: url,
							response: xhr.responseXML,
						});

						radioplayer.vast.vastResponse.push(xhr.responseXML);
						return cb(null, xhr.responseXML);
					}
				};
				return xhr.send();
			} catch (_error) {
				return cb();
			}
		}
	};

	return customXHRURLHandler;
})();

function vastDataPromise(vastUrl) {
	var def = $.Deferred();

	var failTimeout = setTimeout(function () {
		def.reject()
	}, 5000);

	// Set options, in line 
	// with https://github.com/dailymotion/vast-client-js/blob/master/docs/client.md
	var options = { withCredentials: true }
	options.urlhandler = radioplayer.consts.customVastURLHandler || customVastURLHandler;
	DMVAST.client.get(vastUrl, options, function (response) {
		if (response) {
			clearTimeout(failTimeout);
			def.resolve(response);
		}
		else {
			clearTimeout(failTimeout);
			def.reject();
		}
	});

	return def.promise();
}

function canPlayVideo(mimeType, codec) {
	var canPlay = 'no';
	// create temp video element for playback test
	var el = document.createElement('video');

	if ('function' !== typeof el.canPlayType) {
		canPlay = 'no';
	}
	else {
		if ((null === codec) || ('' === codec) || ('undefined' === typeof codec)) {
			canPlay = el.canPlayType(mimeType);
		} else {
			canPlay = el.canPlayType(mimeType + ';codecs="' + codec + '"');
		}
	}

	el = null;
	canPlay = canPlay || 'no';
	return canPlay;
};

function parseVastResponse(res) {
	var advert = {};
	advert.ad = '';
	advert.adType = '';
	advert.creative = '';
	advert.companion = '';
	advert.companionType = '';
	for (var adIdx = 0; adIdx < res.ads.length; adIdx++) {
		var adv = res.ads[adIdx];
		for (var creaIdx = 0; creaIdx < adv.creatives.length; creaIdx++) {
			var crv = adv.creatives[creaIdx];

			switch (crv.type) {
				case 'linear':
					for (var mfIdx = 0; mfIdx < crv.mediaFiles.length; mfIdx++) {
						var mediaFile = crv.mediaFiles[mfIdx];
						if ((mediaFile.width <= radioplayer.vast.maxAdSize.width) && (mediaFile.height <= radioplayer.vast.maxAdSize.height)) {
							if ('application/x-shockwave-flash' === mediaFile.mimeType) {
								advert.ad = adv;
								advert.mediaFile = mediaFile;
								advert.creative = crv;
								advert.adType = 'flash';
								break;
							}
							else if ('audio/mpeg' === mediaFile.mimeType) {
								advert.ad = adv;
								advert.mediaFile = mediaFile;
								advert.creative = crv;
								advert.adType = 'audio';
								break;
							}
							else if ('application/javascript' === mediaFile.mimeType) {
								advert.ad = adv;
								advert.mediaFile = mediaFile;
								advert.creative = crv;
								advert.adType = 'video';
								advert.tryIMA = true;
								break;
							}
							else {								
								if (('probably' === canPlayVideo(mediaFile.mimeType, mediaFile.codec)) || ('maybe' === canPlayVideo(mediaFile.mimeType, mediaFile.codec))) {
									advert.ad = adv;
									advert.mediaFile = mediaFile;
									advert.creative = crv;
									advert.adType = 'video';
									break;
								}
							}
						}
					}
					break;

				case 'non-linear':
					// NOT SUPPORTED
					break;

				case 'companion':
					for (var cpIdx = 0; cpIdx < crv.variations.length; cpIdx++) {
						var companionAd = crv.variations[cpIdx];

						if ((companionAd.width <= radioplayer.vast.maxCompanionSize.width) && (companionAd.height <= radioplayer.vast.maxCompanionSize.height)) {
							switch (companionAd.type) {
								case 'image/gif':
								case 'image/png':
								case 'image/jpg':
								case 'image/jpeg':
									advert.companion = companionAd;
									advert.companionType = 'image';
									break;

								case 'text/html':
									advert.companion = companionAd;
									advert.companionType = 'html';
									break;

								default:
									advert.companion = companionAd;
									advert.companionType = 'iframe';
									break;
							}
						}
					}
					break;

				default:
					break;
			}
		}
	} // for

	return advert;
};

function returnCompanionHtml(advert) {
	var html;

	if (advert.companionType === 'image') {
		html = '<div>\
			<a target="_blank" href="'+ advert.companion.companionClickThroughURLTemplate + '">\
				<img src="'+ advert.companion.staticResource + '" width="' + advert.companion.width + '"\ height="' + advert.companion.height + '"/>\
			</a>\
		</div>';
	}
	else if (advert.companionType === 'text') {
		html = '<div>' + advert.companion.htmlResource + '</div>'
	}
	else if (advert.companion.iframeResource) {
		var src = advert.companion.staticResource || advert.companion.iframeResource;
		html = '<div>\
			<iframe src="'+ src + '" width="' + advert.companion.width + '" height="' + advert.companion.height + '">\
		</div>'
	}
	else {
		html = '<div>' + advert.companion.htmlResource + '</div>'
	}

	return html;
}

var errors = {
	gettingVastData: function (err) {
		radioplayer.vast.dispose();
	},
	noAdContent: function (res) {
		radioplayer.vast.dispose();
	}
}

radioplayer.vast = {
	/**	
	 * Determines whether or not to show 
	 * a forced skip button on video ads,
	 * in case of frozen/broken ads blocking 
	 * access to the radio stream.
	 * The button will show after (advert 
	 * duration + n seconds (set below)).
	 * It is not recommended you disable
	 * this setting.
	 * [ This setting can be edited in the vastAds
	 * object in index.html]
	 */
	showSkipButton: true,
	/**	
	 * The skip button described above shows 
	 * after (advert duration + n seconds). The
	 * value here represents the n seconds.
	 * [ This setting can be edited in the vastAds
	 * object in index.html]
	 */
	skipButtonBuffer: 3,
	// Consts
	maxAdSize: {
		width: 1000,
		height: 700
	},
	maxCompanionSize: {
		width: 720,
		height: 527
	},
	vastSize: {
		width: 0,
		height: 0
	},
	// Settings
	enabled: false,
	vastTag: null,

	// References
	autoplayTimeout: null,
	closeTimeout: null,
	vastResponse: [],

	// Functions
	init: function () {
		this.enabled = vastAds.enabled || false;
		this.vastTag = vastAds.vastTag || '';
		if (vastAds.disableSkipButton && vastAds.disableSkipButton !== 'false') {
			this.showSkipButton = false;
		}
		if (vastAds.skipButtonBuffer) {
			this.skipButtonBuffer = vastAds.skipButtonBuffer;
		}

		// Temporary test function to override
		// vast tags if querystring is available
		if (radioplayer.querystring && radioplayer.querystring.vast) {
			var i = parseInt(radioplayer.querystring.vast, 10)
			this.vastTag = vastTests[i];
		}

		if (!this.enabled || !this.vastTag) {
			return;
		}

		radioplayer.vast.vastSize.width = radioplayer.vast.maxCompanionSize.width;
		radioplayer.vast.vastSize.height = radioplayer.vast.maxCompanionSize.height;

		this.getVastData(this.vastTag);
	},

	getVastData: function (vastUrl) {
		// Call the Vast client to get response data
		vastDataPromise(vastUrl).done(radioplayer.vast.gotVastData).fail(errors.gettingVastData)
	},

	gotVastData: function (res) {
		if (!res || !res.ads) {
			return errors.noAdContent(res);
		}

		var advert = parseVastResponse(res);

		if (advert && advert.ad) {
			radioplayer.vast.startPlayer(advert, advert.companion);
		}
		else if (advert && advert.companion) {
			radioplayer.vast.companionOnly(advert);
		}
		else {
			radioplayer.ima.init(true);
		};
	},

	startPlayer: function (advert, companion) {
		if (advert.adType === 'video') { // advert.adType === 'audio'
			radioplayer.ima.init(false);
		}
		else if (advert.adType === 'audio') { // advert.adType === 'audio'
			radioplayer.ima.init(false);
		}
		else if (advert.adType === 'flash') { // advert.adType === 'audio'
			this.initIFrame(advert, companion);
		}
	},
	initAdvertAudio: function (advert, companion) {
		if (!advert.mediaFile || !advert.mediaFile.fileURL) {
			return radioplayer.vast.dispose();
		}

		var obj = {
			audioUrl: advert.mediaFile.fileURL,
			audioType: advert.mediaFile.mimeType || null
		};

		window.audioArray.unshift(obj);

		radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
		radioplayer.emp.dataReady();
	},

	companionOnly: function (advert) {
		// If we have a static resource, we want to play it 
		// in an embedded file, as we generate in the initIFrame
		// function
		if (advert.companionType === 'iframe' && advert.companion.staticResource) {
			advert.mediaFile = advert.companion;
			advert.mediaFile.fileURL = advert.companion.staticResource;
			return radioplayer.vast.initIFrame(advert)
		}

		// Get html based on what type of companion we have
		var companionHtml = returnCompanionHtml(advert);
		var playerHTML = '<div class="vast-container" id="vast-container">\
			<div id="vast-companion-container" class="companion-container">\
				'+ companionHtml + '\
			</div>\
		</div>';

		// Add companion to the console
		window.resizeTo(720, 665);
		radioplayer.services.overlay.vast(playerHTML, true);

		// Set a close timeout to auto-close
		// the overlay when duration completes
		var duration = radioplayer.vast.duration || 30000;
		radioplayer.vast.closeTimeout = setTimeout(function () {
			radioplayer.vast.dispose();
		}, duration)
	},

	initIFrame: function (advert) {
		var playerHTML;
		var horizMargin = (this.vastSize.width - advert.mediaFile.width) / 2;
		playerHTML = '<div class="vast-container" id="vast-container">';
		playerHTML += '<div class="close-vast-btn-container"><button class="close-vast-btn" id="closeVASTBtn"><span>&times;</span><label class="close-vast-btn-label accessibility-text" for="closeVASTBtn">Close Ad</label></button></div>';
		playerHTML += '<div class="vast-flash-container">'
		playerHTML += '<object class="vast-flash-obj" id="vastAdObj" style="width: ' + advert.mediaFile.width + 'px; height: ' + advert.mediaFile.height + 'px; margin: 0 ' + horizMargin + 'px;">';
		playerHTML += '<param name="movie" value="' + advert.mediaFile.fileURL + '" />';
		playerHTML += '<embed class="vast-flash-embed" id="' + this.videoPlayerId + '" src="' + advert.mediaFile.fileURL + '" style="width: ' + advert.mediaFile.width + 'px; height: ' + advert.mediaFile.height + 'px; margin: 0 ' + horizMargin + 'px;" type="application/x-shockwave-flash"></embed>';
		playerHTML += '</object>';
		playerHTML += '</div>';
		playerHTML += '</div>';
		playerHTML += '<div id="vast-companion-container" class="companion-container"></div>';

		window.resizeTo(720, 665);
		radioplayer.services.overlay.vast(playerHTML);

		$('#closeVASTBtn').on('click', function () {
			if (radioplayer.vast.closeTimeout) {
				clearTimeout(radioplayer.vast.closeTimeout);
			}
			radioplayer.vast.dispose();
		})

		var duration = radioplayer.vast.duration || 30000;
		radioplayer.vast.closeTimeout = setTimeout(function () {
			radioplayer.vast.dispose();
		}, duration)
	},

	dispose: function () {
		if (radioplayer.vast.closeTimeout) {
			clearTimeout(radioplayer.vast.closeTimeout);
		}
		radioplayer.utils.resizeViewPort(380, 665);
		radioplayer.services.overlay.hide();
		$('#vast-container').remove();

		vastAds.shownVideo = true; // TODO: check

		/// We can now start the stream
		radioplayer.emp.init(window.audioArray, window.audioLive, window.bufferTime);
		radioplayer.emp.dataReady();
	}
};

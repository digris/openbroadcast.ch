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

var vastTests = [];

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

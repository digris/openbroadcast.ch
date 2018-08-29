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
};
function ajaxUtil(url, onLoadCallback, progressCallback) {
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
};
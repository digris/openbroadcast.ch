/**
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

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

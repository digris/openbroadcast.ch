/**
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

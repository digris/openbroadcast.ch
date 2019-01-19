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
 * @name lang
 * @description Localisation resource for user-visible strings
 *
 * @author Gav Richards <gav@gmedia.co.uk>
 *
 */

radioplayer.lang_it = {

	general: {
		radioplayer: 			'Radioplayer',		// Accessibility
		open_menu: 				'Apri il menu del Radioplayer',	// Accessibility
		close_menu:				'Chiudi il menu del Radioplayer',	// Accessibility
		close_search:			'Chiudi la finestra di ricerca del Radioplayer',	// Accessibility

		fail_message:			'<h1>Si è verificato un problema...</h1>' +
								'<p><strong>Siamo spiacenti</strong>, attualmente il servizio non è disponibile. Verifica la connessione di rete.</p>' +
								'<p>Se il problema è nostro, cercheremo di risolverlo il prima possibile. Riprova più tardi.<br />Riprova più tardi</p>',

		reduced_func_anno:		'Il tuo browser non supporta tutte le funzionalità del Radioplayer.' +
								'<a href="http://www.maradio.be/cookiehelp/?mob=false" target="_blank">Modifica le impostazioni dei cookie</a>, or <a href="http://www.maradio.be/apps" target="_blank">passa alla nostra app.</a>',

	    cookie_anno:            'Il Radioplayer usa cookie per migliorare la tua esperienza d’ascolto.<br />' +
	                            'Per scoprire come, <a href="http://www.maradio.be/" target="_blank">clicca qui</a>. ' +
	                            'Se continui, accetti di ricevere tutti i cookie di Radioplayer.',

      cookie_message:          'Queste caratteristiche, insieme ad altre, utilizzano i <a href="http://www.maradio.be/cookies" target="_blank">cookies</a>. Se sei d\'accordo, continua l\’ascolto.',

      cookie_favourites_message: 'Aggiungi questa stazione ai preferiti',
  cookie_menu_message: 			'Visualizza qui i tuoi preferiti',

	},

	controls: {
		loading: 				'Caricamento in corso...',
    play_prompt:            	'Clicca su Play per iniziare l’ascolto',
		player_controls: 		'Comandi di riproduzione',		// Accessibility
		play: 					'Play',					// Accessibility
		pause: 					'Pausa',				// Accessibility
		stop: 					'Stop', 				// Accessibility
		mute: 					'Muto',					// Accessibility
		unmute: 				'Volume',				// Accessibility
		set_volume:				'Regolazione del volume',			// Accessibility
		set_volume_20: 			'Volume al 20%',	// Accessibility
		set_volume_40: 			'Volume al 40%',	// Accessibility
		set_volume_60: 			'Volume al 60%',	// Accessibility
		set_volume_80: 			'Volume al 80%',	// Accessibility
		set_volume_100: 		'Volume al 100%',	// Accessibility
		use_device_controls:	'Usa i comandi del volume sul tuo dispositivo.',
		press_play_prompt:		'Premi Play per iniziare l’ascolto',
        skip_forward_5_seconds: 'Vai avanti di 5 secondi',
        skip_back_5_seconds:    'Torna indietro di 5 secondi',
        skip_forward_30_seconds:'Vai avanti di 30 secondi',
        skip_back_30_seconds:   'Torna indietro di 30 secondi',
        skip_forward_1_minute:  'Vai avanti di 1 minuto',
        skip_back_1_minute:     'Torna indietro di 1 minuto',
        skip_forward_5_minutes: 'Vai avanti di 5 minuti',
        skip_back_5_minutes:    'Torna indietro di 5 minuti',
        skip_forward_10_minutes:'Vai avanti di 10 minuti',
        skip_back_10_minutes:   'Torna indietro di 10 minuti',
        skip_forward_30_minutes:'Vai avanti di 30 minuti',
        skip_back_30_minutes:   'Torna indietro di 30 minuti'
	},

	playing: {
		live:					'NL placeholder',
		live_width:				80,
        format:                 '{artist} - {track}'
	},

	menu_tabs: {
        sizing: [
            {
                "maxViewport" : 320, // The max viewport these tab sizing specs will apply to
                "mode": "auto"
            },
            {
                "maxViewport" : 380, // The max viewport these tab sizing specs will apply to
                "mode": "manual",
                "tabSizes": [
                    107,
                    75,
                    120,
                    78
                ]
            },
            {
                "maxViewport" : 580, // The max viewport these tab sizing specs will apply to
                "mode": "manual",
                "tabSizes": [
                    157,
                    125,
                    170,
                    128
                ]
            }
        ],
		tab_1_text: 			'Le mie stazioni',
		tab_2_text:				'Recenti',
		tab_3_text:				'Consigliate',
		tab_4_text: 			'Elenco A-Z'
	},

	recommendations: {
		locale: 				'nl_BE'
	},

	azlist: {
		alphabet_array:			['#','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        alphabet_minimised_array: [
            { "displayText" : '0-9' },
            { "displayText" : 'a-c',
              "letters" : [ 'a', 'b', 'c' ]
            },
            { "displayText" : 'd-f',
              "letters" : [ 'd', 'e', 'f' ]
            },
            { "displayText" : 'g-i',
              "letters" : [ 'g', 'h', 'i' ]
            },
            { "displayText" : 'j-l',
              "letters" : [ 'j', 'k', 'l' ]
            },
            { "displayText" : 'm-o',
              "letters" : [ 'm', 'n', 'o' ]
            },
            { "displayText" : 'p-s',
              "letters" : [ 'p', 'q', 'r', 's' ]
            },
            { "displayText" : 't-v',
              "letters" : [ 't', 'u', 'v' ]
            },
            { "displayText" : 'w-z',
              "letters" : [ 'w', 'x', 'y', 'z' ]
            }
        ],
		no_stations_beginning: 	'Non ci sono stazioni che iniziano con {letter}',
		view_stations_beginning:'Visualizza le stazioni che iniziano con {letter}',
        view_stations_from: 	'Visualizza le stazioni da ',
		a_number:				'un numero', // This is used in place of {letter} for the previous two strings, where the user is hovering over #
		no_stations: 			'Nessuna stazione inizia con questa lettera'
	},

	mystations: {
		add_this:				'Aggiungi questa stazione a "Le mie stazioni"',		// Accessibility
		remove_this:			'Rimuovi questa stazione da "Le mie stazioni"',	// Accessibility
		no_items: 				'<h1>Aggiungi a "Le mie stazioni"</h1>' +
								'<p>Non hai ancora salvato alcuna stazione.<br />Clicca sull’icona del cuore grigio vicino alle tue stazioni preferite per salvarle qui.</p>'
	},

	search: {
		search: 				'Cerca',				// Accessibility
		clear:					'Cancella i termini di ricerca',	// Accessibility
		search_radioplayer: 	'Cerca una radio in Svizzera',

		suggested_title:		'Risultati di ricerca consigliati',
		suggested_stations:		'Stazioni consigliate',
		suggested_catch_up:		'Contenuti in differita consigliati',
		show_all_results_for:	'Mostra tutti i risultati per {termini}', // {terms} will be swapped for the search string in this message

		tab_all:				'Tutti',
		tab_all_title:			'Tutti i risultati di ricerca',
		tab_live:				'In diretta',
		tab_live_title:			'Risultati di ricerca in diretta',
		tab_catchup:			'In differita',
		tab_catchup_title:		'Risultati di ricerca in differita',

		show_fewer_stations: 	'Mostra meno stazioni {group}',	// The {group} placeholder will be swapped for the name of the station group
		show_more_stations: 	'Mostra più stazioni {group}',
		show_information: 		'Mostra le informazioni',		// Accessibility
		hide_information: 		'Nascondi le informazioni',		// Accessibility

		no_all_results:			'<h1>Nessun risultato</h1>' + // {terms} will be swapped for the search string in these three messages
								'<p>Non sono stati trovati stazioni o programmi relativi a <br /><span class="terms">{termini}</span></p>' +
								'<p>Verifica l’ortografia o riprova di nuovo, utilizzando il <strong>nome della stazione</strong>, il <strong>nome del programma</strong>, o il  <strong>luogo</strong>.</p>',

		no_live_results:		'<h1>Nessun risultato</h1>' +
								'<p>Non sono state trovate stazioni relative a <br /><span class="terms">{termini</span></p>' +
								'<p>Verifica l’ortografia o riprova di nuovo, utilizzando il <strong>nome della stazione</strong>, il <strong>nome del programma</strong>, o il <strong>luogo</strong>.</p>',

		no_od_results:			'<h1>Nessun risultato</h1>' +
								'<p>Non sono stati trovati programmi relativi a <br /><span class="terms">{termini}</span></p>' +
								'<p>Verifica l’ortografia o riprova di nuovo, utilizzando il <strong>nome della stazione</strong>, il <strong>nome del programma</strong>, o il <strong>luogo</strong>.</p>',

		live: 					'Live',
		coming_up: 				'A breve',
		broadcast: 				'In differita',

		in_seconds: 			'tra qualche secondo',
		in_minute: 				'tra 1 minuto',
		in_minutes: 			'tra{n} minuti',		// {n} placeholder will be swapped for the number
		second_ago: 			'1 secondo fa',
		seconds_ago: 			'{n} secondi fa',
		minute_ago: 			'1 minuto fa',
		minutes_ago: 			'{n} minuti fa',
		hour_ago:				'1 ora fa',
		hours_ago:				'{n} ore fa',
		day_ago:				'1 giorno fa',
		days_ago:				'{n} giorni fa',
		week_ago:				'1 settimana fa',
		weeks_ago:				'{n} settimane fa',
		month_ago:				'1 mese fa',
		months_ago:				'{n} mesi fa',
		year_ago:				'1 anno fa',
		years_ago:				'{n} anni fa'
	},

	stream_error: {
		unavailable: 			'<h1>The sound of silence</h1>' +
								'<p>Si sono verificati problemi nella riproduzione audio di questa stazione. Ci scusiamo per l’inconveniente.</p>' +
								'<p>Lo stream della stazione potrebbe essersi interrotto o potrebbe essere incompatibile con il tuo dispositivo.</p>' +
								'<p>Puoi provare ad <a href="https://get.adobe.com/flashplayer/" target=”_blank”>aggiornare Flash Player</a> o a utilizzare un altro browser, ma se il tuo dispositivo non lo supporta, prova a <a href="http://www.maradio.be/apps" target=”_blank”>scaricare la nostra app gratuita</a> per smartphone e tablet.</p>',

		device_incompatible: 	'<h1>The sound of silence</h1>' +
								'<p>Radioplayer sta cercando di riprodurre in streaming l’audio di questa stazione ma potrebbe esserci un’incompatibilità con il tuo dispositivo.</p>' +
								'<p>Puoi provare ad <a href="https://get.adobe.com/flashplayer/" target=”_blank”>aggiornare Flash Player</a> o a utilizzare un altro browser, ma se il tuo dispositivo non lo supporta, prova a <a href="http://www.maradio.be/apps" target=”_blank”>scaricare la nostra app gratuita</a> per smartphone e tablet.</p>'
	}

};

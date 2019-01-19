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

radioplayer.lang_fr = {

    general: {
        radioplayer: 			'Radioplayer',		// Accessibility
        open_menu: 				'Ouvrir le Menu',	// Accessibility
        close_menu:				'Fermer le Menu',	// Accessibility
        close_search:			'Fermer la Recherche',	// Accessibility
        stations_menu:			'Menu Radios', //Accessibility
        carousel_previous:	'Précédent', //Accessibility
        carousel_next:			'Suivant', //Accessibility
        external_links:		'Liens Externes', //Accessibility
        advertisement:			'Publicité', //Accessibility

        fail_message:			'<h1>Nous avons un problème...</h1>' +
        '<p><strong>Désolé</strong>, Il y a un petit problème temporaire. Veuillez vérifier votre connection internet.</p>' +
        '<p>Si le problème est de notre côté, nous l\'avons déjà remarqué et nous travaillons dessus en ce moment.<br />Essayez à nouveau un peu plus tard.</p>',

        reduced_func_anno:		'Vous ne bénéficiez pas de l\'expérience optimale maRadio.be dans ce navigateur. ' +
        '<a href="http://www.swissradioplayer.ch/cookies/" target="_blank">Changez les paramètres de vos cookies</a>',

        cookie_anno:            'maRadio.be utilise des cookies pour améliorer l\'expérience.<br />' +
        'Pour découvrir comment, <a href="http://www.swissradioplayer.ch/cookies/" target="_blank">Cliquez ici</a>. ' +
        'Si vous continuez, nous supposerons que vous acceptez tous les cookies installés par maRadio.be'
    },

    controls: {
        loading: 				'Chargement...',
        player_controls: 		'Contrôle du Player',		// Accessibility
        play: 					'Play',					// Accessibility
        pause: 					'Pause',				// Accessibility
        stop: 					'Stop', 				// Accessibility
        mute: 					'Couper le son',					// Accessibility
        unmute: 				'Remettre le son',				// Accessibility
        set_volume:				'Changer le volume',			// Accessibility
        set_volume_20: 			'Changer le volume à 20%',	// Accessibility
        set_volume_40: 			'Changer le volume à 40%',	// Accessibility
        set_volume_60: 			'Changer le volume à 60%',	// Accessibility
        set_volume_80: 			'Changer le volume à 80%',	// Accessibility
        set_volume_100: 		'Changer le volume à 100%',	// Accessibility
        use_device_controls:	'Utilisez le système de contrôle du volume de votre dispositif.',
        press_play_prompt:		'Appuyez sur Play pour écouter',
        skip_forward_5_seconds: 'Avancer de 5 secondes',
        skip_back_5_seconds:    'Retour de 5 secondes',
        skip_forward_30_seconds:'Avancer de 30 secondes',
        skip_back_30_seconds:   'Retour de 30 secondes',
        skip_forward_1_minute:  'Avancer de 1 minute',
        skip_back_1_minute:     'Retour de 1 minute',
        skip_forward_5_minutes: 'Avancer de 5 minutes',
        skip_back_5_minutes:    'Retour de 5 minutes',
        skip_forward_10_minutes:'Avancer de 10 minutes',
        skip_back_10_minutes:   'Retour de 10 minutes',
        skip_forward_30_minutes:'Avancer de 30 minutes',
        skip_back_30_minutes:   'Retour de 30 minutes'
    },

    playing: {
        live:					'En Direct',
        live_width:				75,
        format:                 '{artist} - {track}'
    },

    songactions: {
        buy:					'Acheter',
        download:			'Télécharger',
        music:				'Musique',
        info:					'Info',
        add:					'Ajouter',
        rate:					'Evaluer',
        custom:				'Personnalisé'
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
        tab_1_text: 			'Mes Radios',
        tab_2_text:				'Récent',
        tab_3_text:				'Recommandées',
        tab_4_text: 			'Liste A-Z',
    },

    recommendations: {
        locale: 				'fr_CH'
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
        no_stations_beginning: 	'Il n\'y a pas de radios commençant par {letter}',
        view_stations_beginning:'Voir les radios commençant par {letter}',
        a_number:				'un nombre', // This is used in place of {letter} for the previous two strings, where the user is hovering over #
        no_stations: 			'Pas de radio commençant par cette lettre'
    },

    mystations: {
        add_this:				'Ajouter cette radio à Mes Radios',		// Accessibility
        remove_this:			'Supprimer cette radio de Mes Radios',	// Accessibility
        no_items: 				'<h1>Ajouter à mes Radios</h1>' +
        '<p>Vous n\'avez sauvegardé de radios jusqu\'à présent.<br />Cliquez sur l\'icone coeur en gris à coté de votre radio favorite pour la sauvegarder ici.</p>'
    },

    search: {
        search: 				'Recherche',				// Accessibility
        clear:					'Effacer les termes de la recherche',	// Accessibility
        search_radioplayer: 	'Recherche',

        suggested_title:		'Résultats de la recherche',
        suggested_stations:		'Radios Suggérées',
        suggested_catch_up:		'Podcast Suggérés',
        show_all_results_for:	'Montrez tous les résultats pour {terms}', // {terms} will be swapped for the search string in this message

        tab_all:				'Tous',
        tab_all_title:			'Tous les résultats de la recherche',
        tab_live:				'En Direct',
        tab_live_title:			'Résultats En Direct',
        tab_catchup:			'Podcast',
        tab_catchup_title:		'Résultats Podcast',

        show_fewer_stations: 	'Montrer moins de radios de {group}',	// The {group} placeholder will be swapped for the name of the station group
        show_more_stations: 	'Montrer plus de radios de {group}',
        show_information: 		'Montrer Information',		// Accessibility
        hide_information: 		'Cacher Information',		// Accessibility

        no_all_results:			'<h1>Pas de résultats</h1>' + // {terms} will be swapped for the search string in these three messages
        '<p>Nous ne trouvons pas de radios ou de programmes correspondant à <br /><span class="terms">{terms}</span></p>' +
        '<p>Vérifiez l\'orthographe ou tentez une nouvelle recherche en utilisant le nom <strong>d\'une radio</strong>, <strong>d\'un programme</strong> ou <strong>d\'une localité</strong>.</p>',

        no_live_results:		'<h1>Pas de résultats</h1>' +
        '<p>Nous ne trouvons pas de radios correspondant à <br /><span class="terms">{terms}</span></p>' +
        '<p>Vérifiez l\'orthographe ou tentez une nouvelle recherche en utilisant le nom <strong>d\'une radio</strong>, <strong>d\'un programme</strong> ou <strong>d\'une localité</strong>.</p>',

        no_od_results:			'<h1>Pas de résultats</h1>' +
        '<p>Nous ne trouvons pas de programmes correspondant à <br /><span class="terms">{terms}</span></p>' +
        '<p>Vérifiez l\'orthographe ou tentez une nouvelle recherche en utilisant le nom <strong>d\'une radio</strong>, <strong>d\'un programme</strong> ou <strong>d\'une localité</strong>.</p>',

        live: 					'En Direct',
        coming_up: 				'A venir',
        broadcast: 				'Podcast',

        in_seconds: 			'Dans quelques secondes',
        in_minute: 				'Dans 1 minute',
        in_minutes: 			'Dans {n} minutes',		// {n} placeholder will be swapped for the number
        second_ago: 			'Il y a 1 seconde',
        seconds_ago: 			'Il y a {n} secondes',
        minute_ago: 			'Il y a 1 minute',
        minutes_ago: 			'Il y a {n} minutes',
        hour_ago:				'Il y a 1 heure',
        hours_ago:				'Il y a {n} heures',
        day_ago:				'Il y a 1 jour',
        days_ago:				'Il y a {n} jours',
        week_ago:				'Il y a 1 semaine',
        weeks_ago:				'Il y a {n} semaines',
        month_ago:				'Il y a 1 mois',
        months_ago:				'Il y a {n} mois',
        year_ago:				'Il y a 1 an',
        years_ago:				'Il y a {n} ans'
    },

    stream_error: {
        unavailable: 			'<h1>The sound of silence (le son du silence)</h1>' +
        '<p>Désolé, nous avons des problèmes pour jouer le flux audio de cette radio.</p>' +
        '<p>Le flux de cette radio ne fonctionne peut être plus, ou il y a peut être un problème entre ce flux et votre dispositif.</p>' +
        '<p>Essayez plus tard ou avec un autre dispositif.</p>',

        device_incompatible: 	'<h1>The sound of silence (le son du silence)</h1>' +
        '<p>Le flux de cette radio ne fonctionne peut être plus, ou il y a peut être un problème entre ce flux et votre dispositif.</p>' +
        '<p>Essayez plus tard ou avec un autre dispositif.</p>'
    }

};
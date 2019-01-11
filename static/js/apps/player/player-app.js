import $ from "jquery";
import soundmanager from 'soundmanager2/script/soundmanager2-html5';
import APIClient from '../../api/client';

const DEBUG = false;

class PlayerApp {

  constructor(opts) {
    if (DEBUG) console.log('PlayerApp: - constructor');

    this.container = $('#bplayer_container');
    this.playlist_container = $('#bplayer_playlist_container', this.container);

    this.player = null;

    this.bindings();
    this.initialize_player();
  };

  bindings() {
    if (DEBUG) console.log('PlayerApp: - bindings');

    window.addEventListener('player:controls', (e) => {
      if (DEBUG) console.debug('player:controls', e.detail);
      this.controls(e.detail);
    }, false);


  };

  controls(payload) {
    if (DEBUG) console.log('PlayerApp: - controls', payload);

    if (payload.action === 'play') {


        // if (this.player.paused) {
        //     this.player.resume();
        // } else {
        //     this.player.pause();
        // }


      const opts = {
        url: 'https://www.openbroadcast.org/stream/openbroadcast',
        type: 'audio/mp3',
        whileplaying: (a, b, c, d, e) => {
          //console.debug('PlayerApp - whileplaying:', this.player)
        },
        onfinish: (a, b, c, d, e) => {
          console.debug('PlayerApp - onfinish:', a, b, c, d, e)
        },
        onload: (a, b, c, d, e) => {
          console.debug('PlayerApp - onload:', a, b, c, d, e)
        },
        onerror: (error, info) => {
          console.error('PlayerApp - onerror:', error, info);
        },
        onid3: (a, b, c, d, e) => {
          console.error('PlayerApp - onerror:', a, b, c, d, e);
        }
      };

      this.player.play(opts);


    }


  };

  /**********************************************************
   * initialize player backend
   **********************************************************/
  initialize_player() {
    if (DEBUG) console.debug('PlayerApp: - initialize_player');
    soundManager.setup({
      forceUseGlobalHTML5Audio: true,
      html5PollingInterval: 100,
      debugMode: DEBUG,
      onready: () => {
        if (DEBUG) console.debug('PlayerApp: - soundManager ready');
        this.player = soundManager.createSound({
          multiShot: false,
          id: 'player_app_player'
        });
        // if (this.current_item) {
        //     this.current_item.is_playing = false;
        //     this.items_to_play.forEach((item_to_play) => {
        //         item_to_play.items.forEach((item) => {
        //             item.is_playing = false;
        //         });
        //     });
        // }
      }
    });
  };


}

module.exports = PlayerApp;

import hotEmitter from 'webpack/hot/emitter'


import SiteUI from './apps/site';
import LiveColor from './apps/live-color';
import StationTime from './apps/station-time';
import PlayerApp from './apps/player/player-app';



import Vue from 'vue';
import AccountApp from './apps/account-app.vue';


// legacy apps & modules
import BPlayerApp from './legacy/bplayer';
import OnAirApp from './legacy/onair';
import AchatApp from './legacy/achat';
//import AloginApp from './legacy/alogin';

// import VueTranslate from 'vue-translate-plugin';
// Vue.use(VueTranslate);

const DEBUG = true;



hotEmitter.on("webpackHotUpdate", (currentHash) => {
    if (DEBUG) console.debug('webpackHotUpdate', currentHash);
});



class AppInitializer {

    constructor(opts) {
        if (DEBUG) console.debug('AppInitializer - constructor');
        this.apps = [];
        this.bindings();
        this.setup_apps();
        this.setup_legacy();
    };

    bindings() {
        if (DEBUG) console.debug('AppInitializer - bindings');
    };

    setup_apps() {

        // components (one time setup)
        if(this.apps['SiteUI'] === undefined) {
            this.apps['SiteUI'] = new SiteUI();
        }
        if(this.apps['LiveColor'] === undefined) {
            this.apps['LiveColor'] = new LiveColor();
        }
        if(this.apps['StationTime'] === undefined) {
            this.apps['StationTime'] = new StationTime();
        }
        // if(this.apps['PlayerApp'] === undefined) {
        //     this.apps['PlayerApp'] = new PlayerApp();
        // }

        /**************************************************************
         * Vue Apps
         **************************************************************/

        /**************************************************************
         * Account App
         **************************************************************/
        const account_app_container = document.getElementById('account_app');
        if (account_app_container) {

            const AccountComponent = Vue.extend(AccountApp);

            this.apps['AccountApp'] = new AccountComponent({
                el: account_app_container,
                propsData: account_app_container.dataset
            });
        }


    };

    setup_legacy() {

        let bplayer = new BPlayerApp();
        bplayer.debug = true;

        let onair = new OnAirApp();
        onair.debug = true;
        onair.bplayer = bplayer;
        onair.use_history = true;
        onair.static_base_url = '/static-proxy';
        onair.base_url = 'https://www.openbroadcast.org';

        // TODO: sorry for this. will be refactored...
        bplayer.onair = onair;


        setTimeout(() => {
            onair.init();
        }, 1000);

        setTimeout(() => {
            bplayer.init();
        }, 200);


        let achat = new AchatApp();
        achat.base_url = 'https://www.openbroadcast.org';

        setTimeout(function () {
            achat.init();
            achat.load();
        }, 3000);


    };


}

module.exports = AppInitializer;

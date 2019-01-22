import Vue from 'vue';
import store from './store';
import hotEmitter from 'webpack/hot/emitter';
import NoSleep from 'nosleep.js';

import SiteUI from './apps/site';
import LiveColor from './apps/live-color';
import AccountApp from './apps/account-app.vue';
import OnairApp from './apps/onair/onair-app.vue';
import ChatApp from './apps/chat/chat-app.vue';
import PlayerApp from './apps/player/player-app.vue';


const DEBUG = false;


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

        // if(navigator && navigator.platform && navigator.platform === 'iPhone') {
        //
        //     const noSleep = new NoSleep();
        //
        //     document.addEventListener('click', function enableNoSleep() {
        //       document.removeEventListener('click', enableNoSleep, false);
        //       noSleep.enable();
        //
        //       console.log('noSleep', noSleep);
        //
        //     }, false);
        //
        // }
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

        /**************************************************************
         * Vue Components
         **************************************************************/

        /**************************************************************
         * Account App
         **************************************************************/
        const account_app_container = document.getElementById('account_app');
        if (account_app_container) {

            const AccountComponent = Vue.extend(AccountApp);

            this.apps['AccountApp'] = new AccountComponent({
                el: account_app_container,
                store,
                propsData: account_app_container.dataset
            });
        }

        /**************************************************************
         * OnairApp App
         **************************************************************/
        const onair_app_container = document.getElementById('onair_app');
        if (onair_app_container) {

            const OnairComponent = Vue.extend(OnairApp);

            this.apps['OnairApp'] = new OnairComponent({
                el: onair_app_container,
                store,
                propsData: onair_app_container.dataset
            });
        }

        /**************************************************************
         * PlayerApp App
         **************************************************************/
        const player_app_container = document.getElementById('player_app');
        if (player_app_container) {

            const PlayerComponent = Vue.extend(PlayerApp);

            this.apps['PlayerApp'] = new PlayerComponent({
                el: player_app_container,
                store
            });
        }

        /**************************************************************
         * Chat App
         **************************************************************/
        const chat_app_container = document.getElementById('chat_app');
        if (chat_app_container) {

            const ChatComponent = Vue.extend(ChatApp);

            this.apps['AccountApp'] = new ChatComponent({
                el: chat_app_container,
                store,
                propsData: chat_app_container.dataset
            });
        }

    };

    setup_legacy() {


    };


}

module.exports = AppInitializer;

import Vue from 'vue';
import Vuex from 'vuex';

import account from './_account';
import chat from './_chat';
import onair from './_onair';
import rating from './_rating';
import player from './_player';

const DEBUG = false;

Vue.use(Vuex);

export default new Vuex.Store({
  namespaced: true,
  modules: {
    account,
    chat,
    onair,
    rating,
    player,
  },
  // plugins: []
});

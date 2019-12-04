import Vue from 'vue';
import Vuex from 'vuex';

import account from './_account';
import user from './_user';
import chat from './_chat';
import onair from './_onair';
import rating from './_rating';
import player from './_player';
import listener from './_listener';

const DEBUG = false;

Vue.use(Vuex);

export default new Vuex.Store({
  namespaced: true,
  modules: {
    account,
    user,
    chat,
    onair,
    rating,
    player,
    listener,
  },
  // plugins: []
});

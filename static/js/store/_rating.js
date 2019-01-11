import Vue from 'vue';
import store from '../store';
import { wrapRequest } from './requests';
import { WebSocketBridge } from 'django-channels';
import APIClient from "../api/client";

const DEBUG = false;

const VOTE_ENDPOINT = '/api/v2/rating/vote/';

const state = {
  votes: {}
};
const getters = {
  votes: state => state.votes
};
const mutations = {
    update_votes: (state, payload) => {
      if (DEBUG) console.debug('mutations - update_votes', payload);
      const key = `${payload.ct}:${payload.object_id}`;
      Vue.set(state.votes, key, payload)
    },
};

const actions = {

    get_votes: async (context, key) => {
      const url = `${VOTE_ENDPOINT}${key}/`;
      if (DEBUG) console.debug('actions - get_votes', url);
      let _r = wrapRequest(APIClient.get);
      let {data} = await _r(url);
      context.commit('update_votes', data);
    },

    update_vote: async (context, payload) => {
      const url = `${VOTE_ENDPOINT}${payload.key}/`;
      if (DEBUG) console.debug('actions - update_vote', url, payload);

      let _r = wrapRequest(APIClient.post);
      let {data} = await _r(url, {value: payload.value});

      // back channel (sending posted message back to browser)
      // is handled via websockets
      // context.commit('update_votes', data);

    },
};

/**********************************************************************
 * websocket handling / store updates
 *********************************************************************/
const ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
let ws_host = window.location.host;

// just for webpack devserver scenario - connect directly to backend
if(parseInt(window.location.port) === 4000){
    ws_host = 'local.openbroadcast.ch:8081';
    console.info('webpack assumed, setting ws host to:', ws_host)
}

const ws_url = ws_scheme + '://' + ws_host + "/ws/rating/";
const wsb = new WebSocketBridge();
wsb.connect(ws_url);
wsb.listen((data, stream) => {
    if (DEBUG) console.log('ws rating listen:', data, stream);
    //store.commit('add_chat_message', data);
    store.commit('rating/update_votes', data);
});


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

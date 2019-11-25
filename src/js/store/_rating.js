import Vue from 'vue';
import store from '../store';
import settings from '../settings';
import {wrapRequest} from './requests';
import {WebSocketBridge} from 'django-channels';
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
    const key = `${payload.ct}:${payload.uuid}`;
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

// websocket handling / store updates
const ws_url = `${settings.WS_SCHEME}://${settings.WS_HOST}/ws/rating/`;
const wsb = new WebSocketBridge();
wsb.connect(ws_url);

wsb.addEventListener("message", (event) => {
  // we have to re-fetch the rating from the API,
  // to make sure the user specific vote is available.
  // TODO: this step could be excluded for anonymous users.
  if (DEBUG) console.log('ws rating listen:', event.data);
  const key = `${event.data.ct}:${event.data.uuid}`;
  store.dispatch('rating/get_votes', key);
});



export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

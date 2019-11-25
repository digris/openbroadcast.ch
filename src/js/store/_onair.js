import { wrapRequest } from './requests';
import { WebSocketBridge } from 'django-channels';
import APIClient from "../api/client";
import settings from "../settings";
import store from "./index";

const DEBUG = true;
const SCHEDULE_ENDPOINT = '/api/v2/onair/schedule/?limit=20';

const state = {
  schedule: [],
  onair: false
};

const getters = {
  schedule: state => state.schedule,
  onair: state => state.onair
};

const mutations = {

  update_schedule: (state, payload) => {
    if (DEBUG) console.debug('mutations - update_schedule', payload);
    payload.results.reverse();
    payload.results.forEach((obj) => {

      const index = state.schedule.map(({uuid}) => uuid).indexOf(obj.uuid);
      if (index < 0) {
        // add obj
        state.schedule.unshift(obj);
      } else {
        // update obj
        state.schedule.splice(index, 1, obj);
      }
    });

    state.onair = payload.onair;
  },

  update_current_item: (state, payload) => {
    if (DEBUG) console.debug('mutations - update_current_item', payload);
    state.schedule.unshift(payload);
    state.onair = payload.uuid;

  }
};

const actions = {
  get_schedule: async (context, url) => {
    url = url || SCHEDULE_ENDPOINT;
    if (DEBUG) console.debug('actions - get_schedule', url);
    let _r = wrapRequest(APIClient.get);
    let {data} = await _r(url);
    context.commit('update_schedule', data);

    // NOTE: subsequent updates are pushed via websocket

    // let timeout = (data.next_starts_in + 0) * 1000 || 10000;
    // if (timeout > 60000) timeout = 60000;
    //
    // if (DEBUG) console.debug(`set timeout to update schedule in ${timeout}s`);
    //
    // setTimeout(() => {
    //   context.dispatch('get_schedule');
    // }, timeout);

  },

  set_current_item: (context, payload) => {
    context.commit('update_current_item', payload);
  }

};

// TODO: implement onair handling to use websocket provided data
// currently we do polling (see above) naively using setTimeout.
// this results in unexpected time-shifting...

// websocket handling / store updates
const ws_url = `${settings.WS_SCHEME}://${settings.WS_HOST}/ws/onair/`;
const wsb = new WebSocketBridge();
wsb.connect(ws_url);
wsb.addEventListener("message", (event) => {
    if (DEBUG) console.debug('ws onair:', event.data);
    if (DEBUG) console.debug('compensate stream delay, wait 25s until update');


    setTimeout(() => {
      store.dispatch('onair/set_current_item', event.data);
    }, 25000);


});

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

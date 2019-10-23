import { wrapRequest } from './requests';
import { WebSocketBridge } from 'django-channels';
import APIClient from "../api/client";
import settings from "../settings";
import store from "./index";

const DEBUG = true;
const SCHEDULE_ENDPOINT = '/api/v2/onair/schedule/?limit=20';

const state = {
  schedule: [],
  onair: false,
  next_starts_in: null
};

const getters = {
  schedule: state => state.schedule,
  onair: state => state.onair,
  next_starts_in: state => state.next_starts_in
};

const mutations = {
  /* TODO: not used a.t.m.
  add_schedule_item : (state, payload) => {
    if (DEBUG) console.debug('mutations - add_schedule_item', payload);
    state.schedule.unshift(payload);
  },
  */
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
    state.next_starts_in = payload.next_starts_in;
  },
};

const actions = {
  get_schedule: async (context, url) => {
    url = url || SCHEDULE_ENDPOINT;
    if (DEBUG) console.debug('actions - get_schedule', url);
    let _r = wrapRequest(APIClient.get);
    let {data} = await _r(url);
    context.commit('update_schedule', data);

    let timeout = (data.next_starts_in + 0) * 1000 || 10000;
    if (timeout > 60000) timeout = 60000;

    if (DEBUG) console.debug(`set timeout to update schedule in ${timeout}s`);

    setTimeout(() => {
      context.dispatch('get_schedule');
    }, timeout);

  },
};

// TODO: implement onair handling to use websocket provided data
// currently we do polling (see above) naively using setTimeout.
// this results in unexpected time-shifting...

// websocket handling / store updates
const ws_url = `${settings.WS_SCHEME}://${settings.WS_HOST}/ws/onair/`;
const wsb = new WebSocketBridge();
wsb.connect(ws_url);
wsb.listen((data) => {
  if (DEBUG) console.log('ws onair:', data);
});

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

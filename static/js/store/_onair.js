import { wrapRequest } from './requests';
// import { WebSocketBridge } from 'django-channels';
import APIClient from "../api/client";
import store from '../store';

const DEBUG = false;

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
    add_schedule_item : (state, payload) => {
      if (DEBUG) console.debug('mutations - add_schedule_item', payload);
      state.schedule.unshift(payload);
    },
    update_schedule: (state, payload) => {
      if (DEBUG) console.debug('mutations - update_schedule', payload);

      // TODO: sequential updates must not add duplicates!
      //state.schedule = state.schedule.concat(payload.results);


      // just testing.. append obj every 5 seconds
      /*
      for(let i = 0; i < 10; i++) {
        setTimeout(() => {
          state.schedule.unshift(payload.results[i]);
        }, 5000 * i)
      }
      */

      /**/
      payload.results.reverse();

      payload.results.forEach((obj) => {

        const index = state.schedule.map(({uuid}) => uuid).indexOf(obj.uuid);

        if(index < 0) {
          // add obj
          state.schedule.unshift(obj);
        } else {
          // update obj
          state.schedule.splice(index, 1, obj);
        }

        // if(! state.schedule.map(({uuid}) => uuid).includes(obj.uuid)) {
        //   if (DEBUG) console.debug('adding obj with uuid:', obj.uuid);
        //   state.schedule.unshift(obj);
        // }

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



export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

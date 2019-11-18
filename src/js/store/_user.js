import Vue from 'vue';
import {wrapRequest} from "./requests";
import APIClient from "../api/client";

const DEBUG = true;

const PROFILE_ENDPOINT = '/api/v2/profiles/profiles/';

const state = {
  profiles: {}
};
const getters = {
  profiles: state => state.profiles
};
const mutations = {
    update_profile: (state, payload) => {
      if (DEBUG) console.debug('mutations - update_profile', payload);
      const key = payload.user_id;
      Vue.set(state.profiles, key, payload)
    },
};

const actions = {
    get_profile: async (context, key) => {
      const url = `${PROFILE_ENDPOINT}${key}/`;
      if (DEBUG) console.debug('actions - get_profile', url);
      let _r = wrapRequest(APIClient.get);
      let {data} = await _r(url);
      if(data !== undefined) {
        context.commit('update_profile', data);
      }

    },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

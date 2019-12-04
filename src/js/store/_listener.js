import store from '../store';
import {wrapRequest} from './requests';
import APIClient from "../api/client";

const WEBSTREAM_ENDPOINT = '/api/v2/listener/webstream/';

const state = {
  streams: []
};

const getters = {
  streams: state => state.streams,
};

const mutations = {
  update_streams: (state, payload) => {
    state.streams = payload;
  },
};

const actions = {
  get_streams: async (context) => {
    const url = WEBSTREAM_ENDPOINT;
    let _r = wrapRequest(APIClient.get);
    let {data} = await _r(url);
    context.commit('update_streams', data);
  },
};

setImmediate(() => {
  store.dispatch('listener/get_streams');
});

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

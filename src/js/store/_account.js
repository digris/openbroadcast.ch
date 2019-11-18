// import Vue from 'vue';
// import store from '../store';

const DEBUG = false;

const state = {
  user: null
};
const getters = {
  user: state => state.user
};
const mutations = {
  update_user: (state, payload) => {
    if (DEBUG) console.debug('mutations - update_user', payload);
    state.user = payload;
  },
};

const actions = {
  update_user: async (context, payload) => {
    // if (DEBUG) console.debug('actions - update_user', payload);
    context.commit('update_user', payload);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

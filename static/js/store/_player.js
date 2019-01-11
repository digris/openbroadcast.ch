const DEBUG = false;

const state = {
  mode: 'live',
  player_state: 'stopped',
  //player_state: 'buffering',
  current_uuid: null,
};
const getters = {
  mode: state => state.mode,
  player_state: state => state.player_state,
  current_uuid: state => state.current_uuid
};
const mutations = {
    set_mode : (state, payload) => {
      state.mode = payload;
    },
    set_player_state : (state, payload) => {
      state.player_state = payload;
    },
    set_current_uuid : (state, payload) => {
      state.current_uuid = payload;
    },
};

const actions = {
    set_mode: (context, payload) => {
      if (DEBUG) console.debug('actions - set_mode', payload);
      context.commit('set_mode', payload);
    },
    set_player_state: (context, payload) => {
      if (DEBUG) console.debug('actions - set_player_state', payload);
      context.commit('set_player_state', payload);
    },
    set_current_uuid: (context, payload) => {
      if (DEBUG) console.debug('actions - set_current_uuid', payload);
      context.commit('set_current_uuid', payload);
    },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

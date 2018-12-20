import Vue from 'vue';
import Vuex from 'vuex';

import chat from './_chat';

import APIClient from '../api/client';
import { wrapRequest } from './requests';

const DEBUG = true;

Vue.use(Vuex);

const CHAT_ENDPOINT = '/api/v2/chat/message/';


export default new Vuex.Store({
  modules: {
    chat,
  },
  // plugins: []
});

// export default new Vuex.Store({
//   state: {
//     chat: {
//       messages: [],
//     }
//   },
//   getters: {
//     messages: state => {
//       return state.chat.messages;
//     }
//   },
//   // https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit
//   // mutations: use with 'store.commit'
//   mutations: {
//     add_chat_message : (state, payload) => {
//       if (DEBUG) console.debug('mutations - add_chat_message', payload);
//       state.chat.messages.unshift(payload);
//     },
//     update_chat_messages: (state, payload) => {
//       //if (DEBUG) console.debug('mutations - update_chat_messages', payload);
//       state.chat.messages = payload;
//     },
//   },
//   // actions: use with 'store.dispatch'
//   actions: {
//     post_chat_message: async (context, payload) => {
//       if (DEBUG) console.debug('actions - post_chat_message', payload);
//       let _r = wrapRequest(APIClient.post);
//       let {data} = await _r(CHAT_ENDPOINT, payload);
//       context.commit('add_chat_message', data);
//     },
//     get_chat_messages: async (context, payload) => {
//       if (DEBUG) console.debug('actions - get_chat_messages', CHAT_ENDPOINT);
//       let _r = wrapRequest(APIClient.get);
//       let {data} = await  _r(CHAT_ENDPOINT);
//       context.commit('update_chat_messages', data.results);
//     },
//   }
//   // plugins: []
// });

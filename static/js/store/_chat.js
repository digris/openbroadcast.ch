import { wrapRequest } from './requests';
import { WebSocketBridge } from 'django-channels';
import APIClient from "../api/client";
import store from '../store';

const DEBUG = false;

const CHAT_ENDPOINT = '/api/v2/chat/message/';

const state = {
  messages: []
};
const getters = {
  messages: state => state.messages
};
const mutations = {
    add_chat_message : (state, payload) => {
      if (DEBUG) console.debug('mutations - add_chat_message', payload);
      state.messages.unshift(payload);
    },
    update_chat_messages: (state, payload) => {
      //if (DEBUG) console.debug('mutations - update_chat_messages', payload);
      state.messages = state.messages.concat(payload);
    },
};

const actions = {
    post_chat_message: async (context, payload) => {
      if (DEBUG) console.debug('actions - post_chat_message', payload);

      let _r = wrapRequest(APIClient.post);
      let {data} = await _r(CHAT_ENDPOINT, payload);

      // back channel (sending posted message back to browser)
      // is handled via websockets

      // context.commit('add_chat_message', data);
      // wsb.send(payload);

    },
    get_chat_messages: async (context, url) => {
      url = url || CHAT_ENDPOINT;
      if (DEBUG) console.debug('actions - get_chat_messages', url);
      let _r = wrapRequest(APIClient.get);
      let {data} = await _r(url);
      context.commit('update_chat_messages', data.results);

      // fetch message history
      // if(data.next !== null) {
      //   context.dispatch('get_chat_messages', data.next);
      // }

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

const ws_url = ws_scheme + '://' + ws_host + "/ws/chat/";
const wsb = new WebSocketBridge();
wsb.connect(ws_url);
wsb.listen((data, stream) => {
    console.log('ws chat listen:', data, stream);
    store.commit('add_chat_message', data);
});


export default {
  state,
  getters,
  mutations,
  actions,
};

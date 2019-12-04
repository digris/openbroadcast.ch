const getWebsocketHost = function (window) {
  // TODO: this does not seem to be too generic...
  if (parseInt(window.location.port) === 4000) {
    return 'local.openbroadcast.ch:8081';
  }
  return window.location.host;
};

const foo = {
  WS_SCHEME: window.location.protocol === "https:" ? "wss" : "ws",
  WS_HOST: getWebsocketHost(window),
};

// merge with document settings
const settings = Object.assign({}, document.settings, foo);

export default settings;

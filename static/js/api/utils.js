const STATIC_PROXY_BASE_URL = '/static-proxy';

const static_proxy_prefix = (url) => {
  if(!url || url === undefined) {
    return null;
  }
  return `${STATIC_PROXY_BASE_URL}${url}`;
};


module.exports = {
  static_proxy_prefix: static_proxy_prefix
};

const STATIC_PROXY_BASE_URL = '/static-proxy';
const REMOTE_BASE_URL = 'https://www.openbroadcast.org';

const static_proxy_prefix = (url) => {
  if(!url || url === undefined) {
    return null;
  }
  return `${STATIC_PROXY_BASE_URL}${url}`;
};

const remote_url_prefix = (url) => {
  if(!url || url === undefined) {
    return null;
  }
  if (/^(f|ht)tps?:\/\//i.test(url)) {
    return url;
  }
  return `${REMOTE_BASE_URL}${url}`;
};


module.exports = {
  static_proxy_prefix: static_proxy_prefix,
  remote_url_prefix: remote_url_prefix
};

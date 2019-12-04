import settings from '../settings';

export let fbSDK = {
  mounted() {
    let _this = this;
    this.$nextTick(() => {
      window.fbAsyncInit = function () {
        FB.init({
          appId: settings.FACEBOOK_APP_ID,
          xfbml: true,
          version: 'v5.0'
        });
        FB.AppEvents.logPageView();
        _this.FB = FB
        console.log('FB SDK was initialized as mixin');
      };
      (function (d, s, id) {
        let js, fjs = d.getElementsByTagName(s)[0]
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    })
  },
  data() {
    return {
      FB: {}
    }
  }
};

// export default {
//   created: function () {
//     console.log('mixin hook called')
//   }
// }

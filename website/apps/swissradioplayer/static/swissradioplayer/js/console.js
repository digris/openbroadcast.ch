const DEBUG = false;
const REMOTE_BASE_URL = 'https://www.openbroadcast.org';

const console_app = new Vue({
  el: '#console_app',
  data: {
    timeout: false,
    api_url: '/api/v1/onair/schedule/',
    schedule: [],
    emissions: [],
  },
  mounted() {
    this.load_from_api();
  },
  computed: {
    onair: function () {
      return this.schedule.filter((el) => el.onair === true)[0];
    },
    history: function () {
      return this.schedule.filter((el) => el.onair === false);
    }
  },
  methods: {
    load_from_api: function () {
      const url = this.api_url + '?expand=item+emission&limit=12';
      if (DEBUG) console.debug('ConsoleApp - load_from_api', url);
      $.ajax(url, {
        type: 'GET',
        dataType: 'json',
        success: (response) => {
          if (DEBUG) console.debug('ConsoleApp - API response:', response);

          this.schedule = response.objects;
          this.emissions = this.annotate_emissions(response.objects)
          let reload_in = 60000;
          if (response.meta.next_starts_in && (Math.floor(response.meta.next_starts_in) * 1000) < reload_in) {
            reload_in = Math.floor(response.meta.next_starts_in) * 1000;
          }
          this.set_reload(reload_in);
        },
        error: (req, status, err) => {
          console.error('error loading from API', status, err);
          this.set_reload(10000);
        }
      });
    },
    set_reload: function (timeout) {
      if (DEBUG) console.debug('ConsoleApp - set_reload', timeout);

      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        this.load_from_api, (timeout + 1000)
      )
    },
    annotate_emissions: function (schedule) {
      /****************************************************************
       * reformat plain scheduler data, grouped by 'emissions'
       * output should bee in the form of:
       *     [{
       *         'name': 'emission title',
       *         'objects': [{}, {}]
       *     }
       *     ...]
       ****************************************************************/
      if (DEBUG) console.group();
      let emissions = this.emissions;
      emissions.filter((el) => el.id === false)
      schedule.forEach((obj) => {
        const index = emissions.findIndex((el) => el.id === obj.emission.id)
        if (index === -1) {
          if (DEBUG) console.debug('emission id does not exist:', obj.emission.id);
          const emission = obj.emission;
          delete obj.emission;
          emission.objects = [obj];
          emissions.push(emission)
        } else {
          if (DEBUG) console.debug('emission id exists:', obj.emission.id);
          delete obj.emission;
          emissions[index].objects.push(obj)
        }
      });
      emissions.forEach((emission) => {
        if (DEBUG) console.log('emission:', emission.name, emission);
        if (DEBUG) console.table(emission.objects);
      });
      if (DEBUG) console.groupEnd();
      return emissions;
    },
    visit: function (url, e) {
      e.preventDefault();
      window.open(REMOTE_BASE_URL + url, '_blank');
    }
  },
  filters: {
    time_s: function (value) {
      if (!value) return '';
      return '{0}:{1}:{2}'.format(
        value.substr(11, 2),
        value.substr(14, 2),
        value.substr(17, 2)
      );
    },
    time_m: function (value) {
      if (!value) return '';
      return '{0}:{1}'.format(
        value.substr(11, 2),
        value.substr(14, 2)
      );
    },
    date_y: function (value) {
      if (!value) return '';
      return '{0}'.format(
        value.substr(0, 4)
      );
    }
  }
});

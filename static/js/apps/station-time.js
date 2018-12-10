import $ from "jquery";

import APIClient from '../api/client';

const DEBUG = false;
const RESYNC_INTERVAL_DURATION = 120000;

class StationTime {

  constructor(opts) {
    if (DEBUG) console.log('StationTime: - constructor');

    this.container = $('#station_time');
    this.api_url = '/stationtime/time/';
    this.current_time = null;
    this.interval = false;

    this.bindings();

    // re-sync time from time to time
    setInterval(() => {
        this.sync_time();
    }, RESYNC_INTERVAL_DURATION);

    this.sync_time();
  };

  bindings() {
    if (DEBUG) console.log('StationTime: - bindings');
  };

  sync_time() {
    if (DEBUG) console.log('StationTime: - sync_time');
    APIClient.get(this.api_url)
        .then((response) => {
            if (DEBUG) console.debug('StationTime', response.data);
            this.run_clock(response.data.time);
        }, (error) => {
            if (DEBUG) console.error('StationTime - error loading data', error);
        });
  };

  run_clock(time) {
    if (DEBUG) console.log('StationTime: - run_clock', time);

    if (time === undefined) {
      return;
    }

    let current_time = new Date(time);
    this.current_time = tz_offset(current_time);
    this.display_clock(this.current_time);


    if(this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.current_time = new Date(this.current_time.getTime() + 1000);
      this.display_clock(this.current_time);
    }, 1000)

  }

  display_clock(time) {

    let time_string = [
      pad(time.getHours()),
      pad(time.getMinutes()),
      pad(time.getSeconds())
    ].join(':');

    $('input', this.container).val(time_string);
  }

}

module.exports = StationTime;

const pad = (n) => {
    return (n < 10) ? ('0' + n) : n;
};

const tz_offset = (date) => {
    const offset = date.getTimezoneOffset();
    date.setTime( date.getTime() + (offset * 60 * 1000));
    return date;
};

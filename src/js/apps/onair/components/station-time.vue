<script>

  import APIClient from '../../../api/client';

  const DEBUG = false;

  const pad = (n) => {
    return (n < 10) ? ('0' + n) : n;
  };

  const tz_offset = (date) => {
    const offset = date.getTimezoneOffset();
    date.setTime(date.getTime() + (offset * 60 * 1000));
    return date;
  };

  export default {
    name: 'StationTime',
    props: [
      'mode',
      'locked_item_uuid',
    ],
    data() {
      return {
        api_url: '/api/v2/stationtime/time/',
        interval: false,
        interval_duration: 1000,
        current_time: null,
      }
    },
    mounted: function () {

      this.sync_time();
      setInterval(() => {
        this.sync_time();
      }, 120000);

    },
    computed: {
      is_live() {
        return (this.locked_item_uuid === null)
      },
      formated_time() {
        const time = this.current_time;
        if (!time) {
          return '00:00:00'
        }
        return [
          pad(time.getHours()),
          pad(time.getMinutes()),
          pad(time.getSeconds())
        ].join(':');
      },
    },
    methods: {

      sync_time: function () {
        if (DEBUG) console.log('StationTime: - sync_time');
        APIClient.get(this.api_url)
          .then((response) => {
            if (DEBUG) console.debug('StationTime', response.data);
            this.run_clock(response.data.time);
          }, (error) => {
            if (DEBUG) console.error('StationTime - error loading data', error);
          });
      },

      run_clock: function (time) {
        if (DEBUG) console.log('StationTime: - run_clock', time);

        if (time === undefined) {
          return;
        }

        let current_time = new Date(time);
        this.current_time = tz_offset(current_time);


        if (this.interval) {
          clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
          this.current_time = new Date(this.current_time.getTime() + 1000);
        }, 1000)

      },

      show_logo: function () {
        this.$emit('show_logo');
      },

      hide_logo: function () {
        this.$emit('hide_logo');
      },

      click: function () {
        this.$emit('click');
      },
    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .stationtime {
        text-align: center;
        .display {
            border: 2px solid transparent;
            display: inline-block;

            transition: background-color 200ms, color 200ms;
            &__time {
                padding: 6px 20px;
                cursor: pointer;
            }
            &__back {
                padding: 6px 20px;
                cursor: pointer;
            }
        }
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity 200ms;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

</style>

<template>
    <div class="stationtime"
         v-bind:class="{ 'is-live': is_live }"
         @click.prevent="click">
        <div class="display"
             @mouseleave="hide_logo"
             data-livefg
             data-livehover>
            <transition name="fade" mode="out-in">
                <div v-if="is_live" key="time" class="display__time" @mouseenter="show_logo">
                    <span>{{ formated_time }}</span>
                </div>
                <div v-else key="back" class="display__back">
                    <a href="#">Back to what's on air now...</a>
                </div>
            </transition>
        </div>
    </div>
</template>

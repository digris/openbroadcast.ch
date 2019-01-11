<script>

  import soundmanager from 'soundmanager2/script/soundmanager2-html5';

  const DEBUG = false;


  const STREAMS = {
    default: {
      name: 'MP3 192kbps',
      type: 'audio/mp3',
      url: 'https://www.openbroadcast.org/stream/openbroadcast'
    },
    flac: {
      name: 'FLAC',
      type: 'audio/flac',
      url: 'https://www.openbroadcast.org/stream/openbroadcast.flac'
    }
  };


  import Media from './components/media.vue';

  export default {
    name: 'PlayerApp',
    components: {
      Media
    },
    props: [],
    mounted() {
      this.initialize_player();

      window.addEventListener('player:controls', (e) => {
        const action = e.detail;
        this.controls(action);
      }, false);

    },
    data() {
      return {
        player: null,
        // mode: 'live',
        visible: true,
        is_compact: false,
      }
    },
    computed: {
      schedule() {
        return this.$store.getters['onair/schedule'];
      },
      onair() {
        return this.$store.getters['onair/onair'];
      },
      mode() {
        return this.$store.getters['player/mode'];
      },
      player_state() {
        return this.$store.getters['player/player_state'];
      },
      current_uuid() {
        return this.$store.getters['player/current_uuid'];
      },
      loaded_schedule_item() {
        if (this.schedule.length < 1) {
          return null;
        }
        // in live mode we always follow the most recent item
        if (this.mode === 'live') {
          return this.schedule[0];
        }
      },

      stream() {
        const key = 'default';
        return STREAMS[key]
      },
      stream_url() {
        return this.stream.url;
      }

    },

    methods: {


      // TOODO: not sure if better way possible...
      set_mode: function (mode) {
        this.$store.dispatch('player/set_mode', mode);
      },
      set_player_state: function (state) {
        this.$store.dispatch('player/set_player_state', state);
      },
      set_current_uuid: function (uuid) {
        this.$store.dispatch('player/set_current_uuid', uuid);
      },


      controls: function (action) {
        if (DEBUG) console.debug('controls - action', action);

        if (action.do === 'play') {

          let opts = {
            url: null,
            type: 'audio/mp3',
            whileplaying: () => {
              // console.debug('PlayerApp - whileplaying:', this.player);

              if (this.player.position > 0 && this.player.playState === 1) {
                this.set_player_state('playing');
              } else if (this.player.playState === 1 && this.player.readyState === 1) {
                this.set_player_state('buffering');
              }

            },
            onfinish: () => {
              console.debug('finished media -> play next');



              if (this.current_uuid) {
                const current_index = this.schedule.map(({uuid}) => uuid).indexOf(this.current_uuid);
                // alert(current_index)
                if (current_index > 0) {
                  this.controls({
                    item: this.schedule[current_index - 1],
                    do: 'play'
                  });
                  return;
                }
              }

              this.set_player_state('stopped');


              // this.controls({
              //   do: 'play',
              //   item: this.schedule[0]
              // })
            }
          };


          let url = null;

          // check if stream or on-demand
          if (action.item && action.item.uuid === this.onair) {

            this.set_mode('live');
            opts.url = this.stream.url;
            opts.type = this.stream.type;
            this.set_current_uuid(null);

            // not very elegant. emit uuid (consumed by onair app)
            const _e = new CustomEvent('onair:force_item', {detail: null});
            window.dispatchEvent(_e);

          } else {

            this.set_mode('on-demand');
            opts.url = 'http://local.openbroadcast.ch:8000' + action.item.item.stream.uri;
            this.set_current_uuid(action.item.uuid);

            // not very elegant. emit uuid (consumed by onair app)
            const _e = new CustomEvent('onair:force_item', {detail: action.item.uuid});
            window.dispatchEvent(_e);

          }

          this.player.stop();
          this.player.play(opts);


        }
        if (action.do === 'stop') {
          this.player.unload();
          this.player.stop();
          this.set_current_uuid(null);

          this.set_player_state('stopped');
        }
        // TODO: pause not implemented/needed
        if (action.do === 'pause') {
          this.player.pause();

          this.set_player_state('paused');
        }

      },

      /**********************************************************
       * initialize player backend
       **********************************************************/
      initialize_player: function () {
        if (DEBUG) console.debug('PlayerApp: - initialize_player');
        soundManager.setup({
          forceUseGlobalHTML5Audio: true,
          html5PollingInterval: 100,
          debugMode: DEBUG,
          onready: () => {
            if (DEBUG) console.debug('PlayerApp: - soundManager ready');
            this.player = soundManager.createSound({
              multiShot: false,
              id: 'player_app_player'
            });
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
    @import '../../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    $player-max-height: 420px;

    .player-app {
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 99;
        color: #fff;

        @include breakpoint(medium) {
            max-height: $player-max-height;
            * {
                max-height: inherit;
            }
        }




        transition: background 0ms;
        transition-delay: 0ms;

        &.is-expanded {
            background: #000;
            transition: background 0ms;
            transition-delay: 0ms;
        }
    }

    .player-container {
        @include xy-grid-container(960px, 0);
    }

    .playlist {
        background: #000;
        position: relative;

        &__header {
            display: flex;
            color: rgba(#fff, 0.7);
            padding: 0 8px;
            min-height: 40px;
            align-items: center;
            border-bottom: 1px solid rgba(#fff, 0.4);

            @include breakpoint(small) {
                display: none;
            }


            div {
                &:first-child {
                    width: 100px;
                }

                &:last-child {
                    display: flex;
                    flex-grow: 1;

                    span:first-child {
                        width: 50%;
                    }
                }
            }
        }

        &__footer {
            display: flex;
            color: rgba(#fff, 0.7);
            padding: 0 8px;
            min-height: 40px;
            align-items: center;
            border-top: 1px solid rgba(#fff, 0.4);
        }

        &__toggle {
            position: absolute;
            right: 0;
            bottom: 0;
            color: #fff;
        }

        &__media {

            overflow-x: hidden;
            overflow-y: auto;

            @include breakpoint(medium) {
                max-height: $player-max-height - 80px;
            }

            @include breakpoint(small) {
                max-height: calc(100vh - 80px);
            }


            // TODO: create scrollbar mixin
            &::-webkit-scrollbar {
                width: 4px;
            }

            &::-webkit-scrollbar-track {
                background-color: transparent;
            }

            &::-webkit-scrollbar-thumb {
                background-color: #fff;
            }

        }
    }

</style>

<template>
    <div class="player-app" v-if="visible" v-bind:class="{ 'is-compact': is_compact,  'is-expanded': (! is_compact) }">
        <div class="player-container">

            <div div class="playlist">

                <div v-if="(! is_compact)" class="playlist__header">
                    <div>Airtime</div>
                    <div>
                        <span>Title</span>
                        <span>Artist</span>
                    </div>
                </div>

                <div v-if="(! schedule || schedule.length < 1)">
                    NO SCHEDULE
                </div>

                <div class="playlist__media">
                    <media
                            v-for="(schedule_item, index) in schedule"
                            @controls="controls($event)"
                            v-bind:key="schedule_item.uuid"
                            v-bind:index="index"
                            v-bind:is_compact="is_compact"
                            v-bind:onair="onair"
                            v-bind:is_current="(loaded_schedule_item && loaded_schedule_item.uuid === schedule_item.uuid)"
                            v-bind:schedule_item="schedule_item"></media>
                </div>


                <div v-if="(! is_compact)" class="playlist__footer">
                    (( foo ))
                </div>


                <div class="playlist__toggle">
                    <span v-on:click='is_compact = !is_compact'>
                        <i class="fa fa-angle-double-up"></i>
                    </span>
                </div>

            </div>
        </div>
    </div>
</template>

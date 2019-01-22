<script>

  import soundmanager from 'soundmanager2/script/soundmanager2-html5';
  //import soundmanager from 'soundmanager2/script/soundmanager2';

  const DEBUG = true;


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
        is_compact: true,
      }
    },
    computed: {
      user() {
        return this.$store.getters['account/user'];
      },
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

        if (this.mode === 'on-demand') {
          if (!this.current_uuid) {
            return this.schedule[0];
          }
          const current_index = this.schedule.map(({uuid}) => uuid).indexOf(this.current_uuid);
          return this.schedule[current_index];
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
      set_position: function (position) {
        this.$store.dispatch('player/set_position', position);
      },
      set_current_uuid: function (uuid) {
        this.$store.dispatch('player/set_current_uuid', uuid);
      },

      // not very elegant. emit uuid (consumed by onair app)
      select_item: function (uuid) {
        const _e = new CustomEvent('onair:force_item', {detail: uuid});
        window.dispatchEvent(_e);
      },

      controls: function (action) {
        if (DEBUG) console.debug('controls - action', action);

        if (action.do === 'play') {

          // TODO: not so nice... resetting position.
          this.set_position(0);

          // TODO: not so nice... assume buffering
          this.set_player_state('buffering');

          let opts = {
            url: null,
            type: 'audio/mp3',
            whileplaying: () => {
              // console.debug('PlayerApp - whileplaying:', this.player);

              // console.debug('PlayerApp - whileplaying: playState', this.player.playState, 'readyState', this.player.readyState, this.player);

              if (this.player.position > 0 && this.player.playState === 1) {

                this.set_player_state('playing');

                const position = this.player.position / (this.player.duration || this.player.durationEstimate);
                this.set_position(position.toPrecision(4));


              } else if (this.player.playState === 1 && this.player.readyState === 1) {
                this.set_player_state('buffering');
              }

            },
            onfinish: () => {
              // console.debug('finished media -> play next');


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
            },
            onsuspend: () => {
              console.debug('sm2 - onsuspend', this.player)
            }
          };

          // check if stream or on-demand
          if (action.item && action.item.uuid === this.onair) {

            this.set_mode('live');
            opts.url = this.stream.url;
            opts.type = this.stream.type;
            this.set_current_uuid(null);
            this.select_item(null)

          } else {

            // TODO: check for better way to handle unauthenticated user
            if (!this.user) {
              if (DEBUG) console.debug('unauthenticated user');
              return;
            }

            this.set_mode('on-demand');
            opts.url = action.item.item.stream.uri;
            this.set_current_uuid(action.item.uuid);
            this.select_item(action.item.uuid);

          }

          this.player.stop();
          //this.player.unload();
          //console.debug('this.player.play(opts);')
          this.player.play(opts);

        }

        // TODO: implement in a more DRY way... and handle player callbacks
        if (action.do === 'play_fallback') {
          this.player.stop();
          this.player.play({
            url: this.stream.url,
            type: this.stream.type
          });
        }

        if (action.do === 'stop') {
          this.player.unload();
          this.player.stop();
          this.set_current_uuid(null);

          //window.stop();

          this.set_player_state('stopped');
        }
        if (action.do === 'seek') {

          const position = (this.player.duration || this.player.durationEstimate) * (action.position / 100.0);

          this.player.setPosition(position);
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
          //forceUseGlobalHTML5Audio: true,
          html5PollingInterval: 50,
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

    $player-max-height: 431px;

    .player-app {
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 999;
        color: #fff;

        @include breakpoint(medium) {
            max-height: $player-max-height;
            * {
                max-height: inherit;
            }
        }

        text-rendering: auto;
        transition: background 0ms;
        transition-delay: 0ms;

        &.is-expanded {
            background: #000;
            transition: background 0ms;
            transition-delay: 0ms;
        }

        &.is-compact {
            max-height: 38px;
            min-height: 38px;
            overflow: hidden;


            @include breakpoint(small only) {
                max-height: 60px;
                min-height: 60px;
            }

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

            @include breakpoint(small only) {
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

            @include breakpoint(small only) {
                min-height: 60px;
            }

        }

        &__toggle {
            position: absolute;
            right: 0;
            bottom: 0;
            color: #fff;

            .action {
                cursor: pointer;
                display: flex;
                width: 38px;
                height: 38px;
                align-items: center;
                justify-content: center;

                font-size: 32px;
                line-height: 0;

                opacity: 0.7;

                &:hover {
                    opacity: 1;
                }

                transition: transform 100ms, opacity 200ms;
            }

            @include breakpoint(small only) {
                .action {
                    width: 60px;
                    height: 60px;
                    font-size: 48px;
                }
            }


            &.is-expanded {

                .action {
                    transform: scaleY(-1);
                }


            }

        }

        &__media {

            overflow-x: hidden;
            overflow-y: auto;

            @include breakpoint(medium) {
                max-height: $player-max-height - 80px;
            }

            @include breakpoint(small) {
                max-height: calc(100vh - 60px);
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
        <div class="player-container" v-if="(schedule && schedule.length > 0)">

            <div div class="playlist">

                <div v-if="(! is_compact)" class="playlist__header">
                    <div>Airtime</div>
                    <div>
                        <span>Title</span>
                        <span>Artist</span>
                    </div>
                </div>

                <div class="playlist__media">
                    <media
                            v-for="(schedule_item, index) in schedule"
                            @controls="controls($event)"
                            @select="select_item($event)"
                            v-bind:key="schedule_item.uuid"
                            v-bind:index="index"
                            v-bind:is_compact="is_compact"
                            v-bind:onair="onair"
                            v-bind:is_current="(loaded_schedule_item && loaded_schedule_item.uuid === schedule_item.uuid)"
                            v-bind:schedule_item="schedule_item"></media>
                </div>

                <div v-if="(! is_compact)" class="playlist__footer">
                    <!--(( Settings ))-->
                </div>

                <div class="playlist__toggle" v-bind:class="{'is-expanded': (! is_compact) }">
                    <div class="action">
                        <span v-on:click='is_compact = !is_compact'>
                            <i class="fa fa-angle-up"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

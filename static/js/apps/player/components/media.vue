<script>

  import Loader from '../../../components/loader.vue';
  import {template_filters} from '../../../utils/template-filters';

  const DEBUG = false;

  export default {
    props: [
      'is_compact',
      'onair',
      'is_current',
      'schedule_item',
      'index',
    ],
    components: {
      Loader,
    },
    data() {
      return {
        is_hover: false
      }
    },
    computed: {

      item() {
        return this.schedule_item.item;
      },

      emission() {
        return this.schedule_item.emission;
      },

      is_onair() {
        return (this.schedule_item && this.schedule_item.uuid === this.onair);
      },

      is_visible() {
        return (this.is_current || ! this.is_compact);
      },

      // player data
      player_mode() {
        return this.$store.getters['player/mode'];
      },
      player_player_state() {
        return this.$store.getters['player/player_state'];
      },
      player_current_uuid() {
        return this.$store.getters['player/current_uuid'];
      },
      // compose state from player info (TODO: find a nicer way)
      player_state() {
        // stopped - so no further checks needed
        if(this.player_player_state === 'stopped') {
          return this.player_player_state;
        }
        // on-air
        if(this.is_onair && this.player_mode === 'live') {
          return this.player_player_state;
        }
        // on-demand
        if(this.player_current_uuid === this.schedule_item.uuid) {
          return this.player_player_state;
        }
        return 'stopped';
      },

    },
    methods: {
      play: function (schedule_item) {
        const _c = {
          do: 'play',
          item: schedule_item
        };
        this.$emit('controls', _c);
      },
      pause: function () {
        const _c = {
          do: 'pause'
        };
        this.$emit('controls', _c);
      },
      stop: function () {
        const _c = {
          do: 'stop'
        };
        this.$emit('controls', _c);
      },
    },
    filters: template_filters,
  }

</script>

<style lang="scss" scoped>
    @import '../../../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    .media {
        display: flex;
        padding: 0 8px;
        min-height: 38px;
        align-items: center;

        color: rgba(#fff, .6);

        @include breakpoint(small only) {
            min-height: 58px;
        }


        &__airtime {
            min-width: 70px;

            @include breakpoint(small only) {
                display: none;
            }

        }

        &__controls {
            .action {
                cursor: pointer;
            }
            min-width: 30px;
        }

        &__meta {
            flex-grow: 1;
            display: flex;
            &__title {

            }
            &__by {
                padding: 0 6px;
                opacity: .5;
            }
            &__artist {

            }
        }

        &.is-playing {
            color: #fff;
        }

        &.is-expanded {
            border-top: 1px solid rgba(#fff, 0.4);

            &.no-border {
                border-color: transparent;
            }

            &:hover {
                color: #fff;
                background: rgba(#fff, 0.1);
            }
        }

        &.is-expanded & {
            &__meta {
                &__title {
                    width: 50%;
                }
            }
        }

    }

</style>

<template>
    <transition name="fade" mode="out-in">
        <div class="media"
             v-if="is_visible"
             @mouseover="is_hover=true"
             @mouseleave="is_hover=false"
             v-bind:class="{ 'is-playing': (player_state === 'playing' || player_state === 'buffering'),  'is-compact': is_compact,  'is-expanded': (! is_compact) ,  'no-border': (index === 0) }">

            <div class="media__airtime">
                <div v-if="is_onair">
                    <span>On Air</span>
                </div>
                <div v-else>
                    <span>{{ schedule_item.time_start | datetime2hhmm }}</span>
                </div>
            </div>

            <div class="media__controls">
                <span v-if="(player_state === 'stopped')" v-bind:data-account-login-required="(! is_onair)" @click="play(schedule_item)" class="action">
                    <i class="fa fa-play"></i>
                </span>
                <span v-if="(player_state === 'buffering')" class="status">
                    <loader></loader>
                </span>
                <span v-if="(player_state === 'playing')" @click="stop(schedule_item)" class="action">
                    <i class="fa fa-stop"></i>
                </span>
            </div>

            <div class="media__meta">
                <div class="media__meta__title">
                    <span>{{ item.name }}</span>
                </div>
                <div v-if="is_compact" class="media__meta__by">
                    by
                </div>
                <div class="media__meta__artist">
                    <span>{{ item.artist.name }}</span>
                </div>
            </div>

        </div>
    </transition>
</template>

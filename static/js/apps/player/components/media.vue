<script>

  import Loader from '../../../components/loader.vue';
  import Playing from '../../../components/playing.vue';
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
      Playing
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
      // player_position() {
      //   return this.$store.getters['player/position'];
      // },
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
      select: function (uuid) {
        this.$emit('select', uuid);
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

        color: rgba(#fff, .5);

        @include breakpoint(small only) {
            min-height: 60px;

            &__airtime {
                order: 4;
            }

            &.is-compact & {
                &__airtime {
                    display: none;
                }
            }


            &.is-expanded & {
                &__meta {
                    &__title {
                        width: auto !important;
                    }
                    &__artist {
                        .by {
                            padding: 0 6px 0 0;
                            opacity: .5;
                        }
                    }
                }
            }
        }

        @include breakpoint(medium) {
            &.is-expanded & {
                &__meta {
                    &__artist {
                        .by {
                            display: none;
                        }
                    }
                }
            }
        }


        &__controls {
            .action,
            .status {
                cursor: pointer;
                display: flex;
                width: 38px;
                height: 38px;
                align-items: center;
                justify-content: center;
            }
        }

        &__meta {
            flex-grow: 1;
            display: flex;
            &__title {
                padding-right: 6px;
            }
            &__artist {
                .by {
                    opacity: 0.5;
                }
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


        @include breakpoint(small only) {

            color: #fff;
            &__controls {
                font-size: 28px;
                padding-right: 10px;
            }
            &__meta {
                flex-direction: column;
                &__artist {
                    .by {
                        padding: 0 6px 0 0;
                    }
                }
            }
        }



    }

</style>

<template>
    <transition name="fade" mode="out-in">
        <div class="media"
             v-if="is_visible"
            @click="select(schedule_item.uuid)"
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
                <span v-if="(player_state === 'buffering')" @click="stop(schedule_item)" class="status">
                    <loader></loader>
                </span>
                <span v-if="(player_state === 'playing')" @click="stop(schedule_item)" class="action">
                    <playing></playing>
                    <!--<i class="fa fa-stop"></i>-->
                </span>
            </div>

            <div class="media__meta">
                <div class="media__meta__title">
                    <span>{{ item.name }}</span>
                </div>
                <div class="media__meta__artist">
                    <span class="by">by</span>
                    <span>{{ item.artist.name }}</span>
                </div>
            </div>

        </div>
    </transition>
</template>

<script>


  import Loader from '../../../components/loader.vue';
  import {static_proxy_prefix} from '../../../api/utils';

  const DEBUG = false;


  export default {
    name: 'ScheduleItem',
    props: {
      schedule_item: Object,
      index: Number, // index of this object in schedule array
      offset: Number, // view offset
      onair: String // UUID currently on air or null
    },
    components: {
      Loader,
    },
    data() {
      return {
        // we need this to pass state as props to loader
        actions_hover: false,
      }
    },
    mounted: function () {

    },
    computed: {

      item() {
        return this.schedule_item.item;
      },

      emission() {
        return this.schedule_item.emission;
      },

      relative_offset() {
        return (this.index - this.offset)
      },

      visible() {
        // we have 2 visible positions at the right side & 4 at the left side
        // to keep things more or less fast elements have to be removed from dom
        return (this.relative_offset < 15 && this.relative_offset > -30)
      },

      transform() {

        let x = 0;
        let scale = 1;
        let opacity = 1;

        const o = this.relative_offset;

        if (o <= -1) {
          x = 1850;
          // x = 500;
          scale = 1.3;
          // scale = 1.1;
        }

        if (o === 1) {
          x = -140;
          scale = 0.9;
          opacity = 0.9;
        }

        if (o === 2) {
          x = -280;
          scale = 0.7;
          opacity = 0.7;
        }

        if (o === 3) {
          x = -400;
          scale = 0.5;
          opacity = 0.1;
        }

        if (o === 4) {
          x = -500;
          scale = 0.1;
          opacity = 0.01;
        }

        if (o > 4) {
          x = -500;
          scale = 0.1;
          opacity = 0;
        }

        return {
          opacity: opacity,
          zIndex: 50 - o,
          transform: `rotateY(0deg) translateX(${x}px) scale(${scale})`
        }
      },
      key_image() {
        if (this.item && this.item.release && this.item.release.main_image) {
          return static_proxy_prefix(this.item.release.main_image);
        } else {
          return null;
        }
      },
      is_onair() {
        return (this.schedule_item && this.schedule_item.uuid === this.onair);
      },
      is_current() {
        return this.relative_offset === 0;
      },
      is_history() {
        return this.relative_offset > 0;
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
        if (this.player_player_state === 'stopped') {
          return this.player_player_state;
        }
        // on-air
        if (this.is_onair && this.player_mode === 'live') {
          return this.player_player_state;
        }
        // on-demand
        if (this.player_current_uuid === this.schedule_item.uuid) {
          return this.player_player_state;
        }
        return 'stopped';
      },

      // is_playing() {
      //   // playing flag only used if item is currently selected/presented
      //   if(! this.is_current) {
      //     return false;
      //   }
      //   if(this.player_state != 'playing') {
      //     return false;
      //   }
      //   if(this.is_onair && this.player_mode === 'live' && this.player_state === 'playing') {
      //     return true;
      //   }
      //   if(! this.is_onair && this.player_mode === 'on-demand' && this.player_state === 'playing' &&  this.player_current_uuid === this.schedule_item.uuid) {
      //     return true;
      //   }
      //   return false;
      // }
    },
    methods: {
      select: function () {
        if (!this.is_history) {
          return;
        }
        this.$emit('select', this.relative_offset * -1);
      },
      play: function () {
        const _c = {
          item: this.schedule_item,
          do: 'play'
        };
        const _e = new CustomEvent('player:controls', {detail: _c});
        window.dispatchEvent(_e);
      },
      stop: function () {
        const _c = {
          do: 'stop'
        };
        const _e = new CustomEvent('player:controls', {detail: _c});
        window.dispatchEvent(_e);
      }
    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .schedule-item {
        background: rgba(#fff, 1.0);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
        display: flex;
        transition: transform 500ms, filter 500ms, opacity 500ms;

        &__visual {
            width: 100%;
            height: 100%;
            position: relative;

            img {
                width: 100%;
                height: 100%;
            }

            .actions {

                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                .action {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 250px;
                    height: 250px;
                    cursor: pointer;
                    transition: background 200ms;
                    filter: drop-shadow(4px 4px 10px rgba(#000, .3));
                    background: url('/static/onair/img/bg.action.play.png');
                    &__text {
                        color: #fff;
                        font-size: 30px;
                        text-rendering: auto;
                        transition: color 500ms;
                    }
                    &--listen {
                        background: url('/static/onair/img/bg.action.listen.png');
                    }
                }

                &:hover {
                    .action {
                        background: url('/static/onair/img/bg.action.play.white.png');
                        &__text {
                            color: #000;
                        }
                        &--listen {
                            background: url('/static/onair/img/bg.action.listen.white.png');
                        }
                    }
                }

            }

            // debugging only
            .panel {
                position: absolute;
                color: white;
                background: #000;
                left: 0;
                bottom: 0;
            }
        }

        &.is-playing & {
            &__visual {
                .actions:not(:hover) {
                    .action {
                        background: none;
                    }
                }
            }
        }

        &.is-history {
            cursor: pointer;
            filter: grayscale(100%);

            &:hover {
                filter: grayscale(0);
                transition-duration: 200ms;
            }
        }

    }

    // TODO: this is kind of redundant. at the moment used to have
    // same transition on element creation.
    .appear-enter-active {
        transition: all 500ms;
    }

    .appear-enter {
        opacity: 0.5;
        transform: rotateY(0deg) translateX(1850px) scale(1.3) !important;
    }

    // transition for actions
    .fade-enter-active, .fade-leave-active {
        transition: opacity 500ms;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

</style>

<template>
    <transition name="appear">
        <div v-if="visible"
             class="schedule-item"
             @click="select"
             v-bind:class="{ 'is-onair': is_onair, 'is-current': is_current, 'is-history': is_history, 'is-playing': (player_state === 'playing') }"
             v-bind:style="transform">
            <div class="schedule-item__visual">
                <picture>
                    <source :srcset="key_image">
                    <img :src="key_image">
                </picture>
                <transition name="fade">
                    <div v-if="is_current" class="actions" @mouseover="actions_hover = true" @mouseout="actions_hover = false">

                        <div v-if="(is_onair && player_state === 'stopped')" @click.prevent="play"
                             class="action action--listen">
                            <div class="action__text">Listen</div>
                        </div>

                        <div v-if="(! is_onair && player_state === 'stopped')" @click.prevent="play"
                             class="action action--play">
                            <div class="action__text">Play</div>
                        </div>

                        <div v-if="(player_state === 'playing')" @click.prevent="stop" class="action action--stop">
                            <div class="action__text">
                                <i class="fa fa-stop"></i>
                            </div>
                        </div>

                        <div v-if="(player_state === 'buffering')" class="action action--buffering">
                            <div class="action__text">
                                <loader v-bind:scale="3"
                                        v-bind:color="((actions_hover) ? '#000' : '#fff')"></loader>
                            </div>
                        </div>

                    </div>
                </transition>
                <!---->
                <div class="panel">
                    player_state: {{ player_state }}<br>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>

  import Vue from 'vue';
  import debounce from 'debounce';

  import StationTime from './components/station-time.vue';
  import ThumbRating from './components/thumb-rating.vue';
  import ScheduleItem from './components/schedule-item.vue';
  import ScheduleItemMetadata from './components/schedule-item-metadata.vue';
  import ScheduleItemDetail from './components/schedule-item-detail.vue';
  import Arrow from './components/arrow.vue';

  const DEBUG = false;

  export default {
    name: 'OnairApp',
    components: {
      StationTime,
      ScheduleItem,
      ScheduleItemMetadata,
      ScheduleItemDetail,
      ThumbRating,
      Arrow,
    },
    props: [],
    mounted() {

      // TODO: maybe there is a nicer alternative to show/hide
      /*
      this.visible = document.getElementsByTagName('body')[0].classList.contains('cms-home');
      window.addEventListener("content:changed", (e) => {
        this.visible = document.getElementsByTagName('body')[0].classList.contains('cms-home');
      }, false);
      */

      // TODO: eventually there is a more elegant way to handle this
      window.addEventListener('onair:force_item', (e) => {
        const uuid = e.detail;
        this.select_by_uuid(uuid);
      }, false);

      this.$store.dispatch('onair/get_schedule');

      // handle window resize
      window.addEventListener("resize", (e) => {
        this.update_container_size();
      });
      this.update_container_size();

      // hide logo after a while...
      setTimeout(() => {
        this.carousel_visible = true;
      }, 1500);
      setTimeout(() => {
        this.hide_logo();
      }, 4000);

    },
    data() {
      return {
        visible: true,
        logo_visible: true,
        carousel_visible: false,
        locked_item_uuid: null,
        mode: 'live',
        selected_metadata_scope: null,
        //selected_metadata_scope: 'release',
        container_size: {width: 0, height: 0},
      }
    },
    computed: {

      schedule() {
        return this.$store.getters['onair/schedule'];
      },

      onair() {
        return this.$store.getters['onair/onair'];
      },

      sm2() {
        return this.$store.getters['player/sm2'];
      },

      offset() {

        if (!this.onair) {
          //return 0;
        }

        if (!this.locked_item_uuid) {
          return 0;
        }

        return this.schedule.map(({uuid}) => uuid).indexOf(this.locked_item_uuid);

      },

      presented_item() {
        if (typeof this.schedule[this.offset] === 'undefined') {
          return
        }
        return this.schedule[this.offset];
      },
      has_next() {
        return this.offset > 0;
      },
      has_previous() {
        return this.offset < this.schedule.length - 1;
      },

    },

    watch: {
      presented_item: function (val) {
        // TODO: implement better. watch for changed item. needed to trigger live-color update

        Vue.nextTick(function () {
          const img = $('.schedule-item.is-current img');
          if (img.length > 0) {
            // console.log('presented_item changed', img.attr('src'));

            const _e = new CustomEvent('livecolor:from_src', {
              detail: {
                src: img.attr('src'),
                duration: 1000
              }
            });
            window.dispatchEvent(_e);
          }

        })

      },
    },

    methods: {

      select: function (offset) {
        offset *= -1;
        if (DEBUG) console.debug('select', offset);

        if (!this.locked_item_uuid) {
          // no item forced - use offset directly
          if (typeof this.schedule[offset] === 'undefined') {
            return;
          }
          let uuid = this.schedule[offset].uuid;
          this.locked_item_uuid = uuid;

        } else {
          let current_index = this.schedule.map(({uuid}) => uuid).indexOf(this.locked_item_uuid);

          if (typeof this.schedule[current_index + offset] === 'undefined') {
            return;
          }

          let uuid = this.schedule[current_index + offset].uuid;

          // check if last (=current) item in schedule. if so remove locked item
          if (typeof this.schedule[current_index + offset - 1] === 'undefined') {
            this.reset_offset();
          } else {
            this.locked_item_uuid = uuid;
          }
        }
      },
      select_by_uuid: function (uuid) {
        this.locked_item_uuid = uuid;
      },
      reset_offset: function () {
        this.locked_item_uuid = null;
      },
      show_logo: function() {
        this.logo_visible = true;
      },
      hide_logo: function() {
        this.logo_visible = false;
      },
      play_fallback: function () {
        const _c = {
          do: 'play_fallback'
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
      },

      update_container_size: debounce(function () {

        this.container_size = {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        };

        // TODO: find a better way to handle image/cover ratio
        const placeholder = this.$refs.schedule_item_placeholder;
        const size = {
          width: placeholder.offsetWidth,
          height: placeholder.offsetHeight,
        };

        placeholder.style.height = `${size.width}px`;

      }, 100)
    }
  }
</script>
<style lang="scss">
    // initialize app & dimensions - shift element out of viewport
    body:not(.cms-home) {
        #onair_app_container {
            position: fixed;
            width: 100vw;
            left: 100vw;
            opacity: 0;
            pointer-events: none;
        }
    }
</style>
<style lang="scss" scoped>
    @import '../../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    .onair-app {
        //@include flex-grid;
        @include xy-grid-container;
        padding: 40px 40px 20px;

        @include breakpoint(medium only) {
            padding: 30px 20px 30px;
        }

        @include breakpoint(small only) {
            padding: 28px 10px 20px;
        }
    }

    .stationtime-container {
        margin-bottom: 32px;

        @include breakpoint(small only) {
            margin-bottom: 24px;
        }
    }

    .schedule-container {
        @include xy-grid-container;
        @include xy-grid;

        &__items {

            @include xy-cell(4);
            @include xy-cell-offset(4);


            //height: 380px;

            @include breakpoint(medium only) {
                @include xy-cell(4);
                @include xy-cell-offset(4);
            }

            @include breakpoint(small only) {
                @include xy-cell(12);
                @include xy-cell-offset(0);
            }

            position: relative;

            .carousel {
                opacity: 0;
                transition: opacity 500ms;

                &.is-visible {
                    opacity: 1;
                }
            }

        }

        &__metadata {
            @include xy-cell(4);

            @include breakpoint(medium only) {
                @include xy-cell(12);
            }

            @include breakpoint(small only) {
                @include xy-cell(12);
            }

        }


        &__placeholder {
            height: 100%;
            width: 100%;
            background: #000;
            color: #fff;
            opacity: .0;
            position: relative;
            transition: opacity 500ms;


            max-width: 380px;
            max-height: 380px;

            @include breakpoint(medium only) {
                max-width: 460px;
                max-height: 460px;
            }

            z-index: 105;
            pointer-events: none;

            &.is-visible {
                transition: opacity 100ms;
                opacity: 1;
            }

            &:after {
                content: "";
                display: block;
                padding-bottom: 100%;
            }

            .logo {
                margin: 0;
                font-size: 36px;
                line-height: 42px;
                font-weight: 500;
                padding: 18px 0 0 22px;
            }

            .dab {
                display: flex;
                align-items: center;
                position: absolute;
                bottom: 10px;
                right: 10px;

                span {
                    padding-right: 10px;
                }

                img {
                    height: 30px;
                }
            }

        }

        &__prev-next {

            @include breakpoint(medium down) {
                display: none;
            }

            .switch {
                position: absolute;
                z-index: 99;

                &--prev {
                    left: 30px;
                }

                &--next {
                    right: 30px;
                }
            }

        }

    }

    .rating-container {
        margin-top: 20px;

        @include breakpoint(small only) {
            margin-top: 20px;
        }
    }

</style>

<template>
    <div class="onair-app" v-if="visible">
        <div class="stationtime-container">
            <station-time
                    @click="reset_offset"
                    @show_logo="show_logo"
                    @hide_logo="hide_logo"
                    v-bind:mode="mode"
                    v-bind:locked_item_uuid="locked_item_uuid"></station-time>
        </div>
        <div class="schedule-container" @mouseover="logo_visible = false, carousel_visible = true">

            <div class="schedule-container__items">

                <div class="schedule-container__placeholder" ref="schedule_item_placeholder"
                     v-bind:class="{ 'is-visible': logo_visible }">
                    <p class="logo">
                        open<br>
                        broadcast<br>
                        radio<br>
                    </p>
                    <div class="dab">
                        <span>live on</span>
                        <img src="/static/img/base/logo.dab.white.png">
                    </div>

                    <div v-if="(!schedule || schedule.length < 1)">
                        <div @click="play_fallback">PLAY</div>
                        <div @click="stop">STOP</div>
                    </div>

                </div>

                <div class="carousel" v-bind:class="{ 'is-visible': carousel_visible }">
                    <schedule-item-detail
                            v-if="presented_item"
                            v-bind:scope="selected_metadata_scope"
                            v-bind:key="presented_item.uuid"
                            v-bind:schedule_item="presented_item"></schedule-item-detail>

                    <div v-if="onair">
                        <schedule-item
                                v-for="(schedule_item, index) in schedule"
                                @select="select"
                                v-bind:key="schedule_item.uuid"
                                v-bind:index="index"
                                v-bind:offset="offset"
                                v-bind:onair="onair"
                                v-bind:schedule_item="schedule_item"></schedule-item>
                    </div>
                </div>

            </div>

            <div v-if="onair" class="schedule-container__metadata">
                <schedule-item-metadata
                        v-if="presented_item"
                        @select_scope="selected_metadata_scope = $event"
                        v-bind:key="presented_item.uuid"
                        v-bind:onair="onair"
                        v-bind:schedule_item="presented_item"></schedule-item-metadata>
            </div>


            <div v-if="onair" class="schedule-container__prev-next">
                <div class="switch switch--prev" v-bind:style="{ top: (container_size.height / 2) + 12 + 'px' }">
                    <arrow @click="select(-1)" v-bind:disabled="(! has_previous)" direction="left"></arrow>
                </div>
                <div class="switch switch--next" v-bind:style="{ top: (container_size.height / 2) + 12 + 'px' }">
                    <arrow @click="select(+1)" v-bind:disabled="(! has_next)" direction="right"></arrow>
                </div>
            </div>

        </div>
        <div class="rating-container">
            <thumb-rating v-if="(presented_item && onair)" v-bind:media="presented_item.item"></thumb-rating>
        </div>
        <!--
        <div class="debug">
            onair: {{ onair }}<br>
        </div>
        -->
    </div>
</template>

<script>
  import Vue from 'vue';
  import VueTimeago from 'vue-timeago';
  import {template_filters} from '../../../utils/template-filters';
  import UserPopover from './user-popover.vue'

  let loc = require('date-fns/locale/de');

  Vue.use(VueTimeago, {
    locale: 'de',
    locales: {
      'de': loc,
    }
  });

  export default {
    props: {
      message: Object
    },
    components: {
      UserPopover
    },
    data() {
      return {
        timestamp: new Date(this.message.created)
      }
    },
    computed: {
      current_user() {
        return this.$store.getters['account/user'];
      },
      is_own() {
        if (! (this.current_user && this.message)) {
          return false;
        }
        return (this.current_user.uuid == this.message.sender.id) || (this.current_user.id == this.message.sender.id)
      }
    },
    filters: template_filters
  }
</script>

<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .message {
        margin: 10px;
        position: relative;

        // z-index is needed for user popover
        z-index: 1;
        &:hover {
            z-index: 2;
        }

        &__bubble {
            padding: 10px 0 10px 10px;
            border-radius: 3px;

            &:not([data-livebg]) {
                background: #f0f0f0;
            }

            .content {
                padding: 0 10px 0 0;
                max-height: 180px;
                overflow-x: hidden;
                overflow-y: auto;

                // TODO: create scrollbar mixin
                &::-webkit-scrollbar {
                    width: 4px;
                }
                &::-webkit-scrollbar-track {
                    background-color: transparent;
                }
                &::-webkit-scrollbar-thumb {
                    background-color: $black;
                }
            }
        }

        &__separator {
            display: flex;
            flex-direction: column;
            height: 10px;
            align-items: center;

            .triangle {
                &:not([data-livebg]) {
                    background: #f0f0f0;
                }
                width: 20px;
                height: 10px;
                clip-path: polygon(0% 0%, 50% 100%, 100% 0%);
            }

        }

        &__appendix {
            font-size: 80%;
            //opacity: .7;
            color: #999;
            text-align: center;

            .user {
                cursor: pointer;
            }

        }


        /*
        &--own & {
            &__bubble {
                background: #000;
                .content {
                    color: #fff;
                    &::-webkit-scrollbar-thumb {
                        background-color: #fff;
                    }
                }
            }

            &__separator {
                .triangle {
                    border-top-color: #000;
                }
            }
        }
        */
    }
</style>

<template>
    <div :key="message.uuid"
         class="message"
         v-bind:class="{ 'message--own': is_own }">
        <div class="message__bubble" :data-livebg="is_own" :data-livefg="is_own">
            <div class="content" v-html="$options.filters.linebreaksbr(message.html)"></div>
        </div>
        <div class="message__separator">
            <div class="triangle" :data-livebg="is_own"></div>
        </div>
        <div class="message__appendix">
            <span class="user">
                <!--
                <span v-if="is_own">du</span>
                <span v-else>{{ message.sender.display_name }}</span>
                -->
                <user-popover name="default" :user="message.sender" :text="message.sender.display_name">
                    <div slot="face">
                        <span v-if="is_own">du</span>
                        <span v-else>{{ message.sender.display_name }}</span>
                    </div>
                </user-popover>
            </span>
            |
            <span :title="timestamp">
                <timeago :datetime="timestamp" :auto-update="60"></timeago>
            </span>
        </div>
    </div>
</template>

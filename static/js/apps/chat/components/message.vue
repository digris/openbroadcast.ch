<script>
  import Vue from 'vue';
  import VueTimeago from 'vue-timeago';
  import {template_filters} from '../../../utils/template-filters';

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
    data() {
      return {
        timestamp: new Date(this.message.created)
      }
    },
    computed: {
      user() {
        return this.$store.getters['account/user'];
      },
      is_own() {
        if (! (this.user && this.message)) {
          return false;
        }
        return (this.user.uuid == this.message.sender.id) || (this.user.id == this.message.sender.id)
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

        &__bubble {
            padding: 10px 0 10px 10px;
            border-radius: 2px;

            &:not([data-livebg]) {
                background: #efefef;
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

            svg {
                width: 20px;
            }

            .triangle {
                width: 0;
                height: 0;
                border-left: 10px solid transparent !important;
                border-right: 10px solid transparent !important;
                border-top: 10px solid #efefef;
            }

        }

        &__appendix {
            font-size: 80%;
            opacity: .7;
            text-align: center;

            .user {
                border-bottom: 1px dotted #000;
            }

        }


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
    }
</style>

<template>
    <div :key="message.uuid"
         class="message"
         v-bind:class="{ 'message--own': is_own }">
        <div class="message__bubble" :data-livebg__="is_own" :data-livefg__="is_own">
            <div class="content" v-html="$options.filters.linebreaksbr(message.html)"></div>
        </div>
        <div class="message__separator">
            <div class="triangle" :data-livefg-inverse__="is_own"></div>
        </div>
        <div class="message__appendix">
            <span class="user">
                <span v-if="is_own">du</span>
                <span v-else>{{ message.sender.display_name }}</span>
            </span>
            |
            <timeago :datetime="timestamp" :auto-update="60"></timeago>
        </div>
    </div>
</template>

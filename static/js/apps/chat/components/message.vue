<script>
  import Vue from 'vue';
  import VueTimeago from 'vue-timeago';
  // import {template_filters} from '../../../utils/template-filters';

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
    // filters: template_filters,
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
                PADDING: 0 10px 0 0;
                max-height: 300px;
                overflow-x: hidden;
                overflow-y: auto;

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
        }
    }
</style>

<template>
    <div :key="message.uuid"
         class="message"
         v-bind:class="{ 'message--own': message.me }">
        <div class="message__bubble" :data-livebg="message.me">
            <div class="content" v-html="message.html"></div>
        </div>
        <div class="message__separator">
            <div class="triangle" :data-livefg-inverse="message.me"></div>

            <!--
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px" y="0px"
                 viewBox="0 0 10 5"
                 enable-background="new 0 0 10 5"
                 xml:space="preserve"
                 data-livefill
                 preserveAspectRatio="none">
                <polygon points="0,0 5,5 10,0"/>
            </svg>
            -->
        </div>
        <div class="message__appendix">
            {{ message.sender.display_name }}
            |
            <timeago :datetime="timestamp" :auto-update="60"></timeago>
        </div>
    </div>
</template>

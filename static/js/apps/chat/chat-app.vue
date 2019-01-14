<script>

  import Editable from '../../components/editable.vue';
  import Message from './components/message.vue';

  const DEBUG = false;

  export default {
    name: 'ChatApp',
    components: {
      Editable,
      Message
    },
    props: [],
    data() {
      return {
        visible: false,
        input_focus: false,
        message: ''
      }
    },
    mounted() {

      // // TODO: maybe there is a nicer alternative to show/hide
      // this.visible = document.getElementsByTagName('body')[0].classList.contains('cms-home');
      // window.addEventListener("content:changed", (e) => {
      //   this.visible = document.getElementsByTagName('body')[0].classList.contains('cms-home');
      // }, false);

      this.$store.dispatch('get_chat_messages');

      if (localStorage.chat_enabled) {
        this.visible = localStorage.chat_enabled;
      }


    },
    computed: {
      user() {
        return this.$store.getters['account/user'];
      },
      messages() {
        //return []
        return this.$store.getters.messages;
      },
    },

    methods: {

      submit_message() {

        if (!this.message || this.message.length < 1) {
          return;
        }

        const payload = {
          text: this.message
        };

        this.$store.dispatch('post_chat_message', payload).then((response) => {
          if (DEBUG) console.debug('post_chat_message dispatched', response);
          this.message = '';
          this.$refs.editable.reset();
        }, (error) => {
          console.warn(error);
        });
      },

      enable() {

        if(!this.user) {
          return;
        }

        this.visible = true;
        localStorage.chat_enabled = true;
      }


    }
  }
</script>
<!---->
<style lang="scss">
    body:not(.cms-home) {
        .chat-app {
            display: none;
        }
    }
</style>
<style lang="scss" scoped>
    @import '../../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    .chat-app {
        // background: $white;

        &--enabled {
            background: $white;
        }

        .chat-input-container {
            display: flex;
            align-items: center;
            flex-direction: column;
            padding: 20px 0;

            @include breakpoint(small only) {
                @include xy-grid-container;
                max-width: 100%;
                padding: 30px 20px 20px;
            }

        }
    }

    .chat-info {
        display: flex;
        flex-direction: column;
        text-align: center;
        cursor: pointer;
        padding: 10px 0 60px;

        .chat-icon {
            margin: 0 auto;
            width: 34px;
        }
    }

    .chat-input {
        display: flex;
        width: 480px;
        min-height: 30px;
        opacity: .5;
        transition: opacity 200ms;

        @include breakpoint(small only) {
            max-width: 100%;
        }

        &--has-focus {
            opacity: 1;
        }

        &__message {
            flex-grow: 1;
            border: 1px solid black;
            padding: 2px 4px;
            border-radius: 2px 0 0 2px;

            p {
                text-rendering: optimizeSpeed;
                margin: 0;
                outline: none;
            }
        }

        &__actions {
            .button {
                height: 100%;
                max-height: 30px;
                padding: 2px 20px;
                border: 0;
            }
        }
    }

    .message-list-container {
        @include xy-grid-container;
        max-width: 80rem;
        margin: 0 auto;
    }

    .message-list {
        display: flex;
        flex-wrap: wrap;

        .message {
            @include xy-cell(12);
            @include breakpoint(medium) {
                @include xy-cell(6);
            }
            @include breakpoint(large) {
                @include xy-cell(3);
            }
        }
    }


</style>

<template>
    <div class="chat-app" v-bind:class="{ 'chat-app--enabled': visible }">
        <div v-if="(! visible)" @click="enable" data-account-login-required class="chat-info">

            <div class="chat-icon">

                <svg version="1.1"
                     id="chat_icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                     x="0px" y="0px"
                     viewBox="0 0 511.999 511.999" xml:space="preserve">
                    <g>
                        <g>
                            <path data-livefill-inverse d="M493.123,23.914H18.876C8.468,23.914,0,32.382,0,42.791v312.572c0,10.408,8.468,18.876,18.876,18.876h229.025v113.845
                                l113.847-113.845h131.374c10.408,0,18.876-8.468,18.876-18.876V42.791C511.999,32.382,503.532,23.914,493.123,23.914z
                                 M495.804,355.363c0,1.453-1.228,2.681-2.681,2.681H355.04l-90.943,90.942v-90.942H18.876c-1.452,0-2.681-1.228-2.681-2.681
                                V42.791c0-1.453,1.228-2.681,2.681-2.681h474.247c1.452,0,2.681,1.228,2.681,2.681V355.363z"/>
                        </g>
                    </g>
                    <g>
                        <g>
                            <rect data-livefill-inverse x="61.985" y="83.2" width="307.181" height="16.195"/>
                        </g>
                    </g>
                    <g>
                        <g>
                            <rect data-livefill-inverse x="61.985" y="137.087" width="388.017" height="16.195"/>
                        </g>
                    </g>
                    <g>
                        <g>
                            <rect data-livefill-inverse x="61.985" y="190.974" width="388.017" height="16.195"/>
                        </g>
                    </g>
                    <g>
                        <g>
                            <rect data-livefill-inverse x="61.985" y="244.872" width="388.017" height="16.195"/>
                        </g>
                    </g>
                    <g>
                        <g>
                            <rect data-livefill-inverse x="61.985" y="298.759" width="388.017" height="16.195"/>
                        </g>
                    </g>
                </svg>

            </div>


            <span data-livefg>Chat</span>


        </div>
        <div v-else>
            <div class="chat-input-container">
                <form data-account-login-required
                      id="chat_input_form"
                      class="chat-input form-base"
                      v-bind:class="{ 'chat-input--has-focus': input_focus }"
                      @submit.prevent="submit_message">
                    <div class="chat-input__message">
                        <editable ref="editable"
                                  :content="message"
                                  @update="message = $event"
                                  @commit="submit_message()"
                                  @focus="input_focus = true"
                                  @blur="input_focus = false"></editable>
                    </div>
                    <div class="chat-input__actions">
                        <button type="submit" class="button button--cta">Talk!</button>
                    </div>
                </form>
            </div>
            <!--
            <div>{{ user }}</div>
            -->
            <div class="message-list-container">
                <div class="message-list" id="chat_message_list">
                    <message v-for="message in messages"
                             :key="message.uuid"
                             v-bind:message="message"></message>
                </div>
            </div>
        </div>
    </div>
</template>

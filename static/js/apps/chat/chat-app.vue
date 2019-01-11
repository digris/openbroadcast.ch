<script>

  import Editable from '../../components/editable.vue';
  import Message from './components/message.vue';
  import APIClient from '../../api/client';
  import store from '../../store';

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
        background: $white;

        .chat-input-container {
            display: flex;
            align-items: center;
            flex-direction: column;
            padding: 20px 0;
        }
    }

    .chat-input {
        display: flex;
        width: 480px;
        min-height: 30px;
        opacity: .5;
        transition: opacity 200ms;

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
    <div class="chat-app" v-if="visible">
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
</template>

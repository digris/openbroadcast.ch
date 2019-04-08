<script>

  import Vue from 'vue';
  import FloatLabels from 'float-labels.js';

  import APIClient from '../api/client';
  import ClickOutside from 'vue-click-outside';
  import Modal from '../components/modal.vue'

  const DEBUG = false;

  export default {
    name: 'AccountApp',
    components: {
      Modal
    },
    props: [
      'loginUrl',
      'registerUrl',
      'passwordRecoverUrl',
    ],
    data() {
      return {
        show_modal: false,
        is_authenticated: false,
        body: '',
        float_labels: null
      }
    },
    mounted() {

      this.$store.dispatch('account/update_user', document.user);

      // // TODO: find a better way to update login/registration/logout
      // window.addEventListener('content:changed', (e) => {
      //   this.$store.dispatch('account/update_user');
      // }, false);

      $(document).on('click', '[data-account-login-required]', (e) => {
        if (!this.user) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const action = e.currentTarget.dataset.loginAction || 'login';
          this.show(action);
        }
      });

      $(document).on('click', '[data-account-logout]', (e) => {

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const url = e.currentTarget.getAttribute('href');
        this.logout(url);

      });

      $(document).on('submit', 'form.account-partial', (e) => {
        e.preventDefault();
        this.process_form(e.currentTarget);
      });
    },
    directives: {
      ClickOutside
    },
    computed: {
      user() {
        return this.$store.getters['account/user'];
      },
      /*
       * https://stackoverflow.com/a/47203778/469111
       */
      compiled_body() {
        return {
          template: `${this.body}`
        }
      },
    },
    methods: {

      show: function (scope = 'login') {
        this.show_modal = true;
        this.body = '<span></span>';

        let url = null;

        if (scope === 'login') {
          url = this.loginUrl;
        }

        if (scope === 'register') {
          url = this.registerUrl;
        }

        if (scope === 'password_recover') {
          url = this.passwordRecoverUrl;
        }

        APIClient.get(url)
          .then((response) => {
            this.body = response.data;

            Vue.nextTick(() => {
              this.initialize_form();
            })

          }, (error) => {
            console.error('AccountApp - error loading item', error)
          });
      },
      hide: function () {
        this.show_modal = false;
      },
      visit_url: function (url, e) {
        this.hide();
        Turbolinks.visit(url);
      },
      initialize_form() {

        if (this.float_labels) {
          this.float_labels.destroy();
        }

        this.float_labels = new FloatLabels('.form-account', {
          style: 2,
          inputRegex: /email|number|password|search|tel|text|url|date/,
        });
      },
      process_form(form) {

        const _form = $(form);
        const url = _form.attr('action');
        const form_data = new FormData();

        for (const x of _form.serializeArray()) {
          form_data.set(x.name, x.value);
        }

        const config = {
          headers: {
            'content-type': 'application/x-www-form-urlencode'
          }
        };

        APIClient.post(url, form_data, config)
          .then((response) => {
            console.info('response', response.data);

            if (response.data.user !== undefined) {
              this.$store.dispatch('account/update_user', response.data.user);
            }

            if (response.data.location !== undefined) {
              this.hide();
              let location = response.data.location;
              if (response.data.user && response.data.user.is_staff) {
                location += '?toolbar_off'
              }
              Turbolinks.visit(location);

            } else {
              this.body = response.data;

              Vue.nextTick(() => {
                this.initialize_form();
              })

            }
            //this.content_bindings();
          }, (error) => {
            console.warn(error)
          })
      },
      logout(url) {
        if (DEBUG) console.debug('logout', url);
        APIClient.post(url)
          .then((response) => {
            this.$store.dispatch('account/update_user', response.data.user);
            const location = (response.data.location) ? response.data.location : document.location.href;
            Turbolinks.visit(location);
          }, (error) => {
            console.warn(error)
          })
      },
    }
  }
</script>
<!---->
<style lang="scss">
    @import '../../sass/site/settings';
    @import '../../sass/site/element/form';
    @import '../../sass/site/element/float-labels';
    @import '~foundation-sites/scss/foundation';

    .account-app {
        height: 100%;
    }


    .auth-card {

        padding: 10px 20px 20px;
        min-height: 360px;
        display: flex;
        flex-direction: column;

        height: 100%;

        position: relative;

        .title {

            margin-bottom: 12px;
            font-weight: normal;
        }

        .text {
            margin-bottom: 24px;
        }

        .form-separator {
            //text-align: center;
            margin: 18px 0 8px;
            display: inline-block;
        }

        .form-container {
            flex-grow: 1;
            @at-root {
                .input-container {
                    @include input-container;

                    &#input_id_tos & {
                        &__field__label {
                            width: auto;
                            order: 2;
                        }

                        &__field__input {
                            width: auto;
                            order: 1;

                            input {
                                height: 20px;
                                width: 20px;
                                display: inline-block;
                                margin-top: 6px;
                                margin-right: 10px;
                            }
                        }
                    }
                }
            }

            .form-base {

                .actions {
                    display: flex;
                    align-items: center;
                    align-content: center;
                    flex-direction: column;
                    margin: 24px 0 8px;

                    .button {
                        width: 100%;
                        background: $primary-color;
                        color: $white;
                        padding: 12px 24px;
                        // text-transform: uppercase;
                        // font-weight: 400;

                        &:hover {
                            // box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.1);
                        }
                    }
                }
            }
        }

        .form-appendix {
            .alt {
                display: block;
            }
            a {
                text-decoration: underline;
            }
        }

        #input_id_tos {
            font-size: 90%;
            .input-container__field {
                display: flex;
                align-items: center;
                /*
                input {
                    height: 24px;
                    //font-size: 24px;
                    transform: scale(1.4);
                }
                */

                input[type="checkbox"] {
                    cursor: pointer;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    position: relative;
                    box-sizing: content-box;
                    width: 24px;
                    height: 24px;
                    border: 2px solid #000;
                    transition: all 240ms;

                    flex: 0 0 24px;

                    &:focus {
                        outline: 0 none;
                        box-shadow: none;
                    }

                    color: transparent;

                    &:checked {
                        // background-color: #000;
                        color: #000;
                    }

                    &:after {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        content: "\2573";
                        font-size: 22px;
                        line-height: 24px;
                        text-align: center;
                    }


                }

                label {
                    order: 2;
                    padding-left: 12px;
                }
            }
        }

        // hacks...
        #input_id_captcha_1 {

            .input-container__field {
                display: flex;

                .fl-wrap-input {
                    width: auto;
                    flex-grow: 1;
                }

                img {
                    order: 2;
                    height: 52px;
                }

            }


        }

    }

    .social-login-container {

        display: flex;
        flex-direction: column;

        .auth-social {
            //padding: 0 !important;
            margin-bottom: 2px;
        }


        .auth-social {
            flex-grow: 1;

            .auth-social-button {
                display: flex;
                color: $black;
                padding: 6px 6px;
                width: 100%;
                transition: background 0.2s;
                background: rgba(0, 0, 0, .1);

                &:hover {
                    //ackground: rgba($primary-color, .05);
                    background: $primary-color;
                    color: $white;
                }

                //@include clearfix;

                .icon-container {
                    display: block;
                    float: left;
                    margin-right: 14px;

                    img.icon {
                        height: 18px;
                        filter: grayscale(100%);
                    }
                }

                .text-container {
                    display: block;
                    float: left;
                    padding-top: 2px;
                }
            }

            // provider styles
            .auth-social-button-google {
                color: $black;

                &:hover {
                    img.icon {
                        filter: grayscale(0%);
                    }
                }
            }

            .auth-social-button-facebook {
                color: $black;

                &:hover {
                    img.icon {
                        filter: brightness(500%);
                    }
                }
            }
        }

    }

</style>

<template>
    <modal :show="show_modal" @close="show_modal=false">
        <!--<span slot="title">The REAL Title</span>-->
        <div class="account-app" slot="content">
            <component :is="compiled_body" @show="show(...arguments)"></component>
            <!--<div v-html="body" class="body_"></div>-->
        </div>
    </modal>
</template>

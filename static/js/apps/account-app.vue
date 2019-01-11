<script>

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
    ],
    data() {
      return {
        show_modal: false,
        is_authenticated: false,
        body: '<h1></h1>'
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

        APIClient.get(url)
          .then((response) => {
            this.body = response.data;
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
    @import '~foundation-sites/scss/foundation';

    .auth-card {

        padding: 10px 20px;
        min-height: 360px;
        display: flex;
        flex-direction: column;

        .title {
            margin-bottom: 24px;
            font-weight: normal;
        }

        .form-separator {
            text-align: center;
            margin: 24px 0;
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
                    margin-top: 36px;

                    .button {
                        width: 33%;
                        background: $primary-color;
                        color: $white;
                        text-transform: uppercase;
                        font-weight: 400;

                        &:hover {
                            box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.1);
                        }
                    }
                }
            }
        }

        .form-appendix {
            a {
                text-decoration: underline;
            }
        }

    }

    .social-login-container {

        display: flex;

        .auth-social {
            flex-grow: 1;

            &:nth-child(1) {
                padding-right: 10px;
            }

            &:nth-child(2) {
                padding-left: 10px;
            }

            .auth-social-button {
                display: block;
                color: $black;
                padding: 4px 6px;
                border: 1px solid black;
                width: 100%;
                transition: background 0.2s;

                &:hover {
                    //ackground: rgba($primary-color, .05);
                    background: $primary-color;
                    color: $white;
                }

                @include clearfix;

                .icon-container {
                    display: block;
                    float: left;
                    margin-right: 14px;

                    img.icon {
                        height: 18px;
                    }
                }

                .text-container {
                    display: block;
                    float: left;
                    padding-top: 2px;
                }
            }

            //@include breakpoint(large up) {
            //  .auth-social-button {
            //    margin-bottom: 4%;
            //  }
            //  &:nth-child(even) .auth-social-button {
            //    width: 96%;
            //    margin-left: 4%;
            //  }
            //}

            // provider styles
            .auth-social-button-google {
                color: $black;
            }

            .auth-social-button-facebook {
                color: $black;

                &:hover {
                    .icon {
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

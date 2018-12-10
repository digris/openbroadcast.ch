<script>

import APIClient from '../api/client';
import ClickOutside from 'vue-click-outside';
import Modal from '../components/modal.vue'

const DEBUG = true;

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
            login_body: '<h1>foo</h1>',
            register_body: ''
        }
    },
    mounted() {

        $(document).on('click', '[data-login-required]', (e) => {
            const user = this.get_user();
            if(! user) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.set_pickup();
                this.show('login');
            }
        });

        $(document).on('click', '[data-login-logout]', (e) => {

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

        });

        $(document).on('click', '[data-auth-dialog]', (e) => {

            e.preventDefault();

            const scope = $(e.currentTarget).data('auth-dialog');
            const location = $(e.currentTarget).data('auth-dialog-next');

            this.set_pickup(location);
            this.show(scope);

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
        // user: function () {
        //     console.debug('AccountApp - computed:user');
        //     return document.user;
        // }
    },
    methods: {

        get_user: function() {
            return document.user;
        },

        set_pickup: function(location) {

            let auth_pickup = {
                location: location || document.location.pathname
            };

            console.debug(auth_pickup)

            // cookie.set('auth-pickup', auth_pickup, {
            //     expires: 1,
            //     path: '/'
            // });

            console.log('AccountApp - set_pickup', auth_pickup);
        },

        show: function(scope='login') {
            this.show_modal = true;
            this.login_body = '<span></span>';

            let url = null;

            if(scope === 'login') {
                url = this.loginUrl;
            }

            if(scope === 'register') {
                url = this.registerUrl;
            }

            APIClient.get(url)
                .then((response) => {
                    this.login_body = response.data;
                }, (error) => {
                    console.error('AccountApp - error loading item', error)
                });
        },
        hide: function() {
            this.show_modal = false;
        },
        visit_url: function(url, e) {
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
                  console.debug(response.data)
                    if(response.data.location !== undefined) {
                        this.hide();
                        //Turbolinks.clearCache();
                        //Turbolinks.visit('/?toolbar_off');
                        Turbolinks.visit('/');

                        // TODO: implement propperly
                        const _e = new CustomEvent('account:state-change');
                        window.dispatchEvent(_e);

                        // if(response.data.location.includes('/pick-up/')) {
                        //     document.location.href = response.data.location;
                        // } else {
                        //     Turbolinks.visit(document.location.pathname);
                        // }

                    } else {
                        this.login_body = response.data;
                    }
                }, (error) => {
                    console.warn(error)
                })
        }


    }
}
</script>
<!---->
<style lang="scss">
    @import '../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    $login-text-color: black;
    $login-facebook-color: blue;
    $login-google-color: blue;

    .social-login-container {
      @include grid-row(12) {
        .auth-social {
          @include grid-column(6, 0);
          .auth-social-button {
            display: block;
            color: $black;
            padding: 4px 6px;
            border: 1px solid black;
            width: 100%;
            transition: background 0.2s;
            &:hover {
              background: $primary-color;
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
          @include breakpoint(large up) {
            .auth-social-button {
              margin-bottom: 4%;
            }
            &:nth-child(even) .auth-social-button {
              width: 96%;
              margin-left: 4%;
            }
          }

          @include breakpoint(medium down) {
            @include grid-column(12, 0);
            .auth-social-button {
              margin-bottom: 8px;
            }
          }

          // provider styles
          .auth-social-button-google {
            background: $white;
          }
          .auth-social-button-facebook {
            color: $white;
            background: #3b5998;
          }
          //.auth-social-button-vk
          //  color: $white
          //  background: #4a76a8
          //
          //.auth-social-button-spotify
          //  color: $white
          //  background: #1db954

        }
      }
    }
</style>

<template>
    <modal :show="show_modal" @close="show_modal=false">
        <!--<span slot="title">The REAL Title</span>-->
        <div class="account-app" slot="content">
            <div v-html="login_body" class="body_"></div>
        </div>
    </modal>
</template>

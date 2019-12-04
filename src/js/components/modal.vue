<script>
  const DEBUG = false;
  export default {
    name: 'Modal',
    props: ['show', 'scope'],
    methods: {
      close: function () {
        this.$emit('close');
      }
    },
    mounted: function () {
      window.addEventListener('keydown', (e) => {
        if (this.show && e.keyCode === 27) {
          if (DEBUG) console.debug('ESC -> close');
          this.close();
        }
      });
    }
  }
</script>

<style lang="scss" scoped>
    @import '../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    .modal-mask {
        position: fixed;
        z-index: 1000;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(#222, .9);
        display: flex;
        align-items: center;
        justify-content: center;


        .modal-container {
            background: $white;
            width: 480px;
            max-width: 100%;
            min-height: 400px;
            display: flex;
            flex-direction: column;

            @include breakpoint(small only) {
                width: 100vw;
                height: 100vh;
            }

            .modal-header {
                .modal-topbar {
                    display: flex;
                    height: 36px;

                    .modal-topbar-title {
                        flex-grow: 1;
                    }

                    .modal-topbar-menu {
                        display: flex;
                        z-index: 999;
                        a {
                            background: $white;
                            color: $primary-color;
                            display: block;
                            padding: 10px 10px 0 0;
                            text-transform: uppercase;
                        }
                    }
                }
            }

            .modal-content {
                margin-top: -32px;
                //background: $white;
                flex: 1;
                overflow: auto;
            }

        }

    }

    // transitions
    .modal-enter-active {
        transition: opacity 500ms;
        @include breakpoint(small only) {
            transition: opacity 0ms;
        }
    }

    .modal-leave-active {
        transition: opacity 200ms;
        @include breakpoint(small only) {
            transition: opacity 0ms;
        }
    }

    .modal-enter, .modal-leave-to {
        opacity: 0;
    }

</style>

<template>
    <transition name="modal">
        <div class="modal-mask" @click="close" v-show="show">
            <div class="modal-container" v-bind:class="scope" @click.stop>
                <header class="modal-header">
                    <div class="modal-topbar">
                        <div class="modal-topbar-title">
                            <slot name="title"></slot>
                        </div>
                        <div class="modal-topbar-menu">
                            <a @click="close" class="">
                                <svg version="1.1"
                                     xmlns="http://www.w3.org/2000/svg"
                                     xmlns:xlink="http://www.w3.org/1999/xlink"
                                     x="0px"
                                     y="0px"
                                     width="22px"
                                     height="22px"
                                     viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;"
                                     xml:space="preserve">
                                    <polygon fill="#000" points="22.5,0 12,10.5 1.5,0 0,1.5 10.5,12 0,22.5 1.5,24 12,13.5 22.5,24 24,22.5 13.5,12 24,1.5 "/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </header>
                <main class="modal-content">
                    <slot name="content"></slot>
                </main>
            </div>
        </div>
    </transition>
</template>

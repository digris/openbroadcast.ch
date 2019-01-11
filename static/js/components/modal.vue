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
<!---->
<style lang="scss" scoped>
    @import '../../sass/site/settings';

    .modal-mask {
        position: fixed;
        z-index: 99;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(#222, .9);
        display: flex;
        align-items: center;
        justify-content: center;


        .modal-container {
            width: 600px;
            max-width: 100%;
            min-height: 400px;
            display: flex;
            flex-direction: column;

            .modal-header {
                .modal-topbar {
                    background: $white;
                    display: flex;
                    height: 28px;

                    .modal-topbar-title {
                        flex-grow: 1;
                    }

                    .modal-topbar-menu {
                        display: flex;

                        a {
                            background: $white;
                            color: $primary-color;
                            //line-height: 28px;
                            display: block;
                            padding: 6px 10px 0 10px;
                            text-transform: uppercase;
                        }
                    }
                }
            }

            .modal-content {
                background: $white;
                flex: 1;
                overflow: auto;
            }

        }

    }

    // transitions
    .modal-enter-active {
        transition: all .1s;
    }

    .modal-leave-active {
        transition: all .2s;
    }

    .modal-enter, .modal-leave-to {
        //transform: translateY(100vh);
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
                            <a @click="close" class="">Close (esc)</a>
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

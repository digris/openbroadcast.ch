<script>

  const DEBUG = false;

  export default {
    name: 'ThumbRating',
    props: [
      'media',
    ],
    data() {
      return {
        obj_ct: 'alibrary.media',
      }
    },
    mounted: function () {
      // const key = `${this.obj_ct}:${this.media.id}`;
      // this.$store.dispatch('rating/get_votes', {obj_ct: 'alibrary.media', obj_pk: this.media.id});
    },
    computed: {
      user() {
        return this.$store.getters['account/user'];
      },
      key() {
        if (!this.media) {
          return null;
        }
        return `${this.obj_ct}:${this.media.id}`
      },
      votes() {
        if (!this.key) {
          return null;
        }

        const votes = this.$store.getters['rating/votes'][this.key];

        if (typeof votes === 'undefined') {
          this.$store.dispatch('rating/get_votes', this.key);
        }

        return votes;
      },
      chat_enabled() {
        return this.$store.getters['chat/enabled'];
      },
    },
    methods: {
      vote: function (value) {
        if (!this.key) {
          return null;
        }
        if (DEBUG) console.debug('vote', value);
        this.$store.dispatch('rating/update_vote', {key: this.key, value: value});
      },

      enable_chat: function () {

        if (!this.user) {
          return;
        }

        this.$store.dispatch('chat/enable');
      }

    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .thumb-rating {
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .vote {
        align-self: center;
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: row;

        svg {
            margin: 0 20px;

            rect,
            polyline {
                transition: fill-opacity 200ms;
            }
        }

        &:hover {
            svg {
                rect,
                polyline {
                    fill-opacity: 0.4;
                }
            }
        }

        &--down {
            svg {
                transform: rotateZ(180deg);
                top: 12px;
                position: relative;
            }
        }

        &__value {
            font-size: 105%;
            line-height: 42px;
        }

        &--up & {
            &__value {
                margin-right: 10px;
            }
        }

        &--down & {
            &__value {
                margin-left: 10px;
            }
        }

    }

    .separator {
        width: 2px;
        height: 60px;
        margin: 0 20px;
    }


    .chat-toggle {
        cursor: pointer;
        .chat-icon {
            width: 32px;
            margin: 10px 30px 0;
        }
    }


</style>

<template>
    <div class="thumb-rating" data-account-login-required>

        <div @click.prevent="vote(1)" class="vote vote--up">
            <span data-livefg class="vote__value">
                <span v-if="(votes)">{{ votes.up }}</span>
                <span v-else>-</span>
            </span>
            <svg version="1.1"
                 id="Layer_1"
                 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px" y="0px"
                 width="33px" height="31px"
                 viewBox="0 0 33 31" xml:space="preserve">
                                <g>
                                    <polyline
                                            fill-opacity="0.1"
                                            data-livefill-inverse
                                            stroke="#000000"
                                            data-livestroke
                                            stroke-miterlimit="10"
                                            points="8.5,14.5 14.5,14.5 20.5,0.5 23.5,0.5 23.5,13.5,32.5,13.5 32.5,25.5 29.5,30.5 19.5,30.5 16.5,28.5 8.5,28.5"/>
                                    <rect
                                            x="0.5" y="12.5"
                                            fill-opacity="0.1"
                                            data-livefill-inverse
                                            stroke="#000000"
                                            data-livestroke
                                            stroke-miterlimit="10"
                                            width="8" height="18"/>
                                </g>
                            </svg>
        </div>


        <div v-if="chat_enabled" class="separator" data-livebg-inverse></div>
        <div v-else class="chat-toggle" @click.prevent="enable_chat" data-account-login-required>
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

        </div>


        <div @click.prevent="vote(-1)" class="vote vote--down">
            <svg version="1.1"
                 id="Layer_1"
                 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px" y="0px"
                 width="33px" height="31px"
                 viewBox="0 0 33 31" xml:space="preserve">
                                <g>
                                    <polyline
                                            fill-opacity="0.1"
                                            data-livefill-inverse
                                            stroke="#000000"
                                            data-livestroke
                                            stroke-miterlimit="10"
                                            points="8.5,14.5 14.5,14.5 20.5,0.5 23.5,0.5 23.5,13.5,32.5,13.5 32.5,25.5 29.5,30.5 19.5,30.5 16.5,28.5 8.5,28.5"/>
                                    <rect
                                            x="0.5" y="12.5"
                                            fill-opacity="0.1"
                                            data-livefill-inverse
                                            stroke="#000000"
                                            data-livestroke
                                            stroke-miterlimit="10"
                                            width="8" height="18"/>
                                </g>
                            </svg>
            <span data-livefg class="vote__value">
                <span v-if="(votes)">{{ votes.down }}</span>
                <span v-else>-</span>
            </span>
        </div>
    </div>
</template>

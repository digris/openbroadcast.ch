<script>

  const DEBUG = true;

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
        return `${this.obj_ct}:${this.media.uuid}`;
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
        user_vote() {
          if(! this.votes) {
              return null;
          }
          return this.votes.user_vote;
        },
      chat_enabled() {
        return this.$store.getters['chat/enabled'];
      },
    },
    methods: {
      vote: function (vote) {
        if (!this.key) {
          return null;
        }
        const value = (vote === this.user_vote) ? 0 : vote;
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
                fill-opacity: .1;
                transition: fill-opacity 200ms;
            }

            &.user-vote {
                rect,
                polyline {
                    fill-opacity: 1;
                }
            }
        }

        &:hover {
            svg {
                rect,
                polyline {
                    fill-opacity: 0.4;
                }

                &.user-vote {
                    rect,
                    polyline {
                        fill-opacity: .6;
                    }
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
            &:hover {
                svg {
                    polygon {
                        fill-opacity: 0.4;
                    }
                }
            }
        }
    }


</style>

<template>
    <div class="thumb-rating" data-account-login-required>

        <div @click.prevent="vote(1)" class="vote vote--up">
            <span data-livefg class="vote__value">
                <span v-if="(votes)">{{ votes.upvotes }}</span>
                <span v-else>&nbsp;</span>
            </span>
            <svg version="1.1"
                 id="Layer_1"
                 :class="{ 'user-vote': (user_vote === 1) }"
                 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px" y="0px"
                 width="33px" height="33px"
                 viewBox="0 0 33 33" xml:space="preserve">
                <g>
                    <polyline
                            data-livefill-inverse
                            stroke="#000000"
                            stroke-width="2"
                            data-livestroke
                            stroke-miterlimit="10"
                            points="8,15 14,15 20,1 23,1 23,14,32,14 32,26 29,31 19,31 16,29 8,29"/>
                    <rect
                            x="1" y="13"
                            data-livefill-inverse
                            stroke="#000000"
                            stroke-width="2"
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
                     id="Layer_1"
                     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                     x="0px" y="0px"
                     width="34px" height="33px"
                     viewBox="0 0 34 32" xml:space="preserve">
                    <g>
                        <polygon
                                fill-opacity="0.1"
                                data-livefill-inverse
                                stroke="#000000"
                                stroke-width="2"
                                data-livestroke
                                stroke-miterlimit="10"
                                points="31,5 31,25 21,25 17,28 13,25 3,25 3,5"/>
                        <line
                                stroke="#000000"
                                stroke-width="2"
                                data-livestroke
                                stroke-miterlimit="10"
                                x1="6"
                                y1="10"
                                x2="28"
                                y2="10"/>
                        <line
                                stroke="#000000"
                                stroke-width="2"
                                data-livestroke
                                stroke-miterlimit="10"
                                x1="6"
                                y1="15"
                                x2="28"
                                y2="15"/>
                        <line
                                stroke="#000000"
                                stroke-width="2"
                                data-livestroke
                                stroke-miterlimit="10"
                                x1="6"
                                y1="20"
                                x2="28"
                                y2="20"/>
                    </g>
                </svg>
            </div>
        </div>

        <div @click.prevent="vote(-1)" class="vote vote--down">
            <svg version="1.1"
                 id="Layer_1b"
                 :class="{ 'user-vote': (user_vote === -1) }"
                 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px" y="0px"
                 width="34px" height="33px"
                 viewBox="0 0 34 32" xml:space="preserve">
                <g>
                    <polyline
                            data-livefill-inverse
                            stroke="#000000"
                            stroke-width="2"
                            data-livestroke
                            stroke-miterlimit="10"
                            points="8,15 14,15 20,1 23,1 23,14,32,14 32,26 29,31 19,31 16,29 8,29"/>
                    <rect
                            x="1" y="13"
                            data-livefill-inverse
                            stroke="#000000"
                            stroke-width="2"
                            data-livestroke
                            stroke-miterlimit="10"
                            width="8" height="18"/>
                </g>
            </svg>
            <span data-livefg class="vote__value">
                <span v-if="(votes)">{{ votes.downvotes }}</span>
                <span v-else>&nbsp;</span>
            </span>
        </div>
    </div>
</template>

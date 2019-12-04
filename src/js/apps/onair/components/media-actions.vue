<script>

  const DEBUG = true;

  export default {
    name: 'MediaActions',
    props: {
      media: Object,
      is_live: Boolean,
      fb_loaded: Boolean,
    },
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
        // if (!this.user) {
        //   return;
        // }
        const value = (vote === this.user_vote) ? 0 : vote;
        if (DEBUG) console.debug('vote', value);
        this.$store.dispatch('rating/update_vote', {key: this.key, value: value});
      },

      toggle_chat: function () {
        if (!this.user) {
          return;
        }
        if(this.chat_enabled) {
            this.$store.dispatch('chat/disable');
        } else {
            this.$store.dispatch('chat/enable');
        }
      },

      fb_share: function() {
          if(!this.is_live) {
              return;
          }
          this.$emit('fb_share');
      }

      // enable_chat: function () {
      //   if (!this.user) {
      //     return;
      //   }
      //   this.$store.dispatch('chat/enable');
      // }

    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .media-actions {
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
            margin: 10px 10px 0 10px;
            &:hover {
                svg {
                    polygon {
                        fill-opacity: 0.4;
                    }
                }
            }
        }
    }

    .fb-share {
        cursor: pointer;
        &.is-disabled {
            opacity: .2;
            cursor: not-allowed;
        }
        transition: opacity 200ms;
        .share-icon {
            width: 34px;
            margin: 8px 10px 0 10px;
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
    <div class="media-actions">

        <div data-account-login-required__ @click.prevent="vote(1)" class="vote vote--up">
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

        <!--<div v-if="chat_enabled" class="separator" data-livebg-inverse></div>-->
        <div data-account-login-required class="chat-toggle" @click.prevent="toggle_chat" data-account-login-required>
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

        <div v-if="fb_loaded" class="fb-share" :class="{ 'is-disabled': !is_live }" @click.prevent="fb_share">
            <div class="share-icon">
                <svg
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px" y="0px"
                    width="32px" height="34px"
                    viewBox="0 0 481.6 481.6"
                    xml:space="preserve">
                <g>
                    <path
                        fill-opacity="1"
                        data-livefill-inverse
                        stroke="#000000"
                        stroke-width="2"
                        data-livestroke
                        d="M381.6,309.4c-27.7,0-52.4,13.2-68.2,33.6l-132.3-73.9c3.1-8.9,4.8-18.5,4.8-28.4c0-10-1.7-19.5-4.9-28.5l132.2-73.8
                        c15.7,20.5,40.5,33.8,68.3,33.8c47.4,0,86.1-38.6,86.1-86.1S429,0,381.5,0s-86.1,38.6-86.1,86.1c0,10,1.7,19.6,4.9,28.5
                        l-132.1,73.8c-15.7-20.6-40.5-33.8-68.3-33.8c-47.4,0-86.1,38.6-86.1,86.1s38.7,86.1,86.2,86.1c27.8,0,52.6-13.3,68.4-33.9
                        l132.2,73.9c-3.2,9-5,18.7-5,28.7c0,47.4,38.6,86.1,86.1,86.1s86.1-38.6,86.1-86.1S429.1,309.4,381.6,309.4z M381.6,27.1
                        c32.6,0,59.1,26.5,59.1,59.1s-26.5,59.1-59.1,59.1s-59.1-26.5-59.1-59.1S349.1,27.1,381.6,27.1z M100,299.8
                        c-32.6,0-59.1-26.5-59.1-59.1s26.5-59.1,59.1-59.1s59.1,26.5,59.1,59.1S132.5,299.8,100,299.8z M381.6,454.5
                        c-32.6,0-59.1-26.5-59.1-59.1c0-32.6,26.5-59.1,59.1-59.1s59.1,26.5,59.1,59.1C440.7,428,414.2,454.5,381.6,454.5z"/>
                </g>
                </svg>
            </div>
        </div>

        <div data-account-login-required__ @click.prevent="vote(-1)" class="vote vote--down">
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

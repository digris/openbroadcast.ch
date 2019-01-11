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
        if(!this.media) {
          return null;
        }
        return `${this.obj_ct}:${this.media.id}`
      },
      votes() {
        if(!this.key) {
          return null;
        }

        const votes = this.$store.getters['rating/votes'][this.key];

        if (typeof votes === 'undefined') {
          this.$store.dispatch('rating/get_votes', this.key);
        }

        return votes;
      },
    },
    methods: {
      vote: function (value) {
        if(!this.key) {
          return null;
        }
        if (DEBUG) console.debug('vote', value);
        this.$store.dispatch('rating/update_vote', {key: this.key, value: value});
      },

    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .thumb-rating {
        height: 62px;
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
            margin: 0 10px;
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
            font-size: 120%;
            line-height: 42px;
        }
    }

    .separator {
        width: 2px;
        height: 62px;
        margin: 0 20px;
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
        <div class="separator" data-livebg-inverse></div>
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

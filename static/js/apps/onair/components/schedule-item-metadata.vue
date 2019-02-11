<script>

  import debounce from 'debounce';
  import {template_filters} from '../../../utils/template-filters';
  import {remote_url_prefix} from '../../../api/utils';

  const DEBUG = false;


  export default {
    name: 'ScheduleItemMetadata',
    props: {
      schedule_item: Object,
      onair: String // UUID currently on air or null
    },
    mounted: function () {

    },
    computed: {
      media() {
        return this.schedule_item.item;
      },
      emission() {
        return this.schedule_item.emission;
      },
      is_onair() {
        return (this.schedule_item && this.schedule_item.uuid === this.onair);
      }
    },
    methods: {
      trigger: debounce(function (scope) {
        scope = (scope) ? scope : null;
        if (DEBUG) console.debug('trigger', scope);
        this.$emit('select_scope', scope);
      }, 100),
      visit: function (url) {
        if (DEBUG) console.debug('visit', remote_url_prefix(url));
        window.open(remote_url_prefix(url));

        // if(this.remote_window && this.remote_window.location) {
        //   this.remote_window.location.href = remote_url_prefix(url);
        // } else {
        //   this.remote_window = window.open(remote_url_prefix(url));
        // }

      }
    },
    filters: template_filters
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';
    @import '~foundation-sites/scss/foundation';

    .metadata {

        &--minimal {
            display: none;
            @include breakpoint(medium down) {
                display: block;
            }

            text-align: center;
            padding: 24px 0 0;
        }

        &--extended {
            @include breakpoint(medium down) {
                display: none;
            }

            max-width: 320px;
            padding-left: 20px;
        }


        &__emission {

        }

        &__media {

        }

        &__relations {
            .relation {
                display: block;
                &:hover {
                    text-decoration: underline;
                }
            }
        }

        &__separator {
            border-top: 2px solid #fff;
            height: 0px;
            width: 40%;
            margin: 10px 0;
        }

        .line {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &__label {
                opacity: 0.5;
            }

            &__value {
                &--has-link {
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }

</style>

<template>


    <div class="metadata" data-livefg>


        <div class="metadata--minimal">

            <div v-if="media" class="metadata__media">
                <span class="line">
                    <a class="line__value line__value--has-link"
                       @click.prevent="visit(media.absolute_url)">
                        {{ media.name }}
                    </a>
                </span>
            </div>

            <div v-if="media.artist" class="line">
                <span class="line__label">
                    by
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(media.artist.absolute_url)">
                    {{ media.artist.name }}
                </a>
            </div>

        </div>


        <div class="metadata--extended">
            <!--
            emission based metadata
            -->
            <div v-if="emission" class="metadata__emission">

            <span class="line">
                <span class="line__label">
                    Playlist
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(emission.content_object.absolute_url)"
                   @mouseover="trigger('playlist')"
                   @mouseleave="trigger()">
                    {{ emission.name }}
                </a>
            </span>

                <span class="line">
                <span class="line__label">
                    By
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(emission.user_co.absolute_url)"
                   @mouseover="trigger('author')"
                   @mouseleave="trigger()">
                    {{ emission.user_co.display_name }}
                </a>
            </span>

                <span class="line">
                <span class="line__label">Airtime</span>
                <span class="line__value">
                    <span v-if="is_onair">
                        {{ schedule_item.time_start | datetime2hhmmss }}
                    </span>
                    <span v-else>
                        {{ schedule_item.time_start | datetime2hhmmss }}
                        -
                        {{ schedule_item.time_end | datetime2hhmmss }}
                    </span>
                </span>
            </span>

            </div>

            <div class="metadata__separator" data-livefg></div>


            <!--
            media based metadata
            -->
            <div v-if="media" class="metadata__media">

            <span class="line">
                <span class="line__label">
                    Song
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(media.absolute_url)"
                   @mouseover="trigger('media')"
                   @mouseleave="trigger()">
                    {{ media.name }}
                </a>
            </span>

                <span v-if="media.artist" class="line">
                <span class="line__label">
                    by
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(media.artist.absolute_url)"
                   @mouseover="trigger('artist')"
                   @mouseleave="trigger()">
                    {{ media.artist.name }}
                </a>
            </span>

                <span v-if="media.release" class="line">
                <span class="line__label">
                    Release
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(media.release.absolute_url)"
                   @mouseover="trigger('release')"
                   @mouseleave="trigger()">
                    {{ media.release.name }}
                </a>
            </span>

                <span v-if="media.label" class="line">
                <span class="line__label">
                    Label
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(media.label.absolute_url)"
                   @mouseover="trigger('label')"
                   @mouseleave="trigger()">
                    {{ media.label.name }}
                </a>
            </span>


            </div>

            <div v-if="(media.relations.length > 0)">
                <div class="metadata__separator" data-livefg></div>
                <div class="metadata__relations">
                    <a v-for="relation in media.relations"
                       class="relation"
                       @click.prevent="visit(relation.url)">
                        {{ relation.name }}
                    </a>
                </div>
            </div>
        </div>

    </div>
</template>

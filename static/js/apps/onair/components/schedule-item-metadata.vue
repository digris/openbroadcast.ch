<script>

  import debounce from 'debounce';
  import {template_filters} from '../../../utils/template-filters';

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
      visit: function(url) {
        if (DEBUG) console.debug('visit', url);
      }
    },
    filters: template_filters
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';
    .metadata {
        &__emission {

        }
        &__media {

        }
        &__relations {
            .relation {
                &:hover {
                    text-decoration: underline;
                }
            }
        }
        &__separator {
            background: #000;
            height: 2px;
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
    <div class="metadata">

        <!--
        emission based metadata
        -->
        <div v-if="emission" class="metadata__emission">

            <span class="line">
                <span class="line__label">
                    Playlist
                </span>
                <a class="line__value line__value--has-link"
                   @click.prevent="visit(emission.absolute_url)"
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
                        <!-- TODO: remove after debugging -->
                        -
                        {{ schedule_item.time_end | datetime2hhmmss }}
                    </span>
                    <span v-else>
                        {{ schedule_item.time_start | datetime2hhmmss }}
                        -
                        {{ schedule_item.time_end | datetime2hhmmss }}
                    </span>
                </span>
            </span>

        </div>

        <div class="metadata__separator"></div>


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
            <div class="metadata__separator"></div>
            <div class="metadata__relations">
                <a v-for="relation in media.relations"
                   class="relation"
                   @click.prevent="visit(relation.url)">
                    {{ relation.name }}
                </a>
            </div>
        </div>

    </div>
</template>

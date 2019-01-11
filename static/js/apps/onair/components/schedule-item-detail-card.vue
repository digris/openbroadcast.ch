<script>

  import Vue from 'vue';

  import Visual from '../../../components/visual.vue';
  import {static_proxy_prefix} from '../../../api/utils';
  import {template_filters} from '../../../utils/template-filters';

  const DEBUG = false;

  export default {
    name: 'ScheduleItemDetailCard',
    props: [
      'schedule_item',
      'scope',
    ],
    components: {
      Visual,
    },
    computed: {
      item() {
        return this.schedule_item.item;
      },
      emission() {
        return this.schedule_item.emission;
      },
      content() {
        return get_content_for_scope(this.scope, this.schedule_item);
      }
    },
    filters: template_filters
  };


  const get_content_for_scope = function (scope, schedule_item) {

    // TODO: not so elegant, but handling in templates does not make things better
    // content should be delivered uniformly by API

    const item = schedule_item.item;
    const emission = schedule_item.emission;

    // content structure
    let content = {
      obj: [],
      name: null,
      description: null,
      tags: [],
      image: null
    };

    // playlist metadata
    if (scope === 'playlist') {
        const obj = emission.content_object;
        content.obj = obj;
        content.name = obj.name;
        content.description = obj.description;
        content.tags = obj.tags;
        content.image = static_proxy_prefix(obj.main_image);
    }

    if (scope === 'author') {
        const obj = emission.user_co_profile;
        content.obj = obj;
        content.name = obj.display_name;
        content.description = obj.biography;
        content.tags = obj.tags;
        content.image = static_proxy_prefix(obj.image);
    }

    // media/track metadata
    if (scope === 'media') {
      content.obj = item;
      content.name = item.name;
      content.description = item.description;
      content.tags = item.tags;
      content.image = static_proxy_prefix(item.release.main_image);
    }

    if (scope === 'artist') {
      content.obj = item.artist;
      content.description = item.artist.biography;
      content.name = item.artist.name;
      content.image = static_proxy_prefix(item.artist.main_image);
    }

    if (scope === 'release') {
      content.obj = item.release;
      content.description = item.release.description;
      content.name = item.release.name;
      content.tags = item.release.tags;
      content.image = static_proxy_prefix(item.release.main_image);
    }

    if (scope === 'label') {
      content.obj = item.label;
      content.description = item.label.description;
      content.name = item.label.name;
      content.tags = item.label.tags;
      content.image = static_proxy_prefix(item.label.main_image);
    }

    return content;

  };


</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .card {
        height: 100%;
        padding: 20px 20px 16px;
        display: flex;
        flex-direction: column;

        &__header {
            display: flex;
            margin-bottom: 10px;
            min-height: 96px;

            &__visual {
                width: 30%;
                margin-right: 10px;
            }

            &__title {
                flex-grow: 1;
                h3 {
                    margin: 0;
                }
            }
        }

        &__body {
            flex-grow: 1;
            overflow: hidden;
        }

        &__appendix {
            // background: yellow;
            margin-top: 20px;
            .tag {
                color: #000;
                font-size: 84%;
                background: #fff;
                display: inline-block;
                padding: 0 4px;
                margin: 0 4px 4px 0;
                border-radius: 2px;
                text-transform: uppercase;
            }
        }
    }

</style>

<template>
    <div class="card">
        <div class="card__header">
            <div class="card__header__visual">
                <visual v-bind:url="content.image"></visual>
            </div>
            <div class="card__header__title">
                <h3 v-if="content.name">{{ content.name }}</h3>
                <!-- ugly layout handling for various content types. see get_content_for_scope -->

                <!-- emission metadata -->
                <div v-if="(scope === 'playlist')">
                    <span v-if="emission.time_start">{{ emission.time_start | datetime2hhmm }}</span>
                    -
                    <span v-if="emission.time_end">{{ emission.time_end | datetime2hhmm}}</span>
                </div>
                <div v-if="(scope === 'author')">
                    <div v-if="(content.obj.pseudonym && content.obj.pseudonym !== content.name)">
                        <span>{{ content.obj.pseudonym }}</span>
                        <br>
                    </div>
                    <div v-if="(content.obj.city || content.obj.country)">
                        <span v-if="content.obj.city">{{ content.obj.city }}</span><span v-if="(content.obj.city && content.obj.country)">,</span>
                        <span v-if="content.obj.country">{{ content.obj.country }}</span>
                        <br>
                    </div>
                </div>

                <!-- track metadata -->
                <div v-if="(scope === 'media')">
                    <div v-if="(content.obj.mediatype || content.obj.version)">
                        <span v-if="content.obj.mediatype">{{ content.obj.mediatype | capitalize }}</span>
                        <span v-if="content.obj.version">({{ content.obj.version | capitalize }})</span>
                        <br>
                    </div>
                    <div v-if="content.obj.duration">
                        <span>{{ content.obj.duration | ms_to_time }}</span>
                    </div>
                </div>
                <div v-if="(scope === 'artist')">
                    <div v-if="content.obj.type">
                        <span>{{ content.obj.type | capitalize }}</span>
                        <br>
                    </div>
                    <div v-if="content.obj.country_name">
                        <span>{{ content.obj.country_name }}</span>
                        <br>
                    </div>
                    <div v-if="(content.obj.date_start || content.obj.date_end)">
                        <span v-if="content.obj.date_start">*{{ content.obj.date_start }}</span>
                        <span v-if="content.obj.date_end">&#x271D;{{ content.obj.date_end }}</span>
                    </div>
                </div>
                <div v-if="(scope === 'release')">
                    <div v-if="content.obj.releasetype">
                        <span>{{ content.obj.releasetype | capitalize }}</span>
                        <br>
                    </div>
                    <div v-if="(content.obj.country_code || content.obj.releasedate_approx)">
                        <span v-if="content.obj.country_code">{{ content.obj.country_code }}</span>
                        <span v-if="(content.obj.country_code && content.obj.releasedate_approx)">-</span>
                        <span v-if="content.obj.releasedate_approx">{{ content.obj.releasedate_approx }}</span>
                    </div>
                </div>
                <div v-if="(scope === 'label')">
                    <div v-if="content.obj.type_display">
                        <span>{{ content.obj.type_display }}</span>
                        <br>
                    </div>
                    <div v-if="(content.obj.date_start || content.obj.date_end)">
                        <span v-if="content.obj.date_start">*{{ content.obj.date_start }}</span>
                        <span v-if="content.obj.date_end">&#x271D;{{ content.obj.date_end }}</span>
                    </div>
                </div>

            </div>
        </div>
        <div class="card__body">
            <div v-if="content.description" v-html="$options.filters.linebreaksbr($options.filters.strip_markdown(content.description))"></div>
        </div>
        <div class="card__appendix">
            <div v-if="content.tags">
                <span v-for="tag in content.tags.slice(0, 6)" class="tag">{{ tag }}</span>
            </div>
        </div>
    </div>
</template>

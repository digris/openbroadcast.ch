<script>
    const DEBUG = false;
    export default {
        name: 'Webstream',
        computed: {
            streams() {
                return this.$store.getters['listener/streams'].sort((a,b) => a.bitrate - b.bitrate);
            },
        },
    }
</script>

<style lang="scss" scoped>
    .webstream {
        .stream {
            display: grid;
            grid-template: auto / 60px 90px auto 60px;
            padding: 4px 0;
            &__codec {
                text-transform: uppercase;
                padding-right: 1rem;
            }
            &__bitrate {
                text-align: right;
                padding-right: 1rem;
            }
            &__url {
                a {
                    border-bottom-style: none;
                }
            }
            &__m3u {
                text-align: right;
            }
        }
    }
</style>

<template>
    <div
        class="webstream">
        <!--<h1>The Streams...</h1>-->
        <div
            v-for="(stream, index) in streams"
            class="stream">
            <div
                class="stream__codec">
                {{ stream.codec }}
            </div>
            <div
                class="stream__bitrate">
                <span
                    v-if="stream.bitrate">
                    {{ stream.bitrate }} kb/s
                </span>
            </div>
            <div
                class="stream__url">
                <a
                    v-if="stream.url"
                    :href="stream.url"
                    target="_blank">
                    {{ stream.url }}
                </a>
            </div>
            <div
                class="stream__m3u">
                <a
                    v-if="stream.url"
                    :href="`/api/v2/listener/webstream${stream.path}.m3u`"
                    title="Zum Abspielen in iTunes, Media Player, VLC etc."
                    target="_blank">
                    M3U
                </a>
            </div>
        </div>
    </div>
</template>

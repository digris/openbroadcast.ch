<script>
    import debounce from 'debounce';
    import {template_filters} from '../../../utils/template-filters';

    const DEBUG = false;

    export default {
        props: [
            'position'
        ],
        data() {
            return {
                seek_active: false,
                seek_position: null,
            }
        },
        computed: {
            position_p: function () {
                return (this.position) ? (this.position * 100).toPrecision(4) : 0;
            },
        },
        methods: {
            seek: function (e) {
                const p = (e.offsetX / $(e.srcElement).parents('div').width()) * 100;
                this.$emit('seek', p);
            },
            seek_enter: function (e) {
                document.removeEventListener('mousemove', this.seek_move);
                document.addEventListener('mousemove', this.seek_move);
            },
            seek_leave: function (e) {
                document.removeEventListener('mousemove', this.seek_move);
            },
            seek_move: function (e) {
                //console.debug('seek_move', e);
                let _b = this.$refs.progress.getBoundingClientRect();
                let _x = Math.round(e.clientX - _b.x);
                this.seek_position = _x / _b.width * 100;
            },

            // seek: function (item, e) {
            //     const x = e.clientX;
            //     //const w = e.target.getBoundingClientRect().width;
            //     const w = window.innerWidth;
            //     const p = Math.round((x / w) * 100);
            //     this.$emit('seek', item, p);
            // },
            // seek_move: function(e) {
            //     // console.debug('seek_move', e);
            //     this.seek_position = Math.round(e.clientX / window.innerWidth * 100);
            // },
            // seek_enter: function(e) {
            //     //console.log('seek_enter > add listener', e);
            //     document.removeEventListener('mousemove', this.seek_move);
            //     document.addEventListener('mousemove', this.seek_move);
            // },
            // seek_leave: function(e) {
            //     // console.log('seek_leave > remove listener', e);
            //     document.removeEventListener('mousemove', this.seek_move);
            // },
        },
        filters: template_filters,
    }
</script>

<style lang="scss" scoped>

    .playhead {
        cursor: crosshair;
        height: 100%;
        position: relative;

        .progress-container {
            position: absolute;
            width: 100%;
            z-index: 9;
            background: rgba(#000, 0.5);
            height: 100%;
            //top: 5px;

            .progress-indicator {
                height: 100%;
                top: 0;
                left: 0;
                width: 0%;
                position: absolute;
                background: rgba(#fff, .6);
                border-right: 2px solid #fff;
            }
        }

        .seek-container {
            background: rgba(#fff, .3);
            border-right: 2px solid #fff;
            position: absolute;
            top: 0;
            height: 100%;
            width: 0%;
            z-index: 10;
            display: none;
        }

        &:hover {
            .seek-container {
                display: block;
            }
        }
    }

</style>

<template>
    <div class="playhead">
        <div class="playhead" @click="seek($event)" v-on:mouseover="seek_enter($event)"  v-on:mouseleave="seek_leave($event)">
            <div class="progress-container" ref="progress">
                <div class="progress-indicator" v-bind:style="{ width: position_p + '%' }"></div>
            </div>
            <div class="seek-container" v-bind:style="{ width: seek_position + '%' }"></div>
        </div>
    </div>
</template>

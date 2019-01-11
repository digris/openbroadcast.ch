<script>
    export default {
        name: 'Loader',
        props: {
          scale: Number,
          color: String,
          color_hover: String,
        },
        data() {
          return {
            hover: false,
          }
        },
        computed: {
          _scale() {
            return (this.scale) ? this.scale : 1;
          },
          _color() {
            return (this.color) ? this.color : '#fff';
          },
          _color_hover() {
            return (this.color_hover) ? this.color_hover : this._color;
          }
        },
    }
</script>
<style lang="scss" scoped>

    .spinner {
        width: 14px;
        height: 14px;
        text-align: center;
        font-size: 0;
    }

    .spinner > div {
        background-color: #f0f;
        height: 100%;
        width: 2px;
        display: inline-block;

        -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
        animation: sk-stretchdelay 1.2s infinite ease-in-out;
    }

    .spinner .rect2 {
        -webkit-animation-delay: -1.1s;
        animation-delay: -1.1s;
    }

    .spinner .rect3 {
        -webkit-animation-delay: -1.0s;
        animation-delay: -1.0s;
    }

    .spinner .rect4 {
        -webkit-animation-delay: -0.9s;
        animation-delay: -0.9s;
    }

    .spinner .rect5 {
        -webkit-animation-delay: -0.8s;
        animation-delay: -0.8s;
    }

    @-webkit-keyframes sk-stretchdelay {
        0%, 40%, 100% {
            -webkit-transform: scaleY(0.4)
        }
        20% {
            -webkit-transform: scaleY(1.0)
        }
    }

    @keyframes sk-stretchdelay {
        0%, 40%, 100% {
            transform: scaleY(0.4);
            -webkit-transform: scaleY(0.4);
        }
        20% {
            transform: scaleY(1.0);
            -webkit-transform: scaleY(1.0);
        }
    }

</style>
<template>
    <div class="spinner" v-bind:style="{ transform: `scale(${_scale})` }">
        <div class="rect1" v-bind:style="{ background: _color }"></div>
        <div class="rect2" v-bind:style="{ background: _color }"></div>
        <div class="rect3" v-bind:style="{ background: _color }"></div>
        <div class="rect4" v-bind:style="{ background: _color }"></div>
        <div class="rect5" v-bind:style="{ background: _color }"></div>
    </div>
</template>

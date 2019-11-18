<script>
    export default {
        name: 'Playing',
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

    .bars {
        width: 14px;
        height: 14px;
        text-align: center;
        font-size: 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .bars > div {
        background-color: #f0f;
        height: 100%;
        width: 2px;
        display: inline-block;

        animation: sk-stretchdelay 1.3s infinite;
    }

    .bars .rect2 {
        animation-delay: -.7s;
    }

    .bars .rect1 {
        animation-delay: .1s;
    }

    .bars .rect5 {
        animation-delay: -.2s;
    }

    .bars .rect2 {
        animation-delay: -.4s;
    }

    .bars .rect3 {
        animation-delay: -0.9s;
    }

    .bars .rect4 {
        animation-delay: -0.6s;
    }

    @keyframes sk-stretchdelay {
        0%, 80%, 100% {
            //transform: scaleY(0.4);
            height: 20%;
        }
        20% {
            //transform: scaleY(1.0);
            height: 90%;
        }
        40% {
            //transform: scaleY(1.0);
            height: 70%;
        }
        60% {
            //transform: scaleY(1.0);
            height: 80%;
        }
    }

</style>
<template>
    <div class="bars" v-bind:style="{ transform: `scale(${_scale})` }">
        <div class="rect1" v-bind:style="{ background: _color }"></div>
        <div class="rect2" v-bind:style="{ background: _color }"></div>
        <div class="rect3" v-bind:style="{ background: _color }"></div>
        <div class="rect4" v-bind:style="{ background: _color }"></div>
        <div class="rect5" v-bind:style="{ background: _color }"></div>
    </div>
</template>

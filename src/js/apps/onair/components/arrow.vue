<script>

  const DEBUG = false;
  export default {
    name: 'Arrow',
    props: [
      'disabled',
      'direction',
    ],
    methods: {
      click: function () {
        if(this.disabled) {
          return;
        }
        if (DEBUG) console.debug('emit click');
        this.$emit('click');
      }
    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .arrow {
        cursor: pointer;
        height: 120px;
        width: 120px;

        transition: opacity 500ms;

        &.disabled {
            opacity: .2;
            cursor: not-allowed;
        }

        &.right {
            transform: rotate(180deg);
        }

        .icon {
            height: 120px;
            width: 120px;
            border-radius: 50%;
            display: flex;
            align-items: center;

            svg {
                flex-grow: 1;
            }
        }
    }
</style>
<template>
    <div class="arrow" v-bind:class="{ disabled: disabled, right: direction === 'right' }" @click.prevent="click">
        <div class="icon" :data-livehover="(! disabled)">
            <svg version="1.1"
                 xmlns="http://www.w3.org/2000/svg"
                 xmlns:xlink="http://www.w3.org/1999/xlink"
                 x="0px"
                 y="0px"
                 width="50px"
                 height="72px"
                 viewBox="0 0 50 72"
                 enable-background="new 0 0 40 72"
                 xml:space="preserve">
                <polyline data-livestroke
                        fill="none"
                        stroke="#000000"
                        stroke-width="2"
                        stroke-miterlimit="10"
                        points="37.854,71 2.927,36.073 38,1 "
                        style="stroke: rgb(255, 255, 255);">
                </polyline>
            </svg>
        </div>
    </div>
</template>

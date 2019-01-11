<script>


  import ScheduleItemDetailCard from './schedule-item-detail-card.vue';
  const DEBUG = false;


  export default {
    name: 'ScheduleItemDetail',
    components: {
      ScheduleItemDetailCard,
    },
    props: [
      'schedule_item',
      'scope',
    ],
    mounted: function () {

    },
    computed: {
      item() {
        return this.schedule_item.item;
      },
      emission() {
        return this.schedule_item.emission;
      },
    },
    methods: {
      trigger: function (scope) {
        scope = (scope) ? scope : null;
        if (DEBUG) console.debug('trigger', scope);
        this.$emit('select_scope', scope);
      }
    }
  }
</script>
<style lang="scss" scoped>
    @import '../../../../sass/site/settings';

    .detail {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 999;
        background: #000;
        color: #fff;

        .inner {
            height: 100%;
        }

    }

    .outer-fade-enter-active, .outer-fade-leave-active {
        transition: opacity 350ms;
    }
    .outer-fade-enter, .outer-fade-leave-to {
        opacity: 0;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity 100ms;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

</style>

<template>
    <transition name="outer-fade">
        <div v-if="scope" class="detail">
            <transition name="fade" mode="out-in">
                <div :key="scope" class="inner">
                    <schedule-item-detail-card
                            v-if="schedule_item"
                            v-bind:scope="scope"
                            v-bind:key="scope"
                            v-bind:schedule_item="schedule_item">
                    </schedule-item-detail-card>
                </div>
            </transition>
        </div>
    </transition>
</template>

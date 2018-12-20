<script>
  const DEBUG = true;
  export default {
    name: 'Editable',
    props: [
      'content',
    ],
    mounted: function () {
      this.$el.innerText = this.content;
    },
    watch: {
      // content: function (new_value, old_value) {
      //   this.$el.innerText = new_value;
      // }
    },
    methods: {
      update: function (event) {
        this.$emit('update', this.$el.innerText);
      },
      reset: function() {
        this.$el.innerText = '';
      },
      focus: function () {
        this.$emit('focus');
      },
      blur: function () {
        this.$emit('blur');
      },
      commit: function () {
        this.update();
        console.debug('commit')
        this.$emit('commit', this.$el.innerText);
      },
    }
  }
</script>
<style lang="scss" scoped>
    @import '../../sass/site/settings';

    [contenteditable] {
        text-rendering: optimizeSpeed;
        margin: 0;
        outline: none;
    }

</style>

<template>
    <div contenteditable="true"
         @input="update"
         @focus="focus"
         @blur="blur"
         @keydown.enter.exact.prevent
         @keyup.enter.exact="commit"
    ></div>
</template>

<template>
	<span class="popover" v-bind:class="{ open: is_open }">
		<span class="popover__text" @mouseover="show_popover" @mouseout="hide_popover">
			{{ text }}
		</span>

		<div class="popover__container" v-if="is_open">
			<div class="content">
				{{ user.display_name }}
			</div>
		</div>
	</span>
</template>

<style lang="scss">

	.popover {
		//position: relative;
        //z-index: 101;

		&__container {
			background: #000;
			padding: 10px;
			//min-width: 300px;
			position: absolute;
			z-index: 999;
			left: 0;
			right: 0;

			.content {
				color: #fff;
				font-size: 100%;
				text-align: left;
			}
		}
	}
</style>

<script type="text/babel">

	export default {
    	name: 'UserPopover',
		props: {
			user: {
				type: Object,
				required: true
			},
			text: {
				type: String,
				required: true
			},
		},

		data(){
			return {
				is_open: false
			}
		},

		methods: {

    		show_popover() {
				this.is_open = true;
			},

    		hide_popover() {
				this.is_open = false;
			},
		},

		computed: {
		},
	}
</script>

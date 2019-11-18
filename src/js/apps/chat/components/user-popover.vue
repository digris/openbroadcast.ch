<script>

  import Loader from '../../../components/loader.vue';

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
    components: {
      Loader
    },
    data() {
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

      profile() {
        if (!this.user.remote_id) {
          return null;
        }

        const profile = this.$store.getters['user/profiles'][this.user.remote_id];

        if (typeof profile === 'undefined') {
          this.$store.dispatch('user/get_profile', this.user.remote_id);
        }

        return profile;
      },

    },
  }
</script>

<style lang="scss">
    .popover {

        &__text {
            border-bottom: 1px dotted #000;
        }

        &__container {
            background: #000;
            position: absolute;
            min-height: 90px;
            //width: 360px;
            z-index: 999;
            left: 0;
            right: 0;
        }

        .profile {
            color: #fff;
            font-size: 100%;
            text-align: left;
            display: flex;
            min-height: inherit;
            padding: 10px;

            &__visual {
                width: 33%;
            }

            &__body {
                width: 66%;
                //felx-grow: 1;
                padding-right: 10px;
                display: flex;
                flex-direction: column;

                .text {
                    flex-grow: 1;
                }

                .groups {
                    .group {
                        color: #000;
                        background: #999999;
                        display: inline-block;
                        padding: 0 4px;
                        margin: 0 2px 2px 0;
                        border-radius: 2px;
                        text-transform: capitalize;
                    }
                }
            }
        }

        .loading {
            text-align: center;
            padding: 10px;
            min-height: inherit;
            display: flex;
            justify-content: center;
			align-content: center;
			align-items: center;
        }

    }
</style>

<template>
	<span class="popover" v-bind:class="{ open: is_open }">
		<span class="popover__text" @mouseover="show_popover" @mouseout="hide_popover">{{ text }}</span>
		<div class="popover__container" v-if="is_open">

			<div v-if="profile" class="profile">
				<div class="profile__body">
					<div class="text">
						<span>{{ profile.display_name }}</span>
						<div v-if="(profile.city || profile.country)">
							<span v-if="profile.city">{{ profile.city }}</span>
							<span v-if="profile.country">{{ profile.country }}</span>
						</div>
					</div>
					<div class="groups">
						<span class="group" v-for="group in profile.groups.slice(0, 4)">{{ group }}</span>
					</div>
				</div>
				<div class="profile__visual">
					<img :src="profile.image">
				</div>
			</div>
			<div v-else class="loading">
				<loader :scale="2"></loader>
			</div>

		</div>
	</span>
</template>

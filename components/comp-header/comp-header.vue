<template>
	<up-sticky :customNavHeight="0">
		<!-- <view class="binner_box">
			<view class="guanbibox">
				<image class="guanbi" src="../../static/img/auth/close.png"></image>
			</view>
			<view class="binner_tit">
				Baixe e faça login no aplicativo para ganhar R$ 5,00
			</view>
			<view class="downloadbox">
				<view class="dot1"></view>
				<image src="../../static/img/auth/phone1.png"></image>
				Download
			</view>
		</view> -->
		<view class="top-home-bar">
			<view class="top-home-left">
				<!-- <image src="/static/img/home/switch.png" mode="" class="swich-icon" @click="asideOpen"></image> -->
				<image src="/static/logo.svg" mode="" class="logo" @click="handleLogo"></image>
			</view>
			<view class="top-home-right">
				<!-- 登录 -->
				<view class="login-wrap flex
				" v-if="userConfig.loginState()">
					<!-- <view class="user-item flex">
						<image src="/static/img/home/coin.png" mode="" class="fimg"></image>
						<view class="">1.000k</view>
					</view>
					<view class="user-item flex">
						<image src="/static/img/home/money.png" mode="" class="fimg"></image>
						<view class="">3.00k</view>
					</view>
					<view class="iconfont icon-arrow-down">
					</view> -->
					<image src="/static/img/home/avatar.png" mode="" class="avatar" @click="userOpen"></image>
				</view>
				<!-- 未登录 -->
				<view class="no-login-wrap flex" v-else>
					<view class="combtn login-btn" @click="handleJump('/pages/login/login')">Login</view>
					<!-- <view class="combtn regi-btn act" @click="handleJump('/pages/register/register')">
						Register
						<view class="red">R$3.00</view>
					</view> -->
				</view>
			</view>
		</view>
	</up-sticky>


</template>

<script setup>
	import {
		ref,
	} from 'vue';


	import {
		useUserStore
	} from '@/stores/user.js'

	const userConfig = useUserStore()

	const props = defineProps({

	})

	const emits = defineEmits(['open', 'useropen'])

	const gshow = ref(false)
	const asideShow = ref(false)
	const userShow = ref(false)
	const accountshow = ref(false)
	const walletshow = ref(false)
	const signshow = ref(false)

	const handleLogo = () => {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}

	const asideClose = () => {
		asideShow.value = false
	}
	const asideOpen = () => {
		asideShow.value = true
		emits('open');
	}

	const userClose = () => {
		userShow.value = false
	}
	const userOpen = () => {
		userShow.value = true
		emits('useropen');
	}
	const handleJump = (url) => {
		uni.navigateTo({
			url
		})
	}


	const gopen = () => {
		gshow.value = true;
	}
	const gclose = () => {
		gshow.value = false;
	}

	const gback = () => {
		gshow.value = false;
	}

	const accountclose = () => {
		accountshow.value = false
	}
	const accountopen = () => {
		accountshow.value = true
	}

	const walletclose = () => {
		walletshow.value = false
	}
	const walletopen = () => {
		walletshow.value = true
	}

	const signclose = () => {
		signshow.value = false
	}
	const signopen = () => {
		signshow.value = true
	}

	const userAttr = {
		userOpen,
		userClose,
		gopen,
		gclose,
		accountclose,
		accountopen,
		walletclose,
		walletopen,
		signopen,
		signclose

	}
</script>

<style lang="scss" scoped>
	@keyframes breath {
		0% {
			transform: scale(1)
		}

		to {
			transform: scale(1.1)
		}
	}

	.binner_box {
		width: 100%;
		height: 75rpx;
		background-image: linear-gradient(90deg, #ab33ff, #8335ef, #5a36de), linear-gradient(90deg, #dd0dff, #af1ef8, #812ef0), linear-gradient(90deg, #ff9700, #f64c1d, #ec0139), linear-gradient(#2ee820, #2ee820);
		background-blend-mode: normal, normal, normal, normal;
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.guanbibox {
			width: 34rpx;
			height: 31rpx;
			background-color: rgba(0, 0, 0, .3);
			border-radius: 0 0 14rpx;
			position: absolute;
			top: 0;
			left: 0;
			display: flex;
			justify-content: center;
			align-items: center;

			.guanbi {
				width: 32rpx;
				height: 32rpx;
				position: absolute;
			}
		}

		.downloadbox {
			width: 135rpx;
			animation: breath 1s infinite alternate;
			margin-right: 20rpx;
			height: 50rpx;
			background-color: #fff;
			border-radius: 10rpx;
			display: flex;
			align-items: center;
			justify-content: space-evenly;
			font-family: NeuronBold;
			font-size: 22rpx;
			letter-spacing: 0;
			color: #5b36de;
			line-height: 1;
			position: relative;

			.dot1 {
				position: absolute;
				right: -6rpx;
				top: -6rpx;
				border-radius: 50%;
				// border: unset;
				background-color: #e54141;
				width: 12rpx;
				height: 12rpx;
				border: 4rpx solid #0f0d22;
			}

			image {
				width: 18rpx;
				height: 22rpx
			}
		}

		.binner_tit {
			height: 21rpx;
			font-family: NeuronBold;
			font-size: 20rpx;
			font-weight: 400;
			font-stretch: normal;
			letter-spacing: 0;
			color: #fff;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-left: 16rpx;
			padding-top: 10rpx;
		}
	}

	.top-head-wrap {}

	.top-home-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 120rpx;
		padding: 0 20rpx;
		background-color: #1b164d;
		box-sizing: border-box;

		.top-home-left {
			display: flex;
			align-items: center;

			.swich-icon {
				width: 72rpx;
				height: 72rpx;
			}

			.logo {
				width: 132rpx;
				height: 64rpx;
				margin-left: 20rpx;
			}
		}

		.top-home-right {
			.no-login-wrap {
				.combtn {
					position: relative;
					min-width: 136rpx;
					height: 68rpx;
					line-height: 68rpx;
					text-align: center;
					font-size: 28rpx;
					font-weight: 600;
					color: #fff;
					background-color: #2d2971;
					border-radius: 40rpx;

					.red {
						position: absolute;
						top: -20rpx;
						right: 6rpx;
						width: 92rpx;
						height: 30rpx;
						text-align: center;
						line-height: normal;
						font-size: 20rpx;
						color: #fff;
						background-color: red;
						overflow: hidden;
					}

					&.regi-btn {
						min-width: 180rpx;
						margin-left: 20rpx;
					}

					&.act {
						background: linear-gradient(to right, #9331e6, #5b35de);
					}
				}
			}

			.login-wrap {
				color: #fff;
				font-size: 24rpx;

				.user-item {
					margin-left: 10rpx;

					&:first-child {
						margin-left: 0;
					}
				}

				.fimg {
					width: 46rpx;
					height: 46rpx;
					margin-right: 2rpx;
				}

				.iconfont {
					margin: 0 6rpx;
					color: #fff;
					font-size: 24rpx;
				}

				.avatar {
					width: 64rpx;
					height: 64rpx;
				}
			}
		}
	}


	.gift-wrap {
		width: 690rpx;
		padding: 0 20rpx 60rpx 20rpx;
		background-color: #2b227a;
		border-radius: 20rpx;
		box-sizing: border-box;

		.ginput {
			margin-top: 20rpx;
			padding-left: 10rpx;
			height: 80rpx;
			line-height: 80rpx;
			color: #fff;
			background-color: #1c155c;
			box-sizing: border-box;
			border-radius: 10rpx;
		}

		.btn {
			width: 272rpx;
			height: 82rpx;
			margin: 80rpx auto 0 auto;
			line-height: 82rpx;
			text-align: center;
			font-size: 28rpx;
			color: #fff;
			border-radius: 40rpx;
			background-color: #1c155c;
		}
	}
</style>
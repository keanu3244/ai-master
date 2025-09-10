<template>
	<view class="login-wrap">
		<view class="title">听你说</view>
		<view class="login_btn" @click="handleLogin">
			微信登录
		</view>
		<view class="agreement">
			<up-checkbox :customStyle="{marginBottom: '8px'}" label="" name="agree" usedAlone
				v-model:checked="aloneChecked">
				<template #label>
					<view>
						<text>同意</text>
						<text class="act" @click="jumpage">用户协议</text>
						<text>与</text>
						<text class="act" @click="jumpage">隐私条款</text>
					</view>
				</template>
			</up-checkbox>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		ref
	} from 'vue';
	import {
		useUserStore
	} from '@/stores/user.js'



	const userConfig = useUserStore()
	const aloneChecked = ref(false)
	const typeRef = ref(1)

	const pathMap = {
		1: '/pages/index/home',
		2: '/pages/setting/info'
	}

	const jumpage = () => {
		uni.navigateTo({
			url: '/pages/setting/info'
		})
	}

	onLoad((opt) => {
		console.log('login-onLoad..', opt)
		const {
			type
		} = opt;
		if (type) {
			typeRef.value = type
		}
	})

	const loginWithCode = (code) => {
	    uni.request({
	        url: 'http://localhost:8080/chat/login',
	        method: 'POST',
	        data: {
	            code: code
	        },
			header: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
	        success: (res) => {
				uni.setStorageSync('token', res.data.openid)
				// uni.setStorageSync('userInfo', 'admin')
				uni.navigateBack()
	        },
	        fail: (err) => {
				uni.$u.toast('微信登录失败:', err);
	        }
	    });
	}

	const handleLogin = () => {
		if (!aloneChecked.value) {
			uni.$u.toast('请勾选用户协议与隐私政策')
			return;
		}
		
		uni.login({
			provider: 'weixin',
			success: (res) => {
			  // 获取登录凭证 code
			  const code = res.code;
			  loginWithCode(code);
			},
			fail: (err) => {
				uni.$u.toast('微信登录失败:', err);
			}
		});
	}
</script>

<style lang="scss" scoped>
	.login-wrap {
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #fff;

		.title {
			padding: 0 0 80rpx 0;
			text-align: center;
			font-size: 44rpx;
			font-weight: bold;
			color: #000;
		}

		.login_btn {
			width: 272rpx;
			height: 92rpx;
			line-height: 92rpx;
			text-align: center;
			color: #fff;
			font-size: 36rpx;
			background: #03C160;
			border-radius: 12rpx;
		}

		.agreement {
			padding: 20rpx 0 0 0;

			.act {
				color: $uni-color-primary;
			}
		}
	}
</style>
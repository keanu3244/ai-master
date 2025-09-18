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

	const handleLogin =async () => {
		if (!aloneChecked.value) {
			uni.$u.toast('请勾选用户协议与隐私政策')
			return;
		}
		
		// uni.login({
		// 	provider: 'weixin',
		// 	success: (res) => {
		// 	  // 获取登录凭证 code
		// 	  const code = res.code;
		// 	  loginWithCode(code);
		// 	},
		// 	fail: (err) => {
		// 		uni.$u.toast('微信登录失败:', err);
		// 	}
		// });
 try {
   this.error = null;
   let res = await uni.login({
     provider: 'weixin'
   });
   if (res.code) {
     console.log('code', res.code);
     // 发送code到后端
     const callbackRes = await uni.request({
       url: 'https://www.listentoyouai.com:80/chat_login/wechat/auth_login',
       //url: 'http://127.0.0.1:5001/chat_login/wechat/auth_login',
       method: 'POST',
       header: {
         'Content-Type': 'application/json'
       },
       data: {
         code: res.code
       }
     });
     
     if (callbackRes.statusCode === 200) {
       const tokenData = callbackRes.data;
       uni.setStorageSync('token', tokenData.access_token);
       uni.setStorageSync('username', tokenData.username);
       this.isLoggedIn = true;
       this.userInfo = {
         nickName: tokenData.username || '未命名',
         avatarUrl: tokenData.headimg || '/static/img/home/test.jpg',
         sex: tokenData.sex,
         user_birthday: tokenData.user_birthday
       };
     
       // 可选：跳转到个人中心
       uni.reLaunch({ url: '/pages/user/my' });
     }
     else if (callbackRes.statusCode === 403) {
       uni.$u.toast('用户不存在，请注册')
       uni.navigateTo({
         url: '/pages/user/userinfo'
       })
     }
     else {
        uni.$u.toast('登录失败，请重试')
       // this.error = '登录失败，请重试';
     }
   } else {
     // this.error = '获取微信登录凭证失败';
     uni.$u.toast('获取微信登录凭证失败')
   }
 } catch (err) {
   console.error('请求失败:', err);
   // this.error = '网络异常，请检查网络连接';
 }
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
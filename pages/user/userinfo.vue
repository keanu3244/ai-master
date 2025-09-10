<template>
	<view class="form_wrap">
		<image src="/static/img/scence/ai_bg.png" mode="aspectFill" class="bg_wrap"></image>
		<view class="chat_list" id="chatList">
			<view class="chat_item-left">
				<view class="chat_logo">
					<image src="/static/img/scence/ai_author.png" mode=""></image>
				</view>
				<view class="chat_container">
					<view class="chat_content">您的个人头像是？</view>
					<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="chat_extra-age"  v-if="avatarUrl==='' ">
						请点击获取用户头像
					</button>
				</view>
				
			</view>
			<view class="chat_item-right mrb" v-if="avatarUrl !==''" :class="{'fade-in': avatarUrl}">
				<view class="chat_container">
					<image :src="avatarUrl" mode="aspectFill" class="avatarUrl"></image>
				</view>
			</view>
			<view class="chat_item-left" v-if="firstQuestion">
				<view class="chat_logo">
					<image src="/static/img/scence/ai_author.png" mode=""></image>
				</view>
				<view class="chat_container">
					<!-- <view class="chat_content">您的个人称昵是？</view> -->
					<!-- <view class="chat_content">现在请设置您的称昵</view> -->
					<input class="chat_content" type="nickname" placeholder="请点击输入框获取称昵" v-model="inputValue" />
				</view>
			</view>
			<view class="chat_item-right mrb" v-if="inputValue" :class="{'fade-in': inputValue}">
					<view class="chat_container">
						<view class="chat_content">您的昵称是{{inputValue}}</view>
					</view>
			</view>
			<view class="chat_item-left" v-if="twoQuestion">
				<view class="chat_logo">
					<image src="/static/img/scence/ai_author.png" mode=""></image>
				</view>
				<view class="chat_container">
					<view class="chat_content">现在请选择您的性别</view>
					<view class="chat_extra-sex">
						<view :class="['sex_item', sexnum == 0 && 'sex_item_boy_act']" @click="handleSex(0)">
							<image class="sex-logo" src="/static/img/scence/boy.png" />男生
						</view>
						<view :class="['sex_item','girl',sexnum == 1 && 'sex_item_boy_act']" @click="handleSex(1)">
							<image class="sex-logo" src="/static/img/scence/girl.png" />女生
						</view>
					</view>
				</view>
			</view>
			<view class="chat_item-right" v-if="twoQuestion&&(sexnum == 0 || sexnum == 1)"
				:class="{'fade-in': sexnum >= 0}">
				<view class="chat_container">
					<view class="chat_content">我是{{sexnum == 0 ? '男生': '女生'}}</view>
				</view>
			</view>
			<view class="chat_item-left" v-if="threeQuestion">
				<view class="chat_logo">
					<image src="/static/img/scence/ai_author.png" mode=""></image>
				</view>
				<view class="chat_container">
					<view class="chat_content">接下来告诉我：你的年龄</view>
					<view class="chat_extra-age" @click="calendarShow = true">点击设置您的出生日期</view>
					<up-datetime-picker :formatter="formatter" :show="calendarShow" :min-date="minDate" :max-date="maxDate" mode="date" v-model="dateval"
						ref="datetimePickerRef" class="chat_extra-age" @confirm="handleConfirm"
						@cancel="calendarShow = false"></up-datetime-picker>
				</view>
			</view>
			<view class="chat_item-right mrb" v-if="threeQuestion&&date" :class="{'fade-in': date}">
				<view class="chat_container">
					<view class="chat_content">{{date}}</view>
				</view>
			</view>
			<view class="chat_item-left" v-if="fourQuestion">
				<view class="chat_logo">
					<image src="/static/img/scence/ai_author.png" mode=""></image>
				</view>
				<view class="chat_container">
					<view class="chat_content">最后需要您同意<text class="chat_link" @click="jumpage">《用户隐私协议》</text></view>
				</view>
			</view>

			<view class="chat_submit_btn" @click="handleSubmit" v-if="fourQuestion"
				:class="{'fade-in': fourQuestion}">
				同意协议，完成身份注册
			</view>
			<view id="anchor"></view>
		</view>


		<!-- <view class="send_wrap">
			<view class="send_content">
				<input type="text" class="send_input" placeholder="吐槽你最近的烦心事" placeholder-class="send_pl"
					v-model="send_val" />
				<image src="/static/img/scence/send2.png" class="send_img" @click="handleSend"></image>
			</view>
		</view> -->
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		nextTick
	} from 'vue';
	import {
		onReady
	} from '@dcloudio/uni-app';
	const firstQuestion = ref(false)
	const twoQuestion = ref(false)
	const threeQuestion = ref(false)
	const fourQuestion = ref(false)
	//const avtor = ref('')
	//const nickname = ref('')
	const calendarShow = ref(false)
	const date = ref('')
	const dateval = ref(Date.now())
	const aloneChecked = ref(false);
	const sexnum = ref(-1);
	const datetimePickerRef = ref(null);
	const inputValue = ref('') //称昵输入
	// 新增：头像相关
	const avatarUrl = ref(''); // 用户选择的头像
	const minDate = new Date(1900, 0, 1).getTime();
	const maxDate = new Date().getTime();
	// 添加滚动方法
	const scrollToBottom = () => {
		nextTick(() => {
			const query = uni.createSelectorQuery().in(this);
			query.select('#anchor').boundingClientRect();
			query.select('#chatList').boundingClientRect();
			query.exec((res) => {
				if (res[0] && res[1]) {
					uni.pageScrollTo({
						scrollTop: res[0].top + res[1].scrollTop,
						duration: 300
					});
				}
			});
		});
	};
	onReady(() => {
		scrollToBottom()
	})
	//监听数据变化控制问题顺序
	watch(avatarUrl, (newavatarUrl) => {
		if (newavatarUrl !='') {
			setTimeout(() => {
				firstQuestion.value = true;
			}, 500);
		}
	});
	
	watch(inputValue, (newinputValue) => {
		if (newinputValue !='') {
			setTimeout(() => {
				twoQuestion.value = true;
			}, 500);
		}
	});
	
	watch(sexnum, (newVal) => {
		if (newVal === 0 || newVal === 1) {
			setTimeout(() => {
				threeQuestion.value = true;
			}, 500);
		}
	});

	watch(date, (newDate) => {
		if (newDate) {
			setTimeout(() => {
				fourQuestion.value = true;
			}, 500);
		}
	});
	const formatter = (type, value) => {
		if (type === 'year') {
			return `${value}年`;
		}
		if (type === 'month') {
			return `${value}月`;
		}
		if (type === 'day') {
			return `${value}日`;
		}
		return value;
	};
	const timeFormat = uni.$u.timeFormat;
	const handleConfirm = (e) => {
		calendarShow.value = false;
		console.log(e, dateval.value, timeFormat(dateval.value, 'yyyy-mm-dd'))
		date.value = timeFormat(dateval.value, 'yyyy-mm-dd');
	}

	const jumpage = () => {
		uni.navigateTo({
			url: '/pages/setting/info'
		})
	}

	const handleSex = (num) => {
		sexnum.value = num;
	}
	const handleSubmit = async () => {
		if (!avatarUrl.value) {
			uni.$u.toast('请点击获取微信用户信息')
			return;
		}
		if (!inputValue.value) {
			uni.$u.toast('请点击获取微信用户信息')
			return;
		}
		if (date.value == '点击设置你的出生日期') {
			uni.$u.toast('请点击设置你的出生日期')
			return;
		}
	
		try {
			// 获取微信登录凭证
			const loginRes = await uni.login({ provider: 'weixin' });
			const code = loginRes.code; // 注意：uni.login 返回的是数组 [err, res]
	
			if (!code) {
				uni.$u.toast('获取微信登录凭证失败');
				return;
			}
	
			console.log('微信登录 code:', code);
	
			// 发送注册请求
			const callbackRes = await uni.request({
				url: 'https://www.listentoyouai.com:80/user/register',
				//url: 'http://127.0.0.1:5001/user/register',
				method: 'POST',
				header: {
					'Content-Type': 'application/json'
				},
				data: {
					code: code,
					username: inputValue.value,
					img: avatarUrl.value,
					user_birthday: date.value,
					sex: sexnum.value
				}
			});
	
			console.log('提交信息:', callbackRes);
	
			if (callbackRes.statusCode === 200) {
				const tokenData = callbackRes.data;
				uni.setStorageSync('token',tokenData.access_token);
				uni.$u.toast('注册成功');
	
				// 页面跳转
				uni.navigateTo({
					url: '/pages/setting/train'
				})
			} 
			else if (callbackRes.statusCode === 201){
				uni.$u.toast('用户已注册,请登录');
					
				// 页面跳转
				uni.navigateTo({
					url: '/pages/user/my'
				})
			}
			else {
				uni.$u.toast('注册失败，请重试');
			}
		} catch (error) {
			console.error('请求异常:', error);
			uni.$u.toast('网络异常，请稍后再试');
		}
	};
	
	// 新增：选择头像方法
	const onChooseAvatar = (e) => {
		//console.log('onChooseAvatar triggered', e);
		      
		// 1. 解构获取微信返回的头像临时路径
		const tempFilePath = e.detail.avatarUrl;
		uni.uploadFile({
			    url: 'https://www.listentoyouai.com:80/file_upload/picture', // 你的服务器接口地址
			    filePath: tempFilePath, // 头像临时路径
			    name: 'file', // 服务器接收文件的参数名
			    success: (res) => {
			        let url_data = JSON.parse(res.data);
					const saveavatarUrl = url_data.url
					avatarUrl.value = saveavatarUrl;
			        console.log('上传成功，服务器返回的永久链接：', saveavatarUrl);
			    },
			    fail: (err) => {
			        console.error('上传失败：', err);
			    }
			})
	}
</script>

<style lang="scss" scoped>
	.form_wrap {
		position: relative;
		display: flex;
		flex-direction: column;

		.bg_wrap {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100vh;
			/* #ifdef MP-WEIXIN */
			z-index: -1;
			/* #endif */
		}
		
		// .input-container {
		//   width: 100%;
		//   display: flex;
		//   align-items: center;
		//   margin-top: 20px;
		//   border-top: 1px solid #e0e0e0;
		//   padding-top: 10px;
		// }
		// .input-field {
		//   flex: 1;
		//   padding: 10px;
		//   border: none;
		//   border-radius: 20px;
		//   background-color: #f0f8ff; /* 蓝色背景 */
		//   font-size: 16px;
		//   color: #333;
		// }
		
		// .input-field::placeholder {
		//   color: #999;
		// }
		
		.label {
		  font-size: 14px;
		  color: #333;
		  margin-right: 10px;
		}
		
		.input {
		  flex: 1;
		  font-size: 14px;
		  color: #999;
		}
		
		.chat_list {
			position: relative;
			width: 100%;
			max-height: calc(100vh - 260rpx);
			padding: 20rpx;
			z-index: 99;
			box-sizing: border-box;
			overflow-y: auto;

			/* 添加动画效果 */
			.fade-in {
				animation: fadeIn 0.5s ease-in-out;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
					transform: translateX(20px);
				}

				to {
					opacity: 1;
					transform: translateX(0);
				}
			}

			.chat_submit_btn {
				width: 510rpx;
				height: 88rpx;
				background: linear-gradient(180deg, #36B2FF 0%, #1A58EB 100%);
				border-radius: 44rpx 44rpx 44rpx 44rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				margin-top: 190rpx;
				margin-left: 88rpx;
			}

			.chat_item-right {
				display: flex;
				justify-content: flex-end;

				&.mrb {
					margin-bottom: 20rpx;
				}

				.chat_container {
					flex: 1;
					display: flex;
					justify-content: flex-end;

					.chat_content {
						display: inline-flex;
						word-break: break-all;
						border-radius: 48rpx 0 48rpx 48rpx;
						background: linear-gradient(180deg, #6EECFF 0%, #49A7FF 100%);
						border: 2rpx solid rgba(40, 40, 43, 0.1);
						line-height: 42rpx;
						padding: 26rpx;
						font-size: 28rpx;
						color: #101216;
					}

					.avatarUrl {
						width: 320rpx;
						height: 320rpx;
						border-radius: 16rpx;
					}
				}
			}

			.chat_item-left {
				display: flex;
				margin-bottom: 32rpx;

				.chat_logo {
					flex-shrink: 0;
					width: 72rpx;
					height: 72rpx;
					// background: #FF809B;
					border-radius: 36rpx 36rpx 36rpx 36rpx;
					margin-right: 16rpx;

					image {
						width: 72rpx;
						height: 72rpx;
						border-radius: 50%;
					}
				}

				.chat_container {
					flex: 1;

					.chat_extra-sex {
						display: flex;
						margin-top: 16rpx;

						.sex_item {
							width: 240rpx;
							height: 88rpx;
							background: rgba(148, 214, 255, 0.3);
							border-radius: 48rpx 48rpx 48rpx 48rpx;
							border: 2rpx solid rgba(0, 0, 0, 0.05);
							display: inline-flex;
							align-items: center;
							justify-content: center;
							color: #1466E2;
							border: 2rpx solid transparent;
							margin-right: 32rpx;

							.sex-logo {
								margin-right: 16rpx;
								width: 40rpx;
								height: 40rpx;
							}

							&.girl {
								color: #fff;
								background: linear-gradient(180deg, #FF98E5 0%, #EF50C6 100%);
							}

							&.sex_item_boy_act {
								border-color: #1466E2;
							}

							&.sex_item_gril_act {
								border-color: #1466E2;
							}
						}
					}

					.chat_extra-age {
						min-width: 510rpx;
						height: 88rpx;
						background: linear-gradient(180deg, #36B2FF 0%, #1A58EB 100%);
						border-radius: 44rpx 44rpx 44rpx 44rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						color: #fff;
						margin-top: 16rpx;
					}

					.chat_content {
						display: inline-flex;
						word-break: break-all;
						background: linear-gradient(180deg, #FFFFFF 0%, #FFF9F2 100%);
						border-radius: 0 36rpx 36rpx 36rpx;
						border: 1rpx solid rgba(0, 0, 0, 0.1);
						line-height: 42rpx;
						padding: 26rpx;
						font-size: 28rpx;
						color: #101216;

						.chat_link {
							color: #195ECC;
						}
					}
				}
			}
		}

		.send_wrap {
			position: fixed;
			bottom: 20rpx;
			left: 0;
			width: 100%;
			height: 220rpx;
			background: rgba(255, 255, 255, 0.5);
			border-radius: 48rpx 48rpx 0 0;
			z-index: 1000;

			.send_content {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 686rpx;
				height: 96rpx;
				margin: 40rpx auto 0 auto;
				background: #FFFFFF;
				box-shadow: 0px 8 48rpx 0px rgba(22, 52, 151, 0.3);
				border-radius: 48rpx;
				box-sizing: border-box;
			}

			.send_input {
				flex: 1;
				paadding-left: 30rpx;
				color: #161210;
				background: transparent;
				box-sizing: border-box;
			}

			:deep(.send_pl) {
				color: rgba(255, 255, 255, 0.7);
			}

			.send_img {
				width: 64rpx;
				height: 64rpx;
				margin-left: 10rpx;
				margin-right: 10rpx;
			}
		}
	}
</style>
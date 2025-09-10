<template>
	<view class="form_wrap">
		<view class="com_item">
			Hi，我是小芽教练，为了帮您解决问题，需要了解您的情况？
		</view>
		<view class="com_item">
			您期望AI的性别是？
		</view>
		<view class="com_item colum">
			<span class="sex_item" :class="{act:sexnum == 0}" @click="handleSex(0)">男生</span>
			<span class="sex_item" :class="{act:sexnum == 1}" @click="handleSex(1)">女生</span>
		</view>
		<view class="com_item">
			接下来告诉我，AI的年龄吧
		</view>
		<view class="com_item colum">

			<up-datetime-picker :formatter="formatter" :show="calendarShow" mode="date" v-model="dateval"
				ref="datetimePickerRef" @confirm="handleConfirm"></up-datetime-picker>
			<span class="sex_item" @click="calendarShow = true">{{date}}</span>
		</view>
		<view class="com_item">
			接下来设置AI的性格？
		</view>
		<view class="com_item colum">
			<span class="sex_item" :class="{act:characterType == 0}" @click="handleCharacter(0)">成熟稳重</span>
			<span class="sex_item" :class="{act:characterType == 1}" @click="handleCharacter(1)">风趣幽默</span>
		</view>

		<view class="com_item">
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

		<button class="submit" type="primary" @click="handleSubmit">
			提交资料
		</button>


	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		onReady
	} from '@dcloudio/uni-app';
	const avtor = ref('')
	const nickname = ref('')
	const calendarShow = ref(false)
	const date = ref('点击设置你的出生日期')
	const dateval = ref(Date.now())
	const aloneChecked = ref(false);
	const sexnum = ref(-1);
	const characterType = ref(-1);
	const datetimePickerRef = ref(null);
	onReady(() => {
		// 微信小程序需要用此写法
		datetimePickerRef.value.setFormatter(formatter);
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
		date.value = timeFormat(dateval.value, 'yyyy-mm-dd')
	}

	const jumpage = () => {
		uni.navigateTo({
			url: '/pages/setting/info'
		})
	}

	const handleSex = (num) => {
		sexnum.value = num
	}

	const handleCharacter = (character) => {
		characterType.value = character
	}
	
	const handleSubmit = async () => {
		if (sexnum.value === -1) {
			uni.$u.toast('请点击设置AI的性别信息')
			return;
		}
		if (characterType.value === -1) {
			uni.$u.toast('请点击设置AI的性格信息')
			return;
		}
		if (date.value == '点击设置你的出生日期') {
			uni.$u.toast('请点击设置你的出生日期')
			return;
		}
		if (!aloneChecked.value) {
			uni.$u.toast('请勾选用户协议与隐私政策')
			return;
		}
		// const params = {
		// 	usernname: nickname.value,
		// 	img: avtor.value,
		// 	date: date.value,
		// 	sex: sexnum.value,
		// 	character: characterType.value
		// }
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
				url: 'https://www.listentoyouai.com:80/ai/register',
				//url: 'http://127.0.0.1:5001/ai/register',
				method: 'POST',
				header: {
					'Content-Type': 'application/json'
				},
				data: {
					code: code,
					character_ai: characterType.value,
					age_ai: date.value,
					sex_ai: sexnum.value
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
				uni.$u.toast('ai信息已注册,请勿重复提交');							
				// 页面跳转
				uni.navigateTo({
					url: '/pages/setting/train'
				})
			}
			else {
				uni.$u.toast('注册失败，请重试');
			}
		} catch (error) {
			console.error('请求异常:', error);
			uni.$u.toast('网络异常，请稍后再试');
		}
	}
</script>

<style lang="scss" scoped>
	.form_wrap {
		padding: 20rpx;
	}

	.com_item {
		display: flex;
		align-items: center;
		padding-top: 40rpx;

		.avtor {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
		}

		&.colum {
			flex-direction: column;
			justify-content: center;
		}

		.sex_item {

			min-width: 240rpx;
			padding: 5rpx;
			height: 80rpx;
			margin-bottom: 20rpx;
			line-height: 80rpx;
			text-align: center;
			color: #fff;
			background-color: skyblue;
			border-radius: 6rpx;

			&.act {
				background-color: pink;
			}
		}


	}

	.button {
		padding: 40rpx 20rpx;
	}

	.submit {
		margin: 60rpx 0 0 0;
	}
</style>
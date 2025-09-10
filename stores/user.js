// stores/counter.js
import {
	defineStore
} from 'pinia';
import {
	ref
} from 'vue';
import {
	request
} from '@/utils/request.js'

export const useUserStore = defineStore('user', () => {

	const userInfo = ref({})

	async function login(config) {
		try {
			const res = await request({
				data: config,
				url: '/Sys_User_YS/APPLogin'
			})
			const {
				Data,
				Status,
				Message
			} = res;
			if (Status) {
				userInfo.value = Data;
				uni.setStorageSync('token', Data.token)
				uni.setStorageSync('userInfo', Data)
				uni.showToast({
					icon: 'none',
					title: '登录成功'
				})
			} else {
				uni.showToast({
					icon: 'none',
					title: Message
				})
			}
			return Data;

		} catch (e) {
			//TODO handle the exception
			return e
		}
	}

	function setUserInfo(data) {
		userInfo.value = data
	}

	return {
		userInfo,
		setUserInfo,
		login
	};
});
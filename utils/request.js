export const typeFn = (data) => Object.prototype.toString.call(data).slice(8, -1); //Number
export const baseUrl = 'http://124.221.137.201:8081';
export const apiUrl = 'http://124.221.137.201:8081/api';
export const request = async (config) => {
	const {
		data,
		url,
		method = 'POST',
		dataType,
		header
	} = config;
	const token = uni.getStorageSync('token')
	const headerParams = {}
	if (token) {
		headerParams.Authorization = 'Bearer ' + token;
	}
	return new Promise((resolve, reject) => {
		uni.request({
			url: apiUrl + url,
			method,
			data,
			header: {
				...headerParams,
				...header
			},
			success: res => {
				const {
					statusCode,
					data
				} = res;
				if (statusCode == 200) {
					resolve(data);
				}
				if (statusCode == 401) {
					uni.$u.toast('token失效了，请重新登录')
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/user/userinfo'
						})
						resolve(data);
					}, 100)

				}

			},
			fail: (err) => {
				reject(err)
			},
			complete: () => {}
		});
	})
};



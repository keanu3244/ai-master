<template>
  <view class="my_wrap">
    <image src="/static/img/scence/ai_bg.png" mode="aspectFill" class="bg_wrap"></image>

    <view class="item_img">
      <image :src="userInfo.avatarUrl || '/static/img/home/avatar.png'" mode="aspectFit" class="img"></image>
    </view>

    <view class="item">
      <span>名称：</span>
      <span>{{ userInfo.nickName || '--' }}</span>
    </view>
    <view class="item">
      <span>性别：</span>
      <span>{{ genderText }}</span>
    </view>
    <view class="item">
      <span>生日：</span>
      <span>{{ userInfo.user_birthday || '--' }}</span>
    </view>

    <view class="btn-group">
      <button v-if="!isLoggedIn" @click="login">登录</button>
      <button v-if="isLoggedIn" @click="logout">退出登录</button>
    </view>

    <view v-if="loading" class="loading">正在加载用户信息...</view>
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      isLoggedIn: false,
      loading: false,
      error: null
    };
  },
  computed: {
    genderText() {
		const sex = parseInt(this.userInfo.sex);

	    if (sex === undefined || sex === null) {
		   return '--'; // 数据缺失
	    }

	    if (sex === 0) {
		   return '男'; // 0 表示男性
	    } else if (sex === 1) {
		   return '女'; // 1 表示女性
	    } else {
		   return '--'; // 其他非法值也显示为 --
	    }
	}
  },
  // onLoad(query) {
  //   if (query.code) {
  //     // 处理授权回调
  //     this.handleCallback(query.code);
  //   } else {
  //     this.fetchUserInfo();
  //   }
  // },
  onLoad() {
  	this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
          const token = uni.getStorageSync('token');
          if (!token) {
            this.isLoggedIn = false;
            this.error = '未登录，请先登录';
            return;
          };
    
          try {
            const res = await uni.request({
              url: 'https://www.listentoyouai.com:80/query_data/get_user_info',
			  //url: 'http://127.0.0.1:5001/query_data/get_user_info',
              method: 'POST',
              header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
    
            if (res.statusCode === 200) {
			  uni.setStorageSync('token', tokenData.access_token);
			  uni.setStorageSync('username', tokenData.username);
			  this.loading = true;
			  this.isLoggedIn = true;
			  const resData = res.data;
              this.userInfo = {
                nickName: resData.username || '未命名',
                avatarUrl: resData.headimg || '/static/img/home/avatar.png',
                sex: resData.sex,
                user_birthday: resData.user_birthday
              };
              } 
		else if (res.statusCode === 403){
		uni.$u.toast('用户不存在，请注册')
		uni.navigateTo({
			url: '/pages/user/userinfo'})
		}  
		else {
              this.error = '用户信息获取失败';
            }
          } catch (err) {
            console.error('请求失败:', err);
            this.error = '网络异常，请检查网络连接';
          } finally {
            this.loading = false;
          }
        },


    async login() {
      try {
        this.error = null;
        let res = await uni.login({
          provider: 'weixin'
        });
        if (res.code) {
		  console.log(res.code);
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
            // uni.reLaunch({ url: '/pages/user/my' });
          } 
		  else if (callbackRes.statusCode === 403){
		  uni.$u.toast('用户不存在，请注册')
		  uni.navigateTo({
		  	url: '/pages/user/userinfo'})
		  }  
		  else {
            this.error = '登录失败，请重试';
          }
        } else {
          this.error = '获取微信登录凭证失败';
        }
      } catch (err) {
        console.error('请求失败:', err);
        this.error = '网络异常，请检查网络连接';
      }
    },

    async logout() {
      uni.removeStorageSync('token');
      this.isLoggedIn = false;
      this.userInfo = {};
      uni.showToast({ title: '已退出登录' });

      // 可选：跳转到登录页
      // uni.reLaunch({ url: '/pages/login/login' });
    },
	// 获取用户信息
	async getUserProfile() {
	    wx.getUserProfile({
	      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中
	      success: (res) => {
	        console.log('用户信息:', res.userInfo);
	        this.setData({
	          userInfo: res.userInfo
	        });
	
	        // 可选：将 userInfo 发送到开发者服务器保存
	        wx.request({
	          url: 'https://www.listentoyouai.com:80/user/register',
	          method: 'POST',
	          header: {
	            'content-type': 'application/json'
	          },
	          data: {
	            userInfo: res.userInfo,
	            // 可以加上 openid 等身份标识
	          },
	          success(response) {
	            console.log('注册成功');
	          }
	        });
	      },
	      fail: (err) => {
	        console.error('获取用户信息失败:', err);
	        wx.showToast({
	          title: '授权失败',
	          icon: 'none'
	        });
	      }
	    });
	  }
  }
};
</script>

<style lang="scss" scoped>
	.my_wrap {
		position: relative;
		padding: 20px;
		background-color: #f9f9f9;
		border-radius: 10px;
	}
	
	.bg_wrap {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		filter: blur(5px);
	}
	
	.item_img {
		text-align: center;
		margin-bottom: 20px;
	}
	
	.img {
		width: 100px;
		height: 100px;
		border-radius: 50%;
	}
	
	.item {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
		font-size: 16px;
		color: #333;
	}
	
	/* 优化退出按钮样式 */
	.btn-group {
		margin-top: 30px;
		text-align: center; /* 按钮居中 */
	}
	
	.btn-group button {
		background-color: #CDD2E5; /* 背景颜色 */
		color: black; /* 字体颜色 */
		font-size: 16px; /* 字体大小 */
		padding: 10px 20px; /* 内边距 */
		border: none; /* 去除默认边框 */
		border-radius: 5px; /* 圆角 */
		cursor: pointer; /* 手型光标 */
		transition: all 0.3s ease; /* 过渡效果 */
	}
	
	/* 悬停时的效果 */
	.btn-group button:hover {
		background-color: #D2E5E9; /* 更深的红色 */
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* 添加阴影 */
	}
	
	/* 点击时的效果 */
	.btn-group button:active {
		transform: translateY(1px); /* 下移一点 */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 减弱阴影 */
	}
	
	.loading,
	.error {
		margin-top: 15px;
		color: #999;
		font-size: 14px;
	}
</style>
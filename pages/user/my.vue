<template>
  <view class="my_wrap">
    <view class="bg_wrap" :style="{ paddingTop: statusBarPx + capsuleHeight / 2 - 7 + 'px' }">
      <view class="title">我的</view>
      <view class="item_img">
        <image :src="userInfo.avatarUrl || '/static/img/home/avatar.png'" mode="aspectFill" class="img"></image>
      </view>

      <view class="info_container">
        <view class="item">
          <span>名称</span>
          <view @click="startEditName">
            <template v-if="!editingName">
              <span>{{ userInfo.nickName || '--' }}</span>
              <image class="arrow" src="/static/img/arrow.png" mode="scaleToFill" />
            </template>
            <template v-else>
              <input class="name-input" v-model="tempNickName" placeholder="请输入名称" confirm-type="done"
                @confirm="confirmEditName" @blur="confirmEditName" />
            </template>
          </view>
        </view>
        <view class="item">
          <span>性别</span>
          <picker mode="selector" :range="genderOptions" :value="genderIndex" @change="onGenderChange">
            <view>
              <span>{{ genderText }}</span>
              <image class="arrow" src="/static/img/arrow.png" mode="scaleToFill" />
            </view>
          </picker>
        </view>
        <view class="item">
          <span>生日</span>
          <picker mode="date" :value="userInfo.user_birthday || ''" @change="onBirthdayChange">
            <view>
              <span>{{ userInfo.user_birthday || '--' }}</span>
              <image class="arrow" src="/static/img/arrow.png" mode="scaleToFill" />
            </view>
          </picker>
        </view>
      </view>

      <!-- <view class="btn-group">
        <button v-if="!isLoggedIn" @click="login">登录</button>
      </view> -->

      <view v-if="loading" class="loading">正在加载用户信息...</view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      isLoggedIn: false,
      loading: false,
      error: null,
      statusBarPx: 0,
      capsuleHeight: 0,
      capsuleTop: 0,
      capsuleBottom: 0,
      navBarHeight: 0,
      // 编辑相关
      editingName: false,
      tempNickName: '',
      genderOptions: ['男', '女']
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
    },
    genderIndex() {
      const sex = parseInt(this.userInfo.sex);
      if (sex === 0) return 0;
      if (sex === 1) return 1;
      return -1;
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
    this.login()
    this.statusBarPx = this.getStatusBarHeight();
    this.getCapsuleInfo();
    this.fetchUserInfo();
  },
  methods: {
    getCapsuleInfo() {
      try {
        // 仅在微信小程序环境可用
        const menuButtonInfo = typeof wx !== 'undefined' && wx.getMenuButtonBoundingClientRect
          ? wx.getMenuButtonBoundingClientRect()
          : null;
        if (menuButtonInfo) {
          console.log('menuButtonInfo', menuButtonInfo);
          this.capsuleHeight = menuButtonInfo.height || 0;
          this.capsuleTop = menuButtonInfo.top || 0;
          this.capsuleBottom = menuButtonInfo.bottom || 0;
          const statusBarHeight = this.getStatusBarHeight();
          this.navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + (menuButtonInfo.height || 0);
          return menuButtonInfo;
        }
        return null;
      } catch (e) {
        return null;
      }
    },
    getStatusBarHeight() {
      try {
        const info = uni.getSystemInfoSync();
        return info.statusBarHeight || 0;
      } catch (e) {
        return 0;
      }
    },
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
        else if (res.statusCode === 403) {
          uni.$u.toast('用户不存在，请注册')
          uni.navigateTo({
            url: '/pages/user/userinfo'
          })
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

    // 名称编辑
    startEditName() {
      this.tempNickName = this.userInfo.nickName || '';
      this.editingName = true;
      this.$nextTick(() => {
        // 小程序中无法直接 focus，保持简单
      });
    },
    confirmEditName() {
      const newName = (this.tempNickName || '').trim();
      if (newName) {
        this.$set(this.userInfo, 'nickName', newName);
      }
      this.editingName = false;
    },

    // 性别选择
    onGenderChange(e) {
      const index = parseInt(e.detail.value);
      if (index === 0) {
        this.$set(this.userInfo, 'sex', 0);
      } else if (index === 1) {
        this.$set(this.userInfo, 'sex', 1);
      }
    },

    // 生日选择
    onBirthdayChange(e) {
      const date = e.detail.value;
      this.$set(this.userInfo, 'user_birthday', date);
    },


    async login() {
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
            // uni.reLaunch({ url: '/pages/user/my' });
          }
          else if (callbackRes.statusCode === 403) {
            uni.$u.toast('用户不存在，请注册')
            uni.navigateTo({
              url: '/pages/user/userinfo'
            })
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
}

.bg_wrap {
  // padding-top: var(--window-top);
  width: 100%;
  height: 442rpx;
  // filter: blur(5px);
  background: linear-gradient(to bottom, #9FCAFF, #FFF);
}


.title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 32rpx;
  color: #020E1C;
  line-height: 48rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-bottom: 48px;
}

.item_img {
  display: flex;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 28rpx auto;

  .img {
    width: 100%;
    height: 100%;
  }
}



.info_container {
  width: 686rpx;
  height: 300rpx;
  background: #FFFFFF;
  margin: 0 auto;
  border-radius: 26rpx;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
  padding: 26rpx 24rpx;
  box-sizing: border-box;

  .item {
    box-sizing: border-box;
    display: flex;
    padding-bottom: 26rpx;
    align-items: center;
    justify-content: space-between;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 32rpx;
    color: #303944;
    line-height: 48rpx;
    text-align: left;
    font-style: normal;
    text-transform: none;
    border-bottom: 1rpx solid #E6E9EC;
    margin-bottom: 22rpx;

    view {
      display: flex;
      align-items: center;
    }

    .arrow {
      width: 40rpx;
      height: 40rpx;
      margin-left: 10rpx;
    }

    .name-input {
      width: 400rpx;
      height: 64rpx;
      padding: 0 16rpx;
      border: 1rpx solid #E6E9EC;
      border-radius: 10rpx;
      font-size: 28rpx;
      background: #fff;
    }
  }

  .item:last-child {
    border-bottom: 0rpx solid #E6E9EC;
  }
}



/* 优化退出按钮样式 */
.btn-group {
  margin-top: 30px;
  text-align: center;
  /* 按钮居中 */
}

.btn-group button {
  background-color: #CDD2E5;
  /* 背景颜色 */
  color: black;
  /* 字体颜色 */
  font-size: 16px;
  /* 字体大小 */
  padding: 10px 20px;
  /* 内边距 */
  border: none;
  /* 去除默认边框 */
  border-radius: 5px;
  /* 圆角 */
  cursor: pointer;
  /* 手型光标 */
  transition: all 0.3s ease;
  /* 过渡效果 */
}

/* 悬停时的效果 */
.btn-group button:hover {
  background-color: #D2E5E9;
  /* 更深的红色 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  /* 添加阴影 */
}

/* 点击时的效果 */
.btn-group button:active {
  transform: translateY(1px);
  /* 下移一点 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 减弱阴影 */
}

.loading,
.error {
  margin-top: 15px;
  color: #999;
  font-size: 14px;
  text-align: center;
}
</style>
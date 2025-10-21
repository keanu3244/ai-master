<template>
  <view class="my_wrap">
    <view class="bg_wrap" :style="{ paddingTop: statusBarPx + capsuleHeight / 2 - 7 + 'px' }">
      <view class="title">
        <image src="/static/img/arrow.png" mode="aspectFill" class="arrow" @click="handleBack"></image>
        <view>
          我的
        </view>
      </view>
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
      genderOptions: ['男', '女'],
      hasShownOnce: false
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
  onShow() {
    if (this.hasShownOnce) {
      this.fetchUserInfo();
      return;
    }
    this.hasShownOnce = true;
  },
  methods: {
    handleBack() {
      uni.navigateBack();
    },
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
    async fetchUserInfo(isRetry = false) {
      let token = uni.getStorageSync('token');
      this.error = null;

      if (!token) {
        if (!isRetry) {
          const reloginSuccess = await this.login({ silent: true });
          if (reloginSuccess) {
            return this.fetchUserInfo(true);
          }
        }
        this.isLoggedIn = false;
        this.error = '未登录，请先登录';
        this.loading = false;
        return;
      }

      this.loading = true;

      try {
        const res = await uni.request({
          url: 'https://www.listentoyouai.com:80/query_data/get_user_info',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.statusCode === 200) {
          const tokenData = res.data || {};
          if (tokenData.access_token) {
            uni.setStorageSync('token', tokenData.access_token);
          }
          if (tokenData.username) {
            uni.setStorageSync('username', tokenData.username);
          }
          this.isLoggedIn = true;
          this.userInfo = {
            nickName: tokenData.username || '未命名',
            avatarUrl: tokenData.headimg || '/static/img/home/avatar.png',
            sex: tokenData.sex,
            user_birthday: tokenData.user_birthday
          };
        }
        else if (res.statusCode === 401 && !isRetry) {
          const reloginSuccess = await this.login({ silent: true });
          if (reloginSuccess) {
            return this.fetchUserInfo(true);
          }
          this.isLoggedIn = false;
          uni.removeStorageSync('token');
          this.error = '自动登录失败，请重新登录';
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
        // 保存到服务端
        this.updateUserInfoServer({ username: newName });
      } else {
        // 不允许为空，提示用户补充
        if (uni.$u && uni.$u.toast) {
          uni.$u.toast('名称不能为空，请输入');
        } else {
          uni.showToast({ title: '名称不能为空，请输入', icon: 'none' });
        }
        this.editingName = true;
        return;
      }
      this.editingName = false;
    },

    // 性别选择
    onGenderChange(e) {
      const index = parseInt(e.detail.value);
      if (index === 0) {
        this.$set(this.userInfo, 'sex', 0);
        // 仅更新性别
        this.updateUserInfoServer({ sex: 0 });
      } else if (index === 1) {
        this.$set(this.userInfo, 'sex', 1);
        // 仅更新性别
        this.updateUserInfoServer({ sex: 1 });
      }
    },

    // 生日选择
    onBirthdayChange(e) {
      const date = e.detail.value;
      if (!date) {
        if (uni.$u && uni.$u.toast) {
          uni.$u.toast('生日不能为空，请选择');
        } else {
          uni.showToast({ title: '生日不能为空，请选择', icon: 'none' });
        }
        return;
      }
      this.$set(this.userInfo, 'user_birthday', date);
      // 仅更新生日
      this.updateUserInfoServer({ user_birthday: date });
    },


    async login(options = {}) {
      const { silent = false } = options;
      try {
        if (!silent) {
          this.error = null;
        }
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
            if (!silent) {
              this.error = '';
            }
            // 可选：跳转到个人中心
            // uni.reLaunch({ url: '/pages/user/my' });
            return true;
          }
          else if (callbackRes.statusCode === 403) {
            uni.$u.toast('用户不存在，请注册')
            uni.navigateTo({
              url: '/pages/user/userinfo'
            })
            return false;
          }
          else {
            if (!silent) {
              this.error = '登录失败，请重试';
            }
            return false;
          }
        } else {
          if (!silent) {
            this.error = '获取微信登录凭证失败';
          }
          return false;
        }
      } catch (err) {
        console.error('请求失败:', err);
        if (!silent) {
          this.error = '网络异常，请检查网络连接';
        }
        return false;
      }
      return false;
    },

    // 将编辑后的资料更新到后端
    async updateUserInfoServer(partial = {}) {
      try {
        // 组装完整负载：要求所有字段都非空后才发请求
        const username = Object.prototype.hasOwnProperty.call(partial, 'username')
          ? (partial.username || '').toString().trim()
          : (this.userInfo.nickName || '').toString().trim();
        const sexRaw = Object.prototype.hasOwnProperty.call(partial, 'sex')
          ? partial.sex
          : this.userInfo.sex;
        const sex = typeof sexRaw === 'string' ? parseInt(sexRaw) : sexRaw;
        const user_birthday = Object.prototype.hasOwnProperty.call(partial, 'user_birthday')
          ? partial.user_birthday
          : this.userInfo.user_birthday;

        // 前置校验：任何一项为空都不发起请求
        if (!username) {
          uni.$u && uni.$u.toast ? uni.$u.toast('名称不能为空，请输入') : uni.showToast({ title: '名称不能为空，请输入', icon: 'none' });
          return false;
        }
        if (!(sex === 0 || sex === 1)) {
          uni.$u && uni.$u.toast ? uni.$u.toast('性别不能为空，请选择') : uni.showToast({ title: '性别不能为空，请选择', icon: 'none' });
          return false;
        }
        if (!user_birthday) {
          uni.$u && uni.$u.toast ? uni.$u.toast('生日不能为空，请选择') : uni.showToast({ title: '生日不能为空，请选择', icon: 'none' });
          return false;
        }

        let token = uni.getStorageSync('token');
        if (!token) {
          const ok = await this.login({ silent: true });
          if (!ok) {
          	uni.$u && uni.$u.toast ? uni.$u.toast('未登录，无法更新资料') : uni.showToast({ title: '未登录', icon: 'none' });
            return false;
          }
          token = uni.getStorageSync('token');
        }

        // 发送完整字段，后端按需更新
        const payload = { username, sex, user_birthday };

        // 显示轻提示
        uni.showLoading({ title: '保存中…', mask: true });

        const res = await uni.request({
          url: 'https://www.listentoyouai.com:80/modify_data/user_api',
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
          },
          data: payload
        });

        uni.hideLoading();

        if (res.statusCode === 200) {
          // 兼容后端返回新 token 的情况
          const data = res.data || {};
          if (data.access_token) {
            uni.setStorageSync('token', data.access_token);
          }
          uni.$u && uni.$u.toast ? uni.$u.toast('已更新') : uni.showToast({ title: '已更新', icon: 'success' });

          // 与服务器保持一致，再次拉取资料（避免后端格式化）
          this.fetchUserInfo(true);
          return true;
        }
        if (res.statusCode === 401) {
          // token 失效时重登一次并重试
          const ok = await this.login({ silent: true });
          if (ok) {
            return this.updateUserInfoServer(partial);
          }
          uni.$u && uni.$u.toast ? uni.$u.toast('登录过期，请重试') : uni.showToast({ title: '登录过期', icon: 'none' });
          return false;
        }

        // 其他错误
        const msg = (res.data && (res.data.message || res.data.msg)) || '更新失败';
        uni.$u && uni.$u.toast ? uni.$u.toast(msg) : uni.showToast({ title: msg, icon: 'none' });
        return false;
      } catch (err) {
        uni.hideLoading();
        console.error('更新用户信息异常:', err);
        uni.$u && uni.$u.toast ? uni.$u.toast('网络异常，请稍后再试') : uni.showToast({ title: '网络异常', icon: 'none' });
        return false;
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
  position: relative;

  .arrow {
    position: absolute;
    left: 30rpx;
    width: 40rpx;
    height: 40rpx;
    transform: rotate(180deg);
  }
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

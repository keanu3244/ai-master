<template>
  <view class="train_wrap">
    <image src="/static/img/blue.gif" mode="aspectFill" class="bg_wrap"></image>
    <!-- 使用 scroll-view 包裹内容，并设置 ref 和高度 -->
    <scroll-view class="send_content" scroll-y="true" :scroll-top="scrollTop" ref="scrollView"
      :style="{ height: scrollHeight + 'px' }">
      <template v-if="barrageList.length">
        <view class="send_item_group" v-for="(item, index) in barrageList" :key="index">
          <!-- 用户消息（右侧显示） -->
          <view class="right flex" v-if="item.q">
            <view class="text_box">
				<view class="reset_btn">
					重新输入
				</view>
            	<view class="info">{{ item.q }}</view>
            </view>
			<view class="pic_box">
				<view class="reset_btn">
					重新选择
				</view>
				<image src="/static/img/xiangce.png" mode="aspectFill" class="pic_msg"></image>
			</view>
            <!-- <image :src="avatarUrl" mode="aspectFit" class="avator"></image> -->
          </view>
          <!-- AI回复（左侧显示） -->
          <view class="left flex" v-if="item.a != null">
            <image src="/static/img/scence/jl.png" mode="" class="avator"></image>
            <!-- 思考中状态 -->
            <view v-if="item.a === ''" class="thinking">
              <text class="loading-text">思考中</text>
              <view class="dot-flashing"></view>
            </view>
            <!-- 正常回复 -->
            <view v-else class="info">{{ item.a }}</view>
          </view>
        </view>
      </template>
    </scroll-view>
    <view class="send_footer">
      <view class="send_btns">
        <view class="send_btn">
          <image src="/static/img/jiaolian.png" mode="aspectFill" class="btn"></image>
          教练模式
        </view>
        <view class="send_btn">
          <image src="/static/img/tow.png" mode="aspectFill" class="btn"></image>
          定制AI
        </view>
      </view>
      <view class="send_wrap">
        <image v-show="!showBtnGroup" @click="() => showBtnGroup = !showBtnGroup" src="/static/img/add.png"
          mode="aspectFill" class="send_add"></image>
        <image v-show="showBtnGroup" @click="() => showBtnGroup = !showBtnGroup" src="/static/img/close.png"
          mode="aspectFill" class="send_add"></image>
        <input type="text" class="send_input" placeholder="吐槽你最近的烦心事" placeholder-class="send_pl" v-model="send_val" />
        <image src="/static/img/scence/send2.png" class="send_img" @click="handleSennd" />
      </view>
      <view class="btn_group" v-if="showBtnGroup">
        <view class="photo_btn_container">
          <view class="photo_btn_box">
            <image src="/static/img/camera.png" mode="aspectFill" class="btn"></image>
          </view>
          <view class="btn_text">
            拍照
          </view>
        </view>
        <view class="photo_btn_container">
          <view class="photo_btn_box">
            <image src="/static/img/xiangce.png" mode="aspectFill" class="btn"></image>
          </view>
          <view class="btn_text">
            相册
          </view>
        </view>
        <view class="photo_btn_container">
          <view class="photo_btn_box">
            <image src="/static/img/wenjian.png" mode="aspectFill" class="btn"></image>
          </view>
          <view class="btn_text">
            文件
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  nextTick
} from 'vue';
import {
  request
} from '@/utils/request.js'

const barrageList = ref([]) // 存储所有聊天消息
const send_val = ref('')	// 用户输入内容
const num = ref(0)
const requestBody = ref([])
const scrollTop = ref(0) // 用于控制 scroll-view 的滚动位置
const scrollHeight = ref(0) // 动态设置 scroll-view 的高度
const avatarUrl = ref('') // 用户头像URL
const isLoading = ref(false);
const showBtnGroup = ref(false)
// onLoad() => {
//     this.fetchAvatarInfo();
//   },
onMounted(() => {
  const user = uni.getStorageSync('token');
  if (!user) {
    uni.$u.toast('请先登录')
    uni.navigateTo({
      url: '/pages/user/my'
    })
    return;
  }
  // 动态设置 scroll-view 的高度
  setScrollHeight();
  loadRecords();
  fetchAvatarInfo(user)
});

// 新增 fetchAvatarInfo 函数来获取头像信息
const fetchAvatarInfo = (user) => {
  uni.request({
    url: 'https://www.listentoyouai.com:80/query_data/get_user_info',
    //url: 'http://127.0.0.1:5001/query_data/get_user_info',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user}`
    },
    success: (res) => {
      if (res.statusCode === 200) { // 假设成功响应的状态码是200
        avatarUrl.value = res.data.headimg
      }
      else if (res.statusCode === 401) {
        uni.$u.toast('toekn失效，请重新登录')
        uni.navigateTo({
          url: '/pages/user/my'
        })
      }
      else {
        console.error('获取头像失败');
      }
    },
    fail: (err) => {
      console.error('请求失败:', err);
    }
  });
};

// 动态设置 scroll-view 的高度
const setScrollHeight = () => {
  uni.getSystemInfo({
    success: (res) => {
      // 获取屏幕高度
      const screenHeight = res.windowHeight;
      // 获取底部输入区域的高度
      const query = uni.createSelectorQuery().in(this);
      query.select('.send_wrap').boundingClientRect(data => {
        if (data) {
          // scroll-view 的高度 = 屏幕高度 - 底部输入区域的高度
          scrollHeight.value = screenHeight - data.height;
        }
      }).exec();
    }
  });
};

const loadRecords = () => {
  const user = uni.getStorageSync('token');
  uni.request({
    url: 'https://www.listentoyouai.com:80/query_data/mentor_api',
    //url: 'http://127.0.0.1:5001/query_data/mentor_api',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user}`
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const records = res.data;
        console.log(records)
        records.forEach(record => {
          const new_record = JSON.parse(record.chat_data)
          //const new_record1 = record.chat_data;
          //const matches = record.chat_data.match(/\{.*?\}/g);
          //const new_record = new_record1.split('},{')
          //console.log(matches)
          if (new_record.role === 'user') {
            //console.log(new_record.content)
            barrageList.value.push({
              q: new_record.content
            });
            requestBody.value.push({
              role: 'user',
              content: new_record.content
            })
          } else if (new_record.role === 'assistant') {
            //console.log(new_record.content)
            // if (barrageList.value.length > 0 && barrageList.value[barrageList.value
            // 		.length - 1].a === '') {
            // 	barrageList.value[barrageList.value.length - 1].a = new_record.content;
            barrageList.value.push({
              a: new_record.content
            });
            requestBody.value.push({
              role: 'assistant',
              content: new_record.content
            })
          };
          //console.log(barrageList.value)
        });
        if (records.chat_data.length === 0) {
          barrageList.value.push({
            a: 'hello,我是您的Al教练，有什么事情都可以找我倾诉啊，期望可以帮到你。'
          });
        }
        // 数据加载完成后，滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
      }
      else if (res.statusCode === 401) {
        uni.$u.toast('请先登录')
        uni.navigateTo({
          url: '/pages/user/my'
        })
      }
    },
    fail: (err) => {
      console.error('获取聊天记录失败', err);
    }
  });
};

const loadMoreRecords = () => {
  loadRecords();
};

const generateAnswer = (str) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(str)
    }, 500)
  })
}

const handleSennd = async () => {
  const user = uni.getStorageSync('token')
  if (!user) {
    uni.$u.toast('请先登录')
    uni.navigateTo({
      url: '/pages/user/my'
    })
    return;
  }

  // 系统提示词
  let systemPrompts = `
		你是一个关注个人发展的教练，你叫"听你说AI智能教练"。
		你的理念是"关注人，达成事"，你的回答是以对话的口吻，一句一句对话
		`;
  if (!send_val.value) {
    uni.$u.toast('请输入点文字啦')
    return;
  }
  num.value = barrageList.value.length
  // 1. 验证登录状态和输入内容
  // 2. 添加用户消息到列表
  barrageList.value.push({
    q: send_val.value,
    a: ''
    //isLoading: true
  })
  requestBody.value.push({
    role: 'user',
    content: send_val.value
  })
  send_val.value = ''
  //const test1 = JSON.parse(requestBody)
  let requestBodyString = JSON.stringify(requestBody.value);
  //截取前八条聊记录
  let requestBodyString_new = JSON.stringify((JSON.parse(requestBodyString)).slice(-1));
  let memory_prompts = JSON.stringify((JSON.parse(requestBodyString)).slice(-8));
  console.log(requestBodyString_new);
  //isLoading.value = true;
  uni.request({
    url: 'https://www.listentoyouai.com:80/chat/freedom_api',
    method: 'POST',
    data: {
      prompts: requestBodyString_new,
      memory_prompts: memory_prompts,
      system_prompts: systemPrompts
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${user}`
    },
    success: (res) => {
      if (res.statusCode === 200) {
        barrageList.value[num.value].a = res.data;
        //barrageList.value[num.value].isLoading = false;
        num.value++;
        requestBody.value.push({
          role: 'assistant',
          content: res.data
        });

        // 数据加载完成后，滚动到底部
        nextTick(() => {
          scrollToBottom();
        });

      } else {
        reject(new Error(`请求失败，状态码: ${res.statusCode}`));
        //barrageList.value[num.value].isLoading = false;
      }
    },
    fail: (err) => {
      reject(err);
      //barrageList.value[num.value].isLoading = false;
    }
  });
}

function customURLSearchParams() {
  this.params = {};
}


customURLSearchParams.prototype.append = function (key, value) {
  if (!this.params[key]) {
    this.params[key] = [];
  }
  this.params[key].push(value);
};


customURLSearchParams.prototype.toString = function () {
  let queryString = '';
  let keys = Object.keys(this.params);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let values = this.params[key];
    for (let j = 0; j < values.length; j++) {
      queryString += (i === 0 && j === 0 ? '' : '&');
      queryString += `${key}=${encodeURIComponent(values[j])}`;
    }
  }
  return queryString;
};

// 滚动到底部的函数
const scrollToBottom = () => {
  // 设置 scrollTop 为一个较大的值，确保滚动到底部
  scrollTop.value = 999999; // 这里设置一个足够大的值
};
</script>

<style>
page {
  background-color: #F2F3F7;
}
</style>

<style lang="scss" scoped>
.train_wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

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

  .send_content {
    flex: 1;
    overflow-y: auto;
    margin-top: 40rpx;
    padding: 0 20rpx;
    box-sizing: border-box;

    .send_item,
    .send_item_group {
      margin-bottom: 36rpx;

      .avator {
        width: 72rpx;
        height: 72rpx;
		display: inline-block;
      }

      .info {
		display: inline-block;
        position: relative;
        margin-left: 26rpx;
        font-size: 28rpx;
        color: #000;
        padding: 16rpx 20rpx;
        background-color: #fff;

      }

      .left {
        margin-bottom: 36rpx;
		align-items: flex-start;
		.avator{
			display: inline-block;
			width: 72rpx!important;
			height: 72rpx!important;
			border-radius: 36rpx;
		}
		.info {
		  box-sizing: border-box;
		  display: inline-block;
		  padding: 26rpx;
		  background: linear-gradient( 180deg, #FFFFFF 0%, #FFF9F2 100%);
		  border-radius: 0 48rpx 48rpx 48rpx;
		  border: 2rpx solid rgba(40, 40, 43, 0.1);
		  font-family: PingFang SC, PingFang SC;
	      font-weight: normal;
		  font-size: 28rpx;
		  color: #101216;
		  max-width: 500rpx;
		}
      }

      .right {
        margin-bottom: 36rpx;
        align-items: flex-end; // 头像和消息底部对齐
		justify-content: flex-end;
		.text_box{
			margin-right: 26rpx;
			display: flex;
			align-items: center;
			.reset_btn{
				margin-right: 24rpx;
				width: 112rpx;
				height: 42rpx;
				font-family: PingFang SC, PingFang SC;
				font-weight: normal;
				font-size: 28rpx;
				color: #1F7EF1;
				line-height: 42rpx;
				text-align: right;
				font-style: normal;
				text-transform: none;
			}
			.info {
			  box-sizing: border-box;
			  display: inline-block;
			  padding: 26rpx;
			  background: linear-gradient(180deg, #6EECFF 0%, #49A7FF 100%);
			  border-radius: 48rpx 0 48rpx 48rpx;
			  border: 2rpx solid rgba(40, 40, 43, 0.1);
			  font-family: PingFang SC, PingFang SC;
			  font-weight: normal;
			  font-size: 28rpx;
			  color: #161210;
			  line-height: 42rpx;
			  max-width: 500rpx;
			}
		}
        .pic_box{
			display: flex;
			align-items: center;
			margin-right: 26rpx;
			.reset_btn{
				margin-right: 24rpx;
				width: 112rpx;
				height: 42rpx;
				font-family: PingFang SC, PingFang SC;
				font-weight: normal;
				font-size: 28rpx;
				color: #1F7EF1;
				line-height: 42rpx;
				text-align: right;
				font-style: normal;
				text-transform: none;
			}
			.pic_msg{
				width: 320rpx;
				height: 320rpx;
				border-radius: 16rpx;
			}
		}
		
      }

      .thinking {
        display: flex;
        align-items: center;
        margin-left: 26rpx;
        padding: 16rpx 20rpx;
        background-color: #fff;
        position: relative;

        &:after {
          content: "";
          position: absolute;
          left: -10rpx;
          top: 20rpx;
          width: 0;
          height: 0;
          border-top: 10rpx solid transparent;
          border-bottom: 20rpx solid transparent;
          border-right: 10rpx solid #fff;
        }

        .loading-text {
          font-size: 28rpx;
          color: #999;
          margin-right: 20rpx;
        }

        .dot-flashing {
          width: 10rpx;
          height: 10rpx;
          border-radius: 50%;
          background-color: #999;
          position: relative;
          animation: dot-flashing 1.4s infinite ease-in-out both;
        }

        .dot-flashing::before,
        .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          width: 10rpx;
          height: 10rpx;
          background-color: #999;
          border-radius: 50%;
        }

        .dot-flashing::before {
          left: -16rpx;
          animation: dot-flashing-before 1.4s infinite ease-in-out both;
        }

        .dot-flashing::after {
          right: -16rpx;
          animation: dot-flashing-after 1.4s infinite ease-in-out both;
        }
      }
    }
  }

  @keyframes dot-flashing {
    0% {
      background-color: #999;
    }

    50% {
      background-color: transparent;
    }

    100% {
      background-color: #999;
    }
  }

  @keyframes dot-flashing-before {
    0% {
      background-color: #999;
    }

    50% {
      background-color: transparent;
    }

    100% {
      background-color: #999;
    }
  }

  @keyframes dot-flashing-after {
    0% {
      background-color: #999;
    }

    50% {
      background-color: transparent;
    }

    100% {
      background-color: #999;
    }
  }

  // .send_wrap {
  // 	display: flex;
  // 	justify-content: center;
  // 	align-items: center;
  // 	padding: 0 20rpx;
  // 	margin: 60rpx 0 20rpx 0;
  // 	height: 80rpx;
  // 	line-height: 80rpx;

  // 	.send_input {
  // 		flex: 1;
  // 		color: #000;
  // 		height: 100%;
  // 		padding: 0 20rpx;
  // 		background: #fff;
  // 		border-radius: 67rpx;
  // 		box-sizing: border-box;
  // 	}

  // 	:deep(.send_pl) {
  // 		color: rgba(255, 255, 255, 0.7);
  // 	}

  // 	.send_img {
  // 		width: 64rpx;
  // 		height: 64rpx;
  // 		margin-right: 24rpx;
  // 	}


  // }
  .send_footer {
    display: flex;
    flex-direction: column;
    padding: 24rpx 32rpx calc(var(--window-bottom) + 24rpx) 32rpx;
    z-index: 2;
    // height: 280rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 48rpx 48rpx 0rpx 0rpx;
    border: 2rpx solid #FFFFFF;

    .send_add {
      width: 64rpx;
      height: 64rpx;
      margin-right: 16rpx;
    }

    .send_btns {
      margin-bottom: 16rpx;
      display: flex;
      row-gap: 20rpx;

      .send_btn {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 200rpx;
        height: 60rpx;
        background: rgba(202, 239, 254, 0.5);
        border-radius: 30rpx 30rpx 30rpx 30rpx;
        border: 1rpx solid rgba(5, 46, 116, 0.3);
        padding-left: 20rpx;
        margin-right: 20rpx;

        .btn {
          width: 36rpx;
          height: 36rpx;
          margin-right: 8rpx;
        }
      }
    }

    .send_wrap {
      box-sizing: border-box;
      padding-left: 16rpx;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 96rpx;
      line-height: 80rpx;
      background: #fff;
      border-radius: 67rpx;
      box-shadow: 0rpx 8rpx 48rpx 0rpx rgba(22, 52, 151, 0.3);


      .send_input {
        flex-grow: 1;
        color: #1E1E1E;
        height: 100%;
        padding: 0 20rpx 0 24rpx;
        box-sizing: border-box;
      }

      :deep(.send_pl) {
        color: rgba(142, 131, 121, 0.6);
      }

      .send_img {
        width: 64rpx;
        height: 64rpx;
        margin-right: 24rpx;
      }
    }

    .btn_group {
      display: flex;
      align-items: center;
      gap: 20rpx;
      justify-content: center;
      margin-top: 40rpx;

      .photo_btn_container {
        display: flex;
        flex-direction: column;
        align-items: center;

        .photo_btn_box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 216rpx;
          height: 140rpx;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 24rpx 24rpx 24rpx 24rpx;
          border: 1rpx solid rgba(174, 181, 186, 0.4);

          .btn {
            margin-bottom: 8rpx;
            width: 48rpx;
            height: 48rpx;
          }

          .btn_text {
            width: 48rpx;
            height: 36rpx;
            font-family: PingFang SC, PingFang SC;
            font-weight: normal;
            font-size: 24rpx;
            color: #646059;
            line-height: 36rpx;
            text-align: center;
            font-style: normal;
            text-transform: none;
          }
        }
      }
    }
  }


}
</style>
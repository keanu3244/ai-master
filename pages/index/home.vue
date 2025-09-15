<template>
  <view class="wrap">
    <comp-navbar bgColor="transparent" :fixed="false" :right_icon="false">
      <template #left>
        <view class="swicth_wrap flex" @click="handlescen">
          <view class="text">{{ scenvalue }}</view>
          <image src="/static/img/scence/more.png" mode="" class="more"></image>
        </view>
      </template>
    </comp-navbar>
    <!-- <image :src="`/static/img/scence/scen${scenindex+1}.jpg`" mode="" class="bg_img"></image> -->
    <view class="bg_wrap_container">
      <image class="bg" src="/static/img/redbg.png">
      </image>
      <image src="https://www.listentoyouai.com/images/hong.gif" mode="aspectFill" class="bg_img"></image>

    </view>
    <!-- <image src="https://jakewinn.github.io/portals/img/ai_bg1.gif" mode="aspectFill" class="bg_img"></image> -->
    <view class="rant_wrap" v-if="barrageList.length">
      <view class="rant_content animate__animated  animate__infinite" v-for="(item, index) in barrageList" :key="index"
        :style="getBarrageStyle(index)">

        <view class="rant_item">{{ item }}</view>
      </view>

    </view>
    <view class="footer_wrap">
      <view class="operate_wrap">
        <view class="operate_item" @click="jumppage">
          <image src="/static/img/lingting.png" class="ope_img"></image>
          <text>听你说</text>
        </view>

        <view class="operate_item" @click="handleJump2">
          <image src="/static/img/scence/my.png" class="ope_img"></image>
          <text>我的</text>
        </view>
        <!-- <view class="operate_item" @click="handleJump">
					<text>表单界面</text>
				</view>-->
        <!-- 	<view class="operate_item" @click="handleJump3">
					<text>AI信息</text>
				</view>
				 <view class="operate_item" @click="handledq">
					<image src="/static/img/scence/qc.png" class="ope_img2"></image>
					<text>打气</text>
				</view> -->
      </view>

      <view class="send_wrap">
        <input type="text" class="send_input" placeholder="吐槽你最近的烦心事" placeholder-class="send_pl" v-model="send_val" />
        <image src="/static/img/scence/send1.png" class="send_img" @click="handleSend"></image>
      </view>
    </view>
  </view>
  <comp-picker :show="scenshow" :columns="scencolumns" @cancel="scenshow = false" @confirm="handle_confirm"
    keyName="label" :defaultIndex="[scenindex]"></comp-picker>
</template>
<script setup>
import {
  ref,
  reactive,
  onMounted
} from 'vue';
import {
  request
} from '@/utils/request.js'
//const socket = io.connect('http://127.0.0.1:5000');
import io from '@hyoga/uni-socket.io';
import redbg from '@/static/img/redbg.png'
const socket = io('wss://www.listentoyouai.com:80', {
  query: {},
  transports: ['websocket', 'polling'],
  timeout: 5000,
});
// const socket = io('ws://192.168.0.112:5001', {
//   query: {},
//   transports: [ 'websocket', 'polling' ],
//   timeout: 5000,
// });
const scenshow = ref(false)
const scencolumns = ref([
  [{
    label: '职场',
    id: 1,
    bg: '/static/img/scence/scen1.jpg'
  }, {
    label: '创业',
    id: 2,
    bg: '/static/img/scence/scen2.jpg'
  }, {
    label: '成长',
    id: 3,
    bg: '/static/img/scence/scen3.jpg'
  }, {
    label: '情感',
    id: 4,
    bg: '/static/img/scence/scen4.jpg'
  }, {
    label: '家庭',
    id: 5,
    bg: '/static/img/scence/scen5.jpg'
  }]
]);
const scenvalue = ref('职场') // scencolumns.value[0][0].label
const scenindex = ref(0)
const handlescen = () => {
  scenshow.value = true
}
const handle_confirm = ({
  index,
  value
}) => {
  scenshow.value = false
  scenindex.value = index;
  scenvalue.value = value[0].label
  console.log('index', index)
}

//ai教练
const jumppage = () => {
  uni.navigateTo({
    url: '/pages/setting/train'
  })
}

const handleJump = () => {
  uni.navigateTo({
    url: '/pages/user/userinfo'
  })
}
const handleJump2 = () => {
  uni.navigateTo({
    url: '/pages/user/my'
  })
}
const handleJump3 = () => {
  uni.navigateTo({
    url: '/pages/user/aiTeacherInfo'
  })
}

// 打气
const handledq = () => {
  uni.$u.toast('内测中')
}

// 发送弹幕
const barrageList = ref([])
const send_val = ref('')
const getBarrageStyle = (index) => {
  // 根据弹幕的 index 设置动画的时长和延迟
  const delay = index * 0.5; // 
  const duration = 10 + index; // 动画时长，可根据需要调整
  return `animation-duration: ${duration}s; animation-delay: ${delay}s;`;
}

onMounted(() => {
  socket.on('connect', () => {
    // ws连接已建立，此时可以进行socket.io的事件监听或者数据发送操作
    // 连接建立后，本插件的功能已完成，接下来的操作参考socket.io官方客户端文档即可
    console.log('ws 已连接');
    // socket.io 唯一连接id，可以监控这个id实现点对点通讯
    //const { id } = socket;
  });
});
socket.on('broadcast', (msg) => {
  // 收到服务器推送的消息，可以跟进自身业务进行操作
  barrageList.value.push(msg.message)
  console.log('ws 收到服务器消息：', msg.message);
});
const handleSend = () => {
  const user = uni.getStorageSync('token');
  if (!user) {
    uni.$u.toast('请先登录');
    uni.navigateTo({
      url: '/pages/user/my'
    });
    return;
  }
  if (!send_val.value) {
    uni.$u.toast('请输入点文字啦');
    return;
  }
  //console.log('send_val', send_val)
  // 测试
  //barrageList.value.push(send_val.value)
  const text = send_val.value
  const message = {
    content: send_val.value,
    username: uni.getStorageSync('username')// 如果有用户信息
    //group: scenvalue
  };
  // 主动向服务器发送数据
  socket.emit('send_data', {
    text_message: message
  });
  console.log('ws 发送服务器消息：', message);
  send_val.value = '';
};
</script>



<style lang="scss" scoped>
.wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  color: #fff;


  // background: url('/static/img/scence/scen1.jpg') center no-repeat;
  // background-size: cover;

  .swicth_wrap {
    width: 152rpx;
    height: 60rpx;
    justify-content: center;
    font-size: 28rpx;
    line-height: 60rpx;
    text-align: center;
    background: rgba(144, 144, 144, 0.2);
    border-radius: 60rpx;
    color: #10131C;
    z-index: 10;

    .more {
      width: 32rpx;
      height: 32rpx;
    }
  }

  .bg_wrap_container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    /* #ifdef MP-WEIXIN */
    z-index: -1;

    .bg {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }

    /* #endif */
    .bg_img {
      left: calc(50% - 350rpx);
      width: 700rpx;
      height: 700rpx;
      position: absolute;
      bottom: calc(24rpx + env(safe-area-inset-bottom));
      bottom: calc(24rpx + constant(safe-area-inset-bottom));
    }
  }

  /* 自定义动画，文字从右到左 */
  @keyframes moveFromRightToLeft {
    0% {
      transform: translateX(100%);
    }

    100% {
      transform: translateX(-100%);
    }
  }

  /* 绑定动画到弹幕元素 */
  .animate__infinite {
    animation: moveFromRightToLeft linear infinite;
    animation-duration: 10s;
    /* 设置动画时长，可以调节速度 */
  }

  .rant_wrap {
    max-height: 600rpx;
    overflow: hidden;
    padding: 30rpx 0 0 0;

    .rant_content {
      transform: translateX(100%);
    }

    .rant_item {
      width: fit-content;
      height: 72rpx;
      padding: 0 24rpx;
      margin-bottom: 24rpx;
      line-height: 72rpx;
      font-size: 26rpx;
      color: #1E1E1E;
      // background: linear-gradient(180deg, #FFFFFF 0%, #FFF9F2 100%);
      background-color: #fff;
      border-radius: 36rpx 36rpx 0px 36rpx;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
    }
  }

  .footer_wrap {
    overflow: hidden;
    position: fixed;
    left: 0;
    bottom: constant(safe-area-inset-bottom);
    bottom: env(safe-area-inset-bottom);
    box-sizing: border-box;
    width: 100%;
    padding: 0 24rpx 24rpx 24rpx;
    z-index: 10000;

    .operate_wrap {
      .operate_item {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 24rpx;
        width: 170rpx;
        height: 60rpx;
        font-size: 28rpx;
        line-height: 60rpx;
        text-align: center;
        color: #7D3A03;
        border-radius: 66rpx;
        background: #FFC773;
        border-radius: 30rpx;
        border: 1px solid rgba(94, 41, 9, 0.15);


        &:nth-of-type(2) {
          color: #771409;
          background: #FFA9A0;
          border: 1px solid rgba(94, 41, 9, 0.15);
        }

        .ope_img {
          width: 36rpx;
          height: 36rpx;
          margin-right: 8rpx;
        }

        .ope_img2 {
          width: 32rpx;
          height: 32rpx;
          margin-right: 4rpx;
        }
      }
    }

    .send_wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 686rpx;
      height: 96rpx;
      margin: 20rpx 0;
      line-height: 80rpx;
      background: #fff;
      border-radius: 67rpx;
      box-shadow: 0rpx 8rpx 48rpx 0rpx rgba(22, 52, 151, 0.3);

      .send_input {
        width: 90%;
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


  }
}
</style>
<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 聊天数据
const chatHistory = ref([]);
const userInput = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const formData = ref([]);

// 用户信息 (实际项目中应从全局状态获取)
const userInfo = ref({
  weixin_id: 'oJtbG6iLWq7CHS5PCN05cL_oCotQ',
  phone_number: '18573412903'
});

// 系统提示词
const systemPrompts = '作为一个关注个人发展的教练，理念就是"关注人，达成事"，回答以对话的口吻，一句一句对话';

// 构建表单数据（小程序兼容方式）
const buildFormData = (fields) => {
  const formData = {};
  for (const [key, value] of Object.entries(fields)) {
    formData[key] = value;
  }
  return formData;
};

// 发送聊天消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  
  try {
    // 添加用户消息到聊天记录
    const userMessage = {
      role: 'user',
      content: userInput.value,
      timestamp: new Date().toLocaleTimeString()
    };
    chatHistory.value.push(userMessage);
    
    const tempInput = userInput.value;
    userInput.value = '';
    isLoading.value = true;
    errorMessage.value = '';
    
    // 构建请求数据（小程序兼容方式）
    // const requestData = buildFormData({
    //   prompts: JSON.stringify([
    //     ...chatHistory.value.slice(-5).map(msg => ({
    //       role: msg.role,
    //       content: msg.content
    //     })),
    //     { role: 'user', content: tempInput }
    //   ]),
    //   system_promts: systemPrompts,
    //   weixin_id: userInfo.value.weixin_id,
    //   phone_number: userInfo.value.phone_number
    // });
	const prompts = JSON.stringify([
	            ...chatHistory.value.slice(-5).map((msg) => ({
	              role: msg.role,
	              content: msg.content
	            }))
	          ]);
    
    // 调用API
    const response = await uni.request({
      url: 'https://www.listentoyouai.com:80/chat/freedom_Api',
      method: 'POST',
      data: {
                  prompts:prompts,
                  system_prompts: systemPrompts,
                  weixin_id: userInfo.value.weixin_id,
                  phone_number: userInfo.value.phone_number
                        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
      },
      timeout: 15000 // 15秒超时
    });
    
    // 处理响应
    if (response.statusCode === 200 && response.data) {
      const assistantMessage = {
        role: 'assistant',
        content: response.data || '收到回复',
        timestamp: new Date().toLocaleTimeString()
      };
      
      chatHistory.value.push(assistantMessage);
      
      // 滚动到底部
      setTimeout(() => {
        uni.pageScrollTo({
          scrollTop: 99999,
          duration: 300
        });
      }, 100);
    } else {
      throw new Error(response.data?.message || '请求失败');
    }
  } catch (err) {
    console.error('API Error:', err);
    errorMessage.value = err.message || '服务异常，请稍后重试';
    
    // 显示错误提示
    uni.showToast({
      title: '请求失败',
      icon: 'none',
      duration: 2000
    });
  } finally {
    isLoading.value = false;
  }
};

// 清空聊天
const clearChat = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空聊天记录吗？',
    success: (res) => {
      if (res.confirm) {
        chatHistory.value = [];
      }
    }
  });
};

// 页面加载时初始化
onLoad(() => {
  // 尝试加载历史记录
  const savedChat = uni.getStorageSync('chatHistory');
  if (savedChat) {
    chatHistory.value = JSON.parse(savedChat);
  }
  
  // 尝试获取用户信息
  const storedUserInfo = uni.getStorageSync('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
});

// // 保存聊天记录到本地
// watch(chatHistory, (newVal) => {
//   uni.setStorageSync('chatHistory', JSON.stringify(newVal));
// }, { deep: true });
</script>

<template>
  <view class="chat-container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="title">个人发展教练</text>
      <button class="clear-btn" @click="clearChat">清空</button>
    </view>
    
    <!-- 聊天区域 -->
    <scroll-view 
      scroll-y="true" 
      class="chat-messages"
      :scroll-with-animation="true"
    >
      <view v-for="(msg, index) in chatHistory" 
        :key="index"
        :class="['message-bubble', msg.role]"
      >
        <image 
          v-if="msg.role === 'assistant'"
          class="avatar"
          src="/static/ai-avatar.png"
        />
        <view class="message-content">
          <text>{{ msg.content }}</text>
        </view>
        <image 
          v-if="msg.role === 'user'"
          class="avatar"
          :src="userInfo.avatar || '/static/img/home/avatar.png'"
        />
        <view class="message-time">
          {{ msg.timestamp }}
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-indicator">
        <text>教练思考中...</text>
        <view class="dot-flashing"></view>
      </view>
    </scroll-view>
    
    <!-- 错误提示 -->
    <view v-if="errorMessage" class="error-message">
      <text>{{ errorMessage }}</text>
    </view>
    
    <!-- 输入区域 -->
    <view class="input-area">
      <input 
        v-model="userInput" 
        class="chat-input" 
        placeholder="输入你的问题或想法..." 
        confirm-type="send"
        @confirm="sendMessage"
        :disabled="isLoading"
      />
      <button 
        class="send-button" 
        @click="sendMessage"
        :disabled="isLoading || !userInput.trim()"
      >
        发送
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
  padding: 10rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .clear-btn {
    font-size: 28rpx;
    color: #666;
    background: none;
    border: none;
    padding: 10rpx 20rpx;
    line-height: 1;
    
    &::after {
      border: none;
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.message-bubble {
  display: flex;
  margin-bottom: 40rpx;
  
  &.user {
    flex-direction: row-reverse;
    
    .message-content {
      background-color: #07c160;
      color: white;
      border-top-right-radius: 0;
    }
  }
  
  &.assistant {
    .message-content {
      background-color: white;
      color: #333;
      border-top-left-radius: 0;
    }
  }
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 0 20rpx;
  align-self: flex-end;
}

.message-content {
  max-width: 500rpx;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
  font-size: 32rpx;
  line-height: 1.5;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.message-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  text-align: center;
  width: 100%;
}

.error-message {
  padding: 20rpx;
  background-color: #ffe6e6;
  color: #f56c6c;
  text-align: center;
  font-size: 28rpx;
}

.input-area {
  display: flex;
  padding: 20rpx;
  background-color: white;
  border-top: 1rpx solid #eee;
  
  .chat-input {
    flex: 1;
    padding: 20rpx 30rpx;
    background-color: #f8f8f8;
    border-radius: 50rpx;
    margin-right: 20rpx;
    font-size: 30rpx;
  }
  
  .send-button {
    width: 150rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 50rpx;
    font-size: 32rpx;
    padding: 0;
    background-color: #07c160;
    color: white;
    
    &:disabled {
      background-color: #ccc;
    }
  }
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  color: #666;
  font-size: 28rpx;
  
  .dot-flashing {
    position: relative;
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background-color: #07c160;
    color: #07c160;
    animation: dotFlashing 1s infinite linear alternate;
    animation-delay: .5s;
    margin-left: 15rpx;
    
    &::before, &::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      background-color: #07c160;
      color: #07c160;
      animation: dotFlashing 1s infinite alternate;
    }
    
    &::before {
      left: -30rpx;
      animation-delay: 0s;
    }
    
    &::after {
      left: 30rpx;
      animation-delay: 1s;
    }
  }
}

@keyframes dotFlashing {
  0% {
    background-color: #07c160;
  }
  50%, 100% {
    background-color: #b3e6cc;
  }
}
</style>
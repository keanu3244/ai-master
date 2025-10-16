<template>
  <view class="demo-page">
    <view class="title">音乐播放器组件示例</view>

    <!-- 音乐播放器组件 -->
    <MusicPlayer :musicList="musicList" @play="onPlay" @pause="onPause" @next="onNext" @previous="onPrevious"
      @stop="onStop" @indexChange="onIndexChange" />

    <view class="info">
      <text>当前播放: {{ currentMusicName }}</text>
      <text>播放状态: {{ playStateText }}</text>
    </view>
  </view>
</template>

<script>
import MusicPlayer from '@/components/MusicPlayer/MusicPlayer.vue'

export default {
  name: 'MusicPlayerDemo',
  components: {
    MusicPlayer
  },
  data() {
    return {
      // 音乐列表示例
      musicList: [
        'https://example.com/music1',
        'https://example.com/music2',
        'https://example.com/music3'
      ],
      currentMusicName: '暂无',
      playStateText: '未播放'
    }
  },
  methods: {
    onPlay(data) {
      console.log('开始播放:', data)
      this.currentMusicName = `音乐 ${data.index + 1}`
      this.playStateText = '播放中'
      uni.showToast({
        title: `开始播放音乐 ${data.index + 1}`,
        icon: 'none'
      })
    },

    onPause(data) {
      console.log('暂停播放:', data)
      this.playStateText = '已暂停'
    },

    onNext(data) {
      console.log('切换到下一首:', data)
      this.currentMusicName = `音乐 ${data.index + 1}`
      this.playStateText = '播放中'
    },

    onPrevious(data) {
      console.log('切换到上一首:', data)
      this.currentMusicName = `音乐 ${data.index + 1}`
      this.playStateText = '播放中'
    },

    onStop(data) {
      console.log('停止播放:', data)
      this.playStateText = '已停止'
    },

    onIndexChange(data) {
      console.log('索引变化:', data)
      this.currentMusicName = `音乐 ${data.index + 1}`
    }
  }
}
</script>

<style scoped>
.demo-page {
  padding: 40rpx;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 60rpx;
  color: #333;
}

.info {
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info text {
  font-size: 28rpx;
  color: #666;
}
</style>

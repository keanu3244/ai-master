<template>
  <view class="music-player">
    <image 
      :src="currentIcon" 
      class="music-icon" 
      @click="handlePlayPause"
      mode="aspectFit"
    />
  </view>
</template>

<script>
export default {
  name: 'MusicPlayer',
  props: {
    // 音乐资源路径数组
    musicList: {
      type: Array,
      default: () => []
    },
    // 是否自动播放
    autoPlay: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 当前播放状态：0-未播放，1-播放中，2-暂停
      playState: 0,
      // 当前播放的音乐索引
      currentIndex: 0,
      // 音频上下文
      audioContext: null,
      // 图标路径
      stopIcon: '/static/img/music_stop.png',
      playIcon: '/static/img/music_play.png'
    }
  },
  computed: {
    // 当前显示的图标
    currentIcon() {
      return this.playState === 2 ? this.stopIcon : this.playIcon
    },
    // 当前播放的音乐
    currentMusic() {
      return this.musicList[this.currentIndex] || null
    }
  },
  mounted() {
    this.initAudio()
  },
  beforeUnmount() {
    this.destroyAudio()
  },
  methods: {
    // 初始化音频上下文
    initAudio() {
      if (this.musicList.length > 0) {
        if (!this.audioContext) {
          this.audioContext = uni.createInnerAudioContext()
        }
        this.setupAudioEvents()
      }
    },
    
    // 设置音频事件监听
    setupAudioEvents() {
      if (!this.audioContext) return
      
      // 音频播放结束事件
      this.audioContext.onEnded(() => {
        this.playNext()
      })
      
      // 音频播放错误事件
      this.audioContext.onError((error) => {
        console.error('音频播放错误:', error)
        this.playState = 0
        uni.showToast({
          title: '音频播放失败',
          icon: 'none'
        })
      })
      
      // 音频可以播放事件
      this.audioContext.onCanplay(() => {
        console.log('音频可以播放')
      })
    },
    
    // 处理播放/暂停点击
    handlePlayPause() {
      if (this.musicList.length === 0) {
        uni.showToast({
          title: '没有可播放的音乐',
          icon: 'none'
        })
        return
      }
      
      if (this.playState === 0) {
        // 未播放状态，开始播放
        this.playMusic()
      } else if (this.playState === 1) {
        // 播放中状态，暂停播放
        this.pauseMusic()
      } else if (this.playState === 2) {
        // 暂停状态，切换到下一首并播放
        this.playNext()
      }
    },
    
    // 播放音乐
    playMusic() {
      if (!this.currentMusic || !this.audioContext) return
      
      try {
        this.audioContext.src = this.currentMusic
        this.audioContext.loop = true
        this.audioContext.play()
        this.playState = 1
        
        // 触发播放事件
        this.$emit('play', {
          index: this.currentIndex,
          music: this.currentMusic
        })
      } catch (error) {
        console.error('播放音乐失败:', error)
        uni.showToast({
          title: '播放失败',
          icon: 'none'
        })
      }
    },
    
    // 暂停音乐
    pauseMusic() {
      if (!this.audioContext) return
      
      try {
        this.audioContext.pause()
        this.playState = 2
        
        // 触发暂停事件
        this.$emit('pause', {
          index: this.currentIndex,
          music: this.currentMusic
        })
      } catch (error) {
        console.error('暂停音乐失败:', error)
      }
    },
    
    // 播放下一首
    playNext() {
      if (this.musicList.length === 0) return
      
      // 切换到下一首，若已到末尾则回到第一首
      const nextIndex = this.currentIndex + 1
      this.currentIndex = nextIndex >= this.musicList.length ? 0 : nextIndex
      
      // 播放新音乐
      this.playMusic()
      
      // 触发切换事件
      this.$emit('next', {
        index: this.currentIndex,
        music: this.currentMusic
      })
    },
    
    // 播放上一首
    playPrevious() {
      if (this.musicList.length === 0) return
      
      // 切换到上一首
      this.currentIndex = this.currentIndex === 0 
        ? this.musicList.length - 1 
        : this.currentIndex - 1
      
      // 播放新音乐
      this.playMusic()
      
      // 触发切换事件
      this.$emit('previous', {
        index: this.currentIndex,
        music: this.currentMusic
      })
    },
    
    // 停止播放
    stopMusic() {
      if (!this.audioContext) return
      
      try {
        this.audioContext.stop()
        this.playState = 0
        
        // 触发停止事件
        this.$emit('stop', {
          index: this.currentIndex,
          music: this.currentMusic
        })
      } catch (error) {
        console.error('停止音乐失败:', error)
      }
    },
    
    // 销毁音频上下文
    destroyAudio() {
      if (this.audioContext) {
        this.audioContext.destroy()
        this.audioContext = null
      }
    },
    
    // 设置当前播放的音乐索引
    setCurrentIndex(index) {
      if (this.musicList.length === 0) return
      const targetIndex = Math.min(Math.max(index, 0), this.musicList.length - 1)
      this.currentIndex = targetIndex
      this.$emit('indexChange', {
        index: this.currentIndex,
        music: this.currentMusic
      })
    },
    
    // 获取当前播放状态
    getPlayState() {
      return {
        state: this.playState,
        index: this.currentIndex,
        music: this.currentMusic
      }
    }
  },
  
  // 监听音乐列表变化
  watch: {
    musicList: {
      handler(newList) {
        if (newList && newList.length > 0) {
          this.initAudio()
          if (this.currentIndex >= newList.length) {
            this.currentIndex = 0
          }
        } else {
          this.destroyAudio()
          this.playState = 0
          this.currentIndex = 0
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.music-player {
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-icon {
  width: 60rpx;
  height: 60rpx;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.music-icon:active {
  transform: scale(0.95);
}
</style>

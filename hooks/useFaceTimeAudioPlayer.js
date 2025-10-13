import { ref, onUnmounted } from 'vue';

export const useFaceTimeAudioPlayer = () => {
  const audioInstance = ref(null);

  // 播放音频
  const playAudio = (url, loop) => {
    audioInstance.value = null;

    // 创建新的音频实例
    const audio = document.createElement('audio');
    audioInstance.value = audio;
    audio.src = url;
    // 设置音频循环播放
    audio.loop = loop;
    // 音量
    audio.volume = 1;
    // 使用扬声器播放
    audio.muted = false;

    // 添加事件监听
    const handleEnded = () => {
      console.log('音频播放结束');
      cleanup();
    };

    const handleError = (e) => {
      console.error('音频播放错误:', e);
      cleanup();
    };

    const handlePause = () => {
      console.log('音频暂停');
    };

    const handlePlay = () => {
      console.log('开始播放音频');
    };

    // 清理函数
    const cleanup = () => {
      if (audioInstance.value) {
        audioInstance.value.removeEventListener('ended', handleEnded);
        audioInstance.value.removeEventListener('error', handleError);
        audioInstance.value.removeEventListener('pause', handlePause);
        audioInstance.value.removeEventListener('play', handlePlay);
        audioInstance.value = null;
      }
    };

    // 添加事件监听
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    // 开始播放
    audio.play().catch(error => {
      console.error('播放失败:', error);
      cleanup();
    });
  };

  // 停止播放
  const stopPlaying = () => {
    if (audioInstance.value) {
      audioInstance.value.pause();
      audioInstance.value = null;
    }
  };

  // 组件卸载时清理
  onUnmounted(() => {
    stopPlaying();
  });

  return {
    playAudio,
    stopPlaying,
  };
}; 
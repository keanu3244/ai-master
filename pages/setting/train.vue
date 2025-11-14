<template>
  <view class="train_wrap">
    <view class="bg_wrap_container">
      <!-- <image class="bg" :src="currentBgImage">
      </image> -->
      <image :src="currentBg" mode="aspectFill" class="bg"></image>
    </view>
    <!-- 使用 scroll-view 包裹内容，并设置 ref 和高度 -->
    <scroll-view class="send_content" scroll-y="true" :scroll-top="scrollTop" ref="scrollView">
      <template v-if="barrageList.length">
        <view class="send_item_group" v-for="(item, index) in barrageList" :key="index">
          <!-- 用户消息（右侧显示） -->
          <view class="right flex" v-if="item.q">
            <view class="text_box">
              <!-- 根据消息类型显示重新选择按钮 -->
              <!-- <view class="reset_btn" @click="resetSex" v-if="item.messageType === 'userSex'">
                重新选择
              </view>
              <view class="reset_btn" @click="resetUserDate" v-if="item.messageType === 'userAge'">
                重新选择
              </view> -->
              <view class="info">{{ item.q }}</view>
            </view>
            <!--  <view class="pic_box">
              <view class="reset_btn">
                重新选择
              </view>
              <image src="/static/img/xiangce.png" mode="aspectFill" class="pic_msg"></image>
            </view> -->
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
            <view v-else class="left_response_container">
              <view class="info">{{ item.a }}<view v-if="!userInfo" class="protocol">《用户隐私协议》</view>
              </view>
              <!-- <template v-if="!userInfo">
                <view class="agree_protocol">
                  同意协议，完成身份注册
                </view>
                <view class="sex_container">
                  <view class="sex_box" @click="toggleSex(1)" :class="currentSex == 1 ? 'boy_active' : ''">
                    <image :src="currentSex == 1 ? boyActive : boyNormal" mode="" class="sex_icon"></image>
                    男生
                  </view>
                  <view class="sex_box" @click="toggleSex(2)" :class="currentSex == 2 ? 'girl_active' : ''">
                    <image :src="currentSex == 2 ? girlActive : girlNormal" mode="" class="sex_icon"></image>
                    女生
                  </view>
                </view>
                <picker mode="multiSelector" :range="dateRange" :value="dateIndex" @change="onDateChange"
                  @columnchange="onColumnChange" class="picker">
                  <div class="age_container">{{ confirmedDate || '点击设置您的出生日期' }}</div>
                </picker>
                <view class="character_container">
                  <view class="character" :class="currentCharacter == 0 ? 'active' : ''"
                    @click="() => currentCharacter = 0">
                    成熟稳重
                  </view>
                  <view class="character" :class="currentCharacter == 1 ? 'active' : ''"
                    @click="() => currentCharacter = 1">
                    幽默风趣
                  </view>
                </view>
              </template> -->
            </view>
          </view>
        </view>
      </template>
    </scroll-view>
    <view class="send_footer">
      <view class="send_btns" v-if="userInfo">
        <view class="send_btn" @click="toggleModel" :class="activeTabs[0] ? 'active' : ''">
          <image :src="activeTabs[0] ? jiaolian_sel : jiaolian" mode="aspectFill" class="btn"></image>
          {{ currentMode == 0 ? '教练模式' : '教练模式' }}
        </view>
        <view class="send_btn" @click="handleCustomAI" :class="activeTabs[1] ? 'active' : ''">
          <image :src="activeTabs[1] ? setting_sel : tow" mode="aspectFill" class="btn"></image>
          定制AI
        </view>
        <view class="send_btn" :class="activeTabs[2] ? 'active' : ''" @click="toggleBg">
          <image :src="activeTabs[2] ? qiehuan_sel : qiehuan" mode="aspectFill" class="btn"></image>
          切换背景
        </view>
      </view>
      <view class="send_wrap">
        <!-- <image v-show="!showBtnGroup" @click="() => showBtnGroup = !showBtnGroup" src="/static/img/add.png"
          mode="aspectFill" class="send_add"></image>
        <image v-show="showBtnGroup" @click="() => showBtnGroup = !showBtnGroup" src="/static/img/close.png"
          mode="aspectFill" class="send_add"></image> -->
        <input type="text" class="send_input" placeholder="吐槽你最近的烦心事" placeholder-class="send_pl" v-model="send_val" />
        <image src="/static/img/scence/send2.png" class="send_img" @click="handleSennd" />
      </view>
      <!-- <view class="btn_group" v-if="showBtnGroup">
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
      </view> -->
    </view>
    <view class="music-player-wrapper">
      <MusicPlayer ref="musicPlayerRef" :music-list="currentMusicList" @play="handleMusicPlay" @pause="handleMusicPause"
        @stop="handleMusicStop" />
    </view>
  </view>
</template>

<script setup>
import {
  ref,
  nextTick,
  computed
} from 'vue';
import girlActive from '@/static/img/girl_active.png'
import boyActive from '@/static/img/boy_active.png'
import boyNormal from '@/static/img/boy_nor.png'
import girlNormal from '@/static/img/girl_nor.png'
import qiehuan_sel from '@/static/img/qiehuan_sel.png'
import qiehuan from '@/static/img/qiehuan.png'
import jiaolian_sel from '@/static/img/jiaolian_sel.png'
import jiaolian from '@/static/img/jiaolian.png'
import setting_sel from '@/static/img/setting_sel.png'
import tow from '@/static/img/tow.png'
import { onShow, onHide, onUnload } from '@dcloudio/uni-app'
import MusicPlayer from '@/components/MusicPlayer/MusicPlayer.vue'

const barrageList = ref([]) // 存储所有聊天消息
const send_val = ref('')	// 用户输入内容
const num = ref(0)
const requestBody = ref([])
const scrollTop = ref(0) // 用于控制 scroll-view 的滚动位置
const avatarUrl = ref('') // 用户头像URL
const isLoading = ref(false);
const showBtnGroup = ref(false)
const currentBg = ref('https://www.listentoyouai.com/images/lan.gif') // 当前背景图片
const currentBgImage = ref('/static/img/bluebg.png') // 当前背景图片
const activeTabs = ref([false, false, false])
const currentSex = ref(0)
const ageInfo = ref()
const confirmedDate = ref('') // 用户确认后的日期显示
const currentCharacter = ref(0)
const userInfo = ref(null)
const musicPlayerRef = ref(null)
const isMusicPlaying = ref(false)
const lanMusicTracks = Array.from({ length: 6 }, (_, index) => `https://www.listentoyouai.com/music/lan/${index + 1}.mp3`)
const hongMusicTracks = Array.from({ length: 4 }, (_, index) => `https://www.listentoyouai.com/music/hong/${index + 1}.mp3`)
const currentMusicList = ref(lanMusicTracks.slice())

const applyMusicSeriesByBg = (bgValue) => {
  const useHongSeries = typeof bgValue === 'string' && bgValue.includes('hong')
  currentMusicList.value = (useHongSeries ? hongMusicTracks : lanMusicTracks).slice()
}

const startMusicPlayback = (resetIndex = true) => {
  const player = musicPlayerRef.value
  if (!player) return

  const execute = () => {
    if (!musicPlayerRef.value) return

    if (resetIndex && typeof player.prepareAndPlay === 'function') {
      player.prepareAndPlay({ index: 0 })
    } else if (typeof player.prepareAndPlay === 'function') {
      player.prepareAndPlay()
    } else {
      if (resetIndex && typeof player.setCurrentIndex === 'function') {
        player.setCurrentIndex(0)
      }
      if (typeof player.playMusic === 'function') {
        player.playMusic()
      }
    }

    if (typeof player.syncPlayState === 'function') {
      player.syncPlayState(1)
    }
    isMusicPlaying.value = true
  }

  // 等待列表渲染完成后再触发
  nextTick(execute)
}

const handleMusicPlay = () => {
  isMusicPlaying.value = true
}

const handleMusicPause = () => {
  isMusicPlaying.value = false
}

const handleMusicStop = () => {
  isMusicPlaying.value = false
}

const stopTrainMusic = () => {
  if (musicPlayerRef.value && typeof musicPlayerRef.value.stopMusic === 'function') {
    musicPlayerRef.value.stopMusic()
    if (typeof musicPlayerRef.value.syncPlayState === 'function') {
      musicPlayerRef.value.syncPlayState(0)
    }
  }
  isMusicPlaying.value = false
}

// 根据模式切换音乐列表，并在需要时触发播放
const switchPlaylistForMode = (mode, options = {}) => {
  const { resetIndex = true, autoplay = true } = options
  const targetList = mode === 1 ? hongMusicTracks : lanMusicTracks

  // 切换资源列表，使用 slice 触发视图更新
  currentMusicList.value = targetList.slice()

  if (!autoplay) {
    if (resetIndex && musicPlayerRef.value && typeof musicPlayerRef.value.setCurrentIndex === 'function') {
      musicPlayerRef.value.setCurrentIndex(0)
    }
    if (musicPlayerRef.value && typeof musicPlayerRef.value.syncPlayState === 'function') {
      musicPlayerRef.value.syncPlayState(0)
    }
    return
  }

  startMusicPlayback(resetIndex)
}

// 获取当前日期
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();

// 当前选中的索引（用户）
const dateIndex = ref([currentYear - 1950, currentMonth - 1, currentDay - 1]);

// 日期范围数据（用户）
const years = ref([]);
const months = ref([]);
const days = ref([]);

const currentMode = ref(0)//0普通模式1教练模式
const coachCustId = ref('') // 教练模式：后端需要的客户ID（从历史记录里读取）
const COACH_WELCOME_TEXT = '欢迎来到小听教练空间'

const setTabActive = (index, state) => {
  activeTabs.value[index] = state
}

const toggleTabState = (index) => {
  setTabActive(index, !activeTabs.value[index])
}

const toggleModel = () => {
  const nextMode = currentMode.value === 0 ? 1 : 0
  currentMode.value = nextMode
  wx.setNavigationBarTitle({
    title: nextMode === 1 ? '小听教练' : '陪伴教练'
  })
  setTabActive(0, nextMode === 1)

  // 切换音乐资源并播放对应列表
  stopTrainMusic()
  switchPlaylistForMode(nextMode, { resetIndex: true, autoplay: true })

  // 切换聊天记录数据源
  if (nextMode === 1) {
    loadCoachRecords();
  } else {
    loadRecords();
  }
}

const handleCustomAI = () => {
  toggleTabState(1)
  // 使用 redirectTo 防止页面栈不断累积，避免 webview 数量超限
  uni.redirectTo({
    url: '/pages/user/aiTeacherInfo'
  })
  // currentMode.value = 1
}

// 初始化日期数据
const initDateData = () => {
  // 生成年份数据（1950-当前年份）
  for (let i = 1950; i <= currentYear; i++) {
    years.value.push(i + '年');
  }

  // 生成月份数据
  for (let i = 1; i <= 12; i++) {
    months.value.push(i + '月');
  }

  // 初始化天数数据
  updateDays();
};

const clearAgeInfo = () => {
  years.value = []
  months.value = []
  days.value = []
}

// 更新天数数据（根据选中的年份和月份）
const updateDays = () => {
  const yearIndex = dateIndex.value[0];
  const monthIndex = dateIndex.value[1];

  const year = 1950 + yearIndex;
  const month = monthIndex + 1;

  // 计算当前月份的天数
  let daysInMonth = new Date(year, month, 0).getDate();

  // 更新天数数组
  days.value = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.value.push(i + '日');
  }

  // 如果当前选中的日期大于新月份的天数，则调整为最后一天
  if (dateIndex.value[2] >= daysInMonth) {
    dateIndex.value[2] = daysInMonth - 1;
  }
};


// 日期范围
const dateRange = computed(() => {
  return [years.value, months.value, days.value];
});

// 选中的日期显示（临时显示，用于选择器内部）
const selectedDate = computed(() => {
  if (years.value.length && months.value.length && days.value.length) {
    return `${years.value[dateIndex.value[0]]}${months.value[dateIndex.value[1]]}${days.value[dateIndex.value[2]]}`;
  }
  return '';
});

// 列改变事件
const onColumnChange = (e) => {
  const { column, value } = e.detail;

  // 更新选中的索引
  dateIndex.value[column] = value;

  // 如果年份或月份改变，需要更新天数
  if (column === 0 || column === 1) {
    updateDays();
  }
};

// 计算年龄的函数
const calculateAge = (dateString) => {
  if (!dateString) return 0;

  // 从日期字符串中提取年月日
  const yearMatch = dateString.match(/(\d+)年/);
  const monthMatch = dateString.match(/(\d+)月/);
  const dayMatch = dateString.match(/(\d+)日/);

  if (!yearMatch || !monthMatch || !dayMatch) return 0;

  const birthYear = parseInt(yearMatch[1]);
  const birthMonth = parseInt(monthMatch[1]);
  const birthDay = parseInt(dayMatch[1]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - birthYear;

  // 如果还没到生日，年龄减1
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age;
};

// 发送消息的函数
const sendMessage = (message, messageType = 'normal') => {
  barrageList.value.push({
    q: message,
    a: '',
    messageType: messageType // 添加消息类型标识
  });

  requestBody.value.push({
    role: 'user',
    content: message
  });

  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
};

// 日期选择改变事件
const onDateChange = (e) => {
  dateIndex.value = e.detail.value;
  // 确认选择后更新显示文字
  confirmedDate.value = selectedDate.value;

  // 计算年龄并发送消息
  const age = calculateAge(confirmedDate.value);
  if (age > 0) {
    sendMessage(`我今年${age}岁`, 'userAge');
  }
};

// 确认选择
const confirmSelection = () => {
  if (selectedDate.value) {
    alert(`您选择的出生日期是：${selectedDate.value}`);
  } else {
    alert('请先选择出生日期');
  }
};

// onLoad() => {
//     this.fetchAvatarInfo();
//   },
onShow(() => {
  //初始化背景
  currentBg.value = uni.getStorageSync('currentBg') || currentBg.value;
  currentBgImage.value = uni.getStorageSync('currentBgImage') || currentBgImage.value;
  applyMusicSeriesByBg(currentBg.value);
  setTabActive(0, currentMode.value === 1)
  setTabActive(2, typeof currentBg.value === 'string' && currentBg.value.includes('hong'))

  // if (currentMode.value === 1) {
  //   nextTick(() => {
  //     startCoachMusic(false)
  //   })
  // } else {
  //   stopTrainMusic()
  // }

  initDateData()
  // clearAgeInfo()
  const user = uni.getStorageSync('token');
  userInfo.value = user
  if (!user) {
    uni.$u.toast('请先登录')
    uni.navigateTo({
      url: '/pages/user/my'
    })
    return;
  }
  // 根据当前模式加载对应聊天记录
  if (currentMode.value === 1) {
    loadCoachRecords();
  } else {
    loadRecords();
  }
  fetchAvatarInfo(user)
});

onHide(stopTrainMusic)
onUnload(stopTrainMusic)

const resetSex = () => {
  currentSex.value = 0;
  // 移除性别相关的消息
  barrageList.value = barrageList.value.filter(item =>
    !item.messageType || item.messageType !== 'userSex'
  );
  requestBody.value = requestBody.value.filter(item =>
    !barrageList.value.find(barrage => barrage.q === item.content && barrage.messageType === 'userSex')
  );
};

const toggleBg = () => {
  const shouldResume = currentMode.value === 1 && isMusicPlaying.value
  //获取本地缓存的当前背景图片
  if (currentBg.value === 'https://www.listentoyouai.com/images/lan.gif') {
    currentBg.value = 'https://www.listentoyouai.com/images/hong.gif';
    currentBgImage.value = '/static/img/redbg.png';
  } else {
    currentBg.value = 'https://www.listentoyouai.com/images/lan.gif';
    currentBgImage.value = '/static/img/bluebg.png';
  }
  setTabActive(2, typeof currentBg.value === 'string' && currentBg.value.includes('hong'))

  applyMusicSeriesByBg(currentBg.value);

  if (shouldResume) {
    nextTick(() => {
      startMusicPlayback(true)
    })
  }


  //背景缓存到本地localStorage
  uni.setStorageSync('currentBg', currentBg.value);
  uni.setStorageSync('currentBgImage', currentBgImage.value);
};

const toggleSex = (sex) => {
  currentSex.value = sex;

  // 发送性别消息
  if (sex === 1) {
    sendMessage('我是男生', 'userSex');
  } else if (sex === 2) {
    sendMessage('我是女生', 'userSex');
  }
};

const resetUserDate = () => {
  confirmedDate.value = '';
  // 移除用户年龄相关的消息
  barrageList.value = barrageList.value.filter(item =>
    !item.messageType || item.messageType !== 'userAge'
  );
  requestBody.value = requestBody.value.filter(item =>
    !barrageList.value.find(barrage => barrage.q === item.content && barrage.messageType === 'userAge')
  );
};

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
        // 尝试从用户信息中带出教练会话所需ID
        if (!coachCustId.value) {
          coachCustId.value = res.data.cust_id || res.data.weixin_id || ''
        }
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

const loadRecords = () => {
  const user = uni.getStorageSync('token');

  // 检查本地缓存
  const cachedData = uni.getStorageSync('chatRecordsCache');
  const cacheTimestamp = uni.getStorageSync('chatRecordsCacheTime');
  const currentTime = Date.now();
  const cacheExpireTime = 24 * 60 * 60 * 1000; // 24小时

  // 如果缓存存在且未过期，使用缓存数据
  if (cachedData && cacheTimestamp && (currentTime - cacheTimestamp) < cacheExpireTime) {
    console.log('使用缓存的聊天记录');
    const records = JSON.parse(cachedData);

    // 清空现有数据
    barrageList.value = [];
    requestBody.value = [];

    // 加载缓存的聊天记录
    records.forEach(record => {
      if (record.chat_role === 'user') {
        barrageList.value.push({
          q: record.chat_content
        });
        requestBody.value.push({
          role: 'user',
          content: record.chat_content
        })
      } else if (record.chat_role === 'assistant') {
        barrageList.value.push({
          a: record.chat_content
        });
        requestBody.value.push({
          role: 'assistant',
          content: record.chat_content
        })
      }
    });

    barrageList.value.unshift({
      a: '今天聊点什么对你来说是最有价值的?'
    });

    // 数据加载完成后，滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
    return;
  }

  // 缓存不存在或已过期，从服务器获取
  console.log('从服务器获取聊天记录');
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

        // 缓存到本地，保存24小时
        uni.setStorageSync('chatRecordsCache', JSON.stringify(records));
        uni.setStorageSync('chatRecordsCacheTime', Date.now());

        // 清空现有数据
        barrageList.value = [];
        requestBody.value = [];

        records.forEach(record => {
          // const new_record = JSON.parse(record.chat_data)
          //const new_record1 = record.chat_data;
          //const matches = record.chat_data.match(/\{.*?\}/g);
          //const new_record = new_record1.split('},{')
          //console.log(matches)
          console.log('record', record)
          if (record.chat_role === 'user') {
            //console.log(new_record.content)
            barrageList.value.push({
              q: record.chat_content
            });
            requestBody.value.push({
              role: 'user',
              content: record.chat_content
            })
          } else if (record.chat_role === 'assistant') {
            //console.log(new_record.content)
            // if (barrageList.value.length > 0 && barrageList.value[barrageList.value
            // 		.length - 1].a === '') {
            // 	barrageList.value[barrageList.value.length - 1].a = new_record.content;
            barrageList.value.push({
              a: record.chat_content
            });
            requestBody.value.push({
              role: 'assistant',
              content: record.chat_content
            })
          };
          //console.log(barrageList.value)
        });
        console.log('barrageList', barrageList)
        barrageList.value.unshift({
          a: '今天聊点什么对你来说是最有价值的?'
        });
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

// 教练模式：加载聊天记录（使用专用缓存与接口）
const loadCoachRecords = () => {
  const user = uni.getStorageSync('token');

  // 检查本地缓存（教练模式独立缓存）
  const cachedData = uni.getStorageSync('coachChatRecordsCache');
  const cacheTimestamp = uni.getStorageSync('coachChatRecordsCacheTime');
  const currentTime = Date.now();
  const cacheExpireTime = 24 * 60 * 60 * 1000; // 24小时

  if (cachedData && cacheTimestamp && (currentTime - cacheTimestamp) < cacheExpireTime) {
    console.log('使用缓存的聊天记录(教练模式)');
    const records = JSON.parse(cachedData);

    barrageList.value = [];
    requestBody.value = [];
    coachCustId.value = ''

    records.forEach(record => {
      if (!coachCustId.value && record.cust_id) coachCustId.value = record.cust_id;
      if (record.chat_role === 'user') {
        barrageList.value.push({ q: record.chat_content });
        requestBody.value.push({ role: 'user', content: record.chat_content })
      } else if (record.chat_role === 'assistant') {
        barrageList.value.push({ a: record.chat_content });
        requestBody.value.push({ role: 'assistant', content: record.chat_content })
      }
    });

    nextTick(() => { scrollToBottom(); });
    // 确保欢迎语
    ensureCoachWelcomeMessage();
    return;
  }

  // 从服务器拉取教练模式聊天记录
  uni.request({
    url: 'https://www.listentoyouai.com:80/query_data/coach_mentor_api',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user}`
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const records = res.data || [];

        // 缓存到本地
        uni.setStorageSync('coachChatRecordsCache', JSON.stringify(records));
        uni.setStorageSync('coachChatRecordsCacheTime', Date.now());

        barrageList.value = [];
        requestBody.value = [];
        coachCustId.value = ''

        records.forEach(record => {
          if (!coachCustId.value && record.cust_id) coachCustId.value = record.cust_id;
          if (record.chat_role === 'user') {
            barrageList.value.push({ q: record.chat_content });
            requestBody.value.push({ role: 'user', content: record.chat_content })
          } else if (record.chat_role === 'assistant') {
            barrageList.value.push({ a: record.chat_content });
            requestBody.value.push({ role: 'assistant', content: record.chat_content })
          }
        });

        nextTick(() => { scrollToBottom(); });
        // 确保欢迎语
        ensureCoachWelcomeMessage();
      } else if (res.statusCode === 401) {
        uni.$u.toast('请先登录')
        uni.navigateTo({ url: '/pages/user/my' })
      }
    },
    fail: (err) => {
      console.error('获取教练模式聊天记录失败', err);
    }
  });
};

// 进入教练模式时，确保插入欢迎语（仅一次，不重复）
const ensureCoachWelcomeMessage = async () => {
  try {
    // 若列表中已存在欢迎语则不再插入
    const exists = barrageList.value.some(i => i.a && i.a.indexOf(COACH_WELCOME_TEXT) !== -1)
    if (exists) return;

    // 先本地显示
    barrageList.value.push({ a: COACH_WELCOME_TEXT })
    requestBody.value.push({ role: 'assistant', content: COACH_WELCOME_TEXT })
    updateChatCache();
    nextTick(() => { scrollToBottom(); });

    // 再调用后端插入
    const token = uni.getStorageSync('token');
    const payload = { chat_content: COACH_WELCOME_TEXT, chat_role: 'assistant' }
    if (coachCustId.value) payload.cust_id = coachCustId.value;

    await uni.request({
      url: 'https://www.listentoyouai.com:80/modify_data/coach_chat_api',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      data: payload
    })
  } catch (err) {
    console.warn('插入教练欢迎语失败(已忽略):', err)
  }
}

const loadMoreRecords = () => {
  if (currentMode.value === 1) {
    loadCoachRecords();
  } else {
    loadRecords();
  }
};

// 更新聊天记录缓存（区分普通/教练模式）
const updateChatCache = () => {
  try {
    // 将 requestBody 转换为与服务器返回格式一致的数据结构
    const cacheData = requestBody.value.map(item => ({
      chat_role: item.role,
      chat_content: item.content
    }));

    // 更新缓存数据和时间戳
    const cacheKey = currentMode.value === 1 ? 'coachChatRecordsCache' : 'chatRecordsCache'
    const cacheTimeKey = currentMode.value === 1 ? 'coachChatRecordsCacheTime' : 'chatRecordsCacheTime'
    uni.setStorageSync(cacheKey, JSON.stringify(cacheData));
    uni.setStorageSync(cacheTimeKey, Date.now());
    console.log('聊天记录缓存已更新');
  } catch (error) {
    console.error('更新缓存失败:', error);
  }
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
  // 2. 添加用户消息到列表（手动输入的消息不添加messageType）
  barrageList.value.push({
    q: send_val.value,
    a: ''
    // 手动输入的消息不添加messageType，默认为'normal'
  })
  requestBody.value.push({
    role: 'user',
    content: send_val.value
  })
  const copySendValue = send_val.value
  send_val.value = ''
  //const test1 = JSON.parse(requestBody)
  let requestBodyString = JSON.stringify(requestBody.value);
  //截取前八条聊记录
  let requestBodyString_new = JSON.stringify((JSON.parse(requestBodyString)).slice(-1));
  let memory_prompts = JSON.stringify((JSON.parse(requestBodyString)).slice(-8));
  console.log(requestBodyString_new);
  //isLoading.value = true;
  uni.request({
    url: currentMode.value == 0 ? 'https://www.listentoyouai.com:80/chat/freedom_api' : 'https://www.listentoyouai.com:80/chat/mentor_api',
    method: 'POST',
    data: {
      user_chat: copySendValue,
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

        // 更新本地缓存
        updateChatCache();

        // 数据加载完成后，滚动到底部
        nextTick(() => {
          scrollToBottom();
        });

      } else {
        console.error(`请求失败，状态码: ${res.statusCode}`);
        uni.$u.toast('请求失败，请稍后重试');
        // 移除思考中的状态
        if (barrageList.value[num.value]) {
          barrageList.value[num.value].a = '抱歉，我暂时无法回复，请稍后再试';
        }
      }
    },
    fail: (err) => {
      console.error('请求失败:', err);
      uni.$u.toast('网络错误，请检查网络连接');
      // 移除思考中的状态
      if (barrageList.value[num.value]) {
        barrageList.value[num.value].a = '网络连接失败，请检查网络后重试';
      }
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
  height: 100vh;
  overflow: hidden;

  .bg_wrap_container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    /* #ifdef MP-WEIXIN */
    z-index: -1;

    /* #endif */
    .bg {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      justify-content: center;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }

    .bg_wrap {
      width: 700rpx;
      height: 700rpx;
      position: absolute;
      bottom: calc(24rpx + env(safe-area-inset-bottom));
      bottom: calc(24rpx + constant(safe-area-inset-bottom));
      left: calc(50% - 350rpx);
    }
  }

  .music-player-wrapper {
    position: fixed;
    top: 150rpx;
    top: calc(constant(safe-area-inset-top) + 50rpx);
    top: calc(env(safe-area-inset-top) + 50rpx);
    right: 40rpx;
    z-index: 300;
  }

  .music-overlay-btn {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    z-index: 999;
    outline: none;
    touch-action: manipulation;
  }

  .music-overlay-btn::after {
    display: none;
  }

  .send_content {
    overflow-y: auto;
    margin-top: 40rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    height: calc(1034rpx + constant(safe-area-inset-bottom)) !important;
    height: calc(1034rpx + env(safe-area-inset-bottom)) !important;
    overflow-y: scroll;

    .confirm_btn {
      margin: 0 auto;
      margin-top: 50rpx;
      width: 510rpx;
      height: 88rpx;
      background: linear-gradient(180deg, #36B2FF 0%, #1A58EB 100%);
      border-radius: 44rpx 44rpx 44rpx 44rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: PingFang SC, PingFang SC;
      font-weight: normal;
      font-size: 32rpx;
      color: #FEFFFF;
      line-height: 42rpx;
      text-align: center;
      font-style: normal;
      text-transform: none;
    }

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

        .avator {
          display: inline-block;
          width: 72rpx !important;
          height: 72rpx !important;
          border-radius: 36rpx;
        }

        .left_response_container {
          .info {
            box-sizing: border-box;
            display: inline-block;
            padding: 26rpx;
            background: linear-gradient(180deg, #FFFFFF 0%, #FFF9F2 100%);
            border-radius: 0 48rpx 48rpx 48rpx;
            border: 2rpx solid rgba(40, 40, 43, 0.1);
            font-family: PingFang SC, PingFang SC;
            font-weight: normal;
            font-size: 28rpx;
            color: #101216;
            max-width: 500rpx;

            .protocol {
              color: #6b8cd5;
            }
          }

          .agree_protocol {
            width: 510rpx;
            height: 88rpx;
            background: linear-gradient(180deg, #36B2FF 0%, #1A58EB 100%);
            border-radius: 44rpx 44rpx 44rpx 44rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: PingFang SC, PingFang SC;
            font-weight: normal;
            font-size: 28rpx;
            color: #FEFFFF;
            line-height: 42rpx;
            text-align: center;
            font-style: normal;
            text-transform: none;
            margin-top: 190rpx;
          }

          .sex_container {
            display: flex;
            align-items: center;
            gap: 32rpx;
            margin-top: 16rpx;

            .sex_box:nth-child(1) {
              width: 240rpx;
              height: 88rpx;
              background: rgba(148, 214, 255, 0.3);
              border-radius: 48rpx 48rpx 48rpx 48rpx;
              border: 2rpx solid rgba(0, 0, 0, 0.05);
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 18rpx;

              .sex_icon {
                width: 40rpx;
                height: 40rpx;
              }
            }

            .boy_active {
              background: linear-gradient(180deg, #85D0FF 0%, #179FF4 100%) !important;
              color: #FFFFFF;
            }

            .sex_box:nth-child(2) {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 240rpx;
              height: 88rpx;
              background: rgba(254, 195, 239, 0.3);
              border-radius: 48rpx 48rpx 48rpx 48rpx;
              border: 2rpx solid rgba(0, 0, 0, 0.05);
              gap: 18rpx;

              .sex_icon {
                width: 40rpx;
                height: 40rpx;
              }
            }

            .girl_active {
              background: linear-gradient(180deg, #FF98E5 0%, #EF50C6 100%) !important;
              color: #FFFFFF;
            }
          }

          .age_container {
            width: 510rpx;
            height: 88rpx;
            background: linear-gradient(180deg, #36B2FF 0%, #1A58EB 100%);
            border-radius: 44rpx 44rpx 44rpx 44rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: PingFang SC, PingFang SC;
            font-weight: normal;
            font-size: 28rpx;
            color: #FEFFFF;
            line-height: 42rpx;
            text-align: center;
            font-style: normal;
            text-transform: none;
            margin-top: 16rpx;
          }

          .character_container {
            display: flex;
            gap: 32rpx;
            margin-top: 16rpx;

            .character {
              width: 240rpx;
              height: 88rpx;
              background: rgba(128, 194, 255, 0.5);
              border-radius: 48rpx;
              border: 2rpx solid rgba(0, 0, 0, 0.05);
              font-family: PingFang SC, PingFang SC;
              font-weight: normal;
              font-size: 32rpx;
              color: #1A5DC5;
              line-height: 48rpx;
              text-align: center;
              font-style: normal;
              text-transform: none;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .active {
              color: #FFFFFF;
              background: linear-gradient(180deg, #36B2FF 0%, #1A58EB 100%);
            }
          }
        }
      }

      .right {
        margin-bottom: 36rpx;
        align-items: flex-end; // 头像和消息底部对齐
        justify-content: flex-end;

        .text_box {
          margin-right: 26rpx;
          display: flex;
          align-items: center;

          .reset_btn {
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
            word-wrap: break-word;
            max-width: 500rpx;
          }
        }

        .pic_box {
          display: flex;
          align-items: center;
          margin-right: 26rpx;

          .reset_btn {
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

          .pic_msg {
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
    padding: 24rpx 32rpx calc(24rpx + constant(safe-area-inset-bottom)) 32rpx;
    padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom)) 32rpx;
    z-index: 2;
    // height: 280rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 48rpx 48rpx 0rpx 0rpx;
    border: 2rpx solid #FFFFFF;
    position: fixed;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;

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
        width: 203rpx;
        height: 60rpx;
        background: rgba(202, 239, 254, 0.5);
        border-radius: 30rpx 30rpx 30rpx 30rpx;
        border: 1rpx solid rgba(5, 46, 116, 0.3);
        padding-left: 20rpx;
        margin-right: 20rpx;
        font-family: PingFang SC, PingFang SC;
        font-weight: normal;
        font-size: 28rpx;
        color: #00438B;
        line-height: 42rpx;
        text-align: left;

        .btn {
          width: 28rpx;
          height: 28rpx;
          margin-right: 8rpx;
        }
      }

      .active {
        background: rgba(44, 126, 214, 0.9);
        color: #fff;
        border: 1rpx solid rgba(5, 46, 116, 0.3);
      }
    }

    .send_wrap {
      box-sizing: border-box;
      padding-left: 16rpx;
      // width: 100%;
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

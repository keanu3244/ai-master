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
      <!-- <image class="bg" src="/static/img/redbg.png">
      </image> -->
      <image src="https://www.listentoyouai.com/images/hole.gif" mode="aspectFill" class="bg"></image>

    </view>
    <!-- <image src="https://jakewinn.github.io/portals/img/ai_bg1.gif" mode="aspectFill" class="bg_img"></image> -->
    <view class="rant_wrap" v-if="filteredBarrages.length">
      <view class="rant_content" v-for="item in filteredBarrages" :key="item.id" :style="getBarrageStyle(item)">
        <view class="rant_item">
          <text class="rant_text">{{ formatDisplayText(item) }}</text>
        </view>
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
    <view class="music-player-wrapper">
      <MusicPlayer ref="musicPlayerRef" :music-list="tuMusicList" @play="handleMusicPlay" />
    </view>
    <!-- <button v-if="showMusicOverlay" class="music-overlay-btn" type="default" hover-class="none"
      @click="handleOverlayPlay"></button> -->
  </view>
  <comp-picker :show="scenshow" :columns="scencolumns" @cancel="scenshow = false" @confirm="handle_confirm"
    keyName="label" :defaultIndex="[scenindex]"></comp-picker>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { onHide, onUnload, onShow } from '@dcloudio/uni-app';
import io from '@hyoga/uni-socket.io';
import MusicPlayer from '@/components/MusicPlayer/MusicPlayer.vue'

const socket = io('wss://www.listentoyouai.com:80', {
  query: {},
  transports: ['websocket', 'polling'],
  timeout: 5000,
});

const MAX_BARRAGE_TRACKS = 10
const LANE_HEIGHT = 72
const LANE_GAP = 20 // ≈10px 间距
const DEFAULT_DURATION = 12
const DEFAULT_DELAY = 0
const LANE_SPEED_VARIANTS = [9, 10, 12, 14, 16, 18]
const MAX_CACHE_ITEMS = 80
let laneCursor = 0
const laneTimers = Array.from({ length: MAX_BARRAGE_TRACKS }, () => 0)
const BARRAGE_CACHE_KEY = 'home_barrage_cache'
const BARRAGE_CACHE_TIME_KEY = 'home_barrage_cache_time'
const BARRAGE_CACHE_EXPIRE = 60 * 60 * 1000
const AUTO_TUCAO_RULES = [
  { hour: 7, minute: 0, label: '职场', remark: '上班前' },
  { hour: 15, minute: 0, label: '创业', remark: '上班中' },
  { hour: 23, minute: 0, label: '情感', remark: '睡前' }
]
const DS_SYSTEM_PROMPTS = '有职场、创业、成长、情感、家庭五个标签，请根据用户输入的标签来回答对应标签的一句吐槽内容，字数要求10个字左右'

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
const scenvalue = ref('职场')
const scenindex = ref(0)
const handlescen = () => {
  scenshow.value = true
}
const handle_confirm = ({ index, value }) => {
  scenshow.value = false
  scenindex.value = index;
  scenvalue.value = value[0].label
}

const jumppage = () => {
  uni.navigateTo({ url: '/pages/setting/train' })
}
const handleJump = () => {
  uni.navigateTo({ url: '/pages/user/userinfo' })
}
const handleJump2 = () => {
  uni.navigateTo({ url: '/pages/user/my' })
}
const handleJump3 = () => {
  uni.navigateTo({ url: '/pages/user/aiTeacherInfo' })
}
const handledq = () => {
  uni.$u.toast('内测中')
}

const randomAutoUsername = () => {
  const presets = ['小宇宙⭐', 'nova_7', '风里有我', 'Aurora', 'Alpha-01', '心里住着猫', '夜空', 'Neko', 'Moon@light', '云中有个你']
  const pick = presets[Math.floor(Math.random() * presets.length)]
  const suffix = Math.random().toString(36).slice(2, 4)
  return `${pick}${suffix}`
}

const send_val = ref('')

const musicPlayerRef = ref(null)
const showMusicOverlay = ref(true)
const tuMusicList = ref(Array.from({ length: 5 }, (_, index) => `https://www.listentoyouai.com/music/tu/${index + 1}.mp3`))

const handleOverlayPlay = () => {
  if (!musicPlayerRef.value) return
  if (typeof musicPlayerRef.value.setCurrentIndex === 'function') {
    musicPlayerRef.value.setCurrentIndex(0)
  }
  if (typeof musicPlayerRef.value.playMusic === 'function') {
    musicPlayerRef.value.playMusic()
    showMusicOverlay.value = false
  }
}
const handleMusicPlay = () => {
  showMusicOverlay.value = false
}
const teardownMusic = () => {
  if (musicPlayerRef.value && typeof musicPlayerRef.value.stopMusic === 'function') {
    musicPlayerRef.value.stopMusic()
  }
  showMusicOverlay.value = true
}

let socketInitialized = false
let autoScheduleEnabled = false
let historyFetched = false
const socketConnected = ref(false)
const pendingSocketMessages = []
const cachedBulletKeys = new Set()
const barrageList = ref([])
const filteredBarrages = computed(() => {
  const list = barrageList.value
  if (!list.length) return list
  const filtered = list.filter(item => (item.className || '') === (scenvalue.value || ''))
  return filtered.length ? filtered : list
})

const formatDisplayText = (item = {}) => {
  const username = item.user_name || item.username || ''
  const text = (item.content || '').trim()
  if (!text) return ''
  return username ? `${username}：${text}` : text
}
const autoTucaoTimers = []

const persistBarrageCache = () => {
  try {
    const snapshot = barrageList.value.slice(-MAX_CACHE_ITEMS)
    uni.setStorageSync(BARRAGE_CACHE_KEY, JSON.stringify(snapshot))
    uni.setStorageSync(BARRAGE_CACHE_TIME_KEY, Date.now())
  } catch (err) {
    console.error('缓存弹幕失败', err)
  }
}

const buildBulletCacheKey = (custId, expiration) => {
  if (!(custId && expiration)) return null
  return `${custId}__${expiration}`
}

const attachServerMeta = (entry, { id, expiration_time, cust_id, user_name, username }) => {
  if (!entry) return false
  let changed = false
  if (id && !entry.serverId) {
    entry.serverId = id
    changed = true
  }
  if (expiration_time && !entry.expirationTime) {
    entry.expirationTime = expiration_time
    changed = true
  }
  if (cust_id && !entry.cust_id) {
    entry.cust_id = cust_id
    changed = true
  }
  const author = user_name || username
  if (author && entry.username !== author) {
    entry.username = author
    changed = true
  }
  const cacheKey = buildBulletCacheKey(entry.cust_id, entry.expirationTime)
  if (cacheKey && !cachedBulletKeys.has(cacheKey)) {
    cachedBulletKeys.add(cacheKey)
  }
  return changed
}

const pushBarrage = ({ content, className, lane, timestamp, serverId, expirationTime, cust_id, username }) => {
  const text = (content || '').trim()
  if (!text) return
  const cacheKey = buildBulletCacheKey(cust_id, expirationTime)
  if (cacheKey && cachedBulletKeys.has(cacheKey)) return
  const assignedLane = typeof lane === 'number' ? lane : laneCursor
  if (typeof lane !== 'number') {
    laneCursor = (laneCursor + 1) % MAX_BARRAGE_TRACKS
  }
  const now = Date.now()
  const availableAt = laneTimers[assignedLane] || now
  const delayMs = Math.max(availableAt - now, 0)
  const duration = LANE_SPEED_VARIANTS[assignedLane % LANE_SPEED_VARIANTS.length]
  laneTimers[assignedLane] = availableAt + duration * 1000
  barrageList.value.push({
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    content: text,
    username: username || '',
    duration,
    delay: delayMs / 1000,
    className: className || scenvalue.value,
    lane: assignedLane,
    timestamp: timestamp || Date.now(),
    serverId: serverId || '',
    expirationTime: expirationTime || '',
    cust_id: cust_id || ''
  })
  if (cacheKey) cachedBulletKeys.add(cacheKey)
  if (barrageList.value.length > MAX_CACHE_ITEMS) {
    barrageList.value.splice(0, barrageList.value.length - MAX_CACHE_ITEMS)
  }
  persistBarrageCache()
}

const restoreBarrageFromCache = () => {
  try {
    const cached = uni.getStorageSync(BARRAGE_CACHE_KEY)
    const cacheTime = uni.getStorageSync(BARRAGE_CACHE_TIME_KEY)
    if (!cached || !cacheTime) return
    if (Date.now() - cacheTime > BARRAGE_CACHE_EXPIRE) return
    const list = JSON.parse(cached)
    list.forEach(item => pushBarrage(item))
  } catch (err) {
    console.warn('读取缓存弹幕失败', err)
  }
}

const handleSocketMessage = (msg) => {
  const payload = typeof msg === 'string' ? { message: msg } : (msg || {})
  const text = payload.message || payload.chat_content || payload.content
  if (!text) return
  const className = payload.class_name || payload.className || scenvalue.value
  const username = payload.user_name || payload.username || payload.nick_name || ''
  pushBarrage({ content: text, className, serverId: payload.id, expirationTime: payload.expiration_time, cust_id: payload.cust_id, username })
}

const flushPendingSocketMessages = () => {
  if (!socketConnected.value) return
  while (pendingSocketMessages.length) {
    socket.emit('send_data', pendingSocketMessages.shift())
  }
}

const setupSocket = () => {
  if (socketInitialized) return
  socketInitialized = true
  socket.on('connect', () => {
    socketConnected.value = true
    flushPendingSocketMessages()
    if (!historyFetched) {
      historyFetched = true
      fetchBulletHistory()
    }
  })
  socket.on('disconnect', () => {
    socketConnected.value = false
  })
  socket.on('broadcast', (msg) => {
    handleSocketMessage(msg)
  })
}

const emitBarrageMessage = ({ content, className, isAuto }) => {
  const payload = {
    text_message: {
      content,
      username: uni.getStorageSync('username') || '匿名',
      class_name: className,
      auto: !!isAuto
    }
  }
  if (socketConnected.value) {
    socket.emit('send_data', payload)
  } else {
    pendingSocketMessages.push(payload)
  }
}

const postBarrageRecord = async (content, className, username) => {
  try {
    const token = uni.getStorageSync('token')
    const cust_id = uni.getStorageSync('cust_id') || ''
    const author = username || uni.getStorageSync('username') || ''
    const res = await uni.request({
      url: 'https://www.listentoyouai.com:80/modify_data/user_bulletdata_api',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      data: {
        class_name: className,
        chat_content: content,
        cust_id,
        username: author
      }
    })
    if (res.statusCode === 200 && res.data) {
      // 服务端推送将再次写入缓存，此处无需重复处理
    }
  } catch (err) {
    console.error('上传弹幕失败', err)
  }
}

const sendBarrageFlow = async ({ content, className, isAuto = false }) => {
  const text = (content || '').trim()
  if (!text) return
  const cls = className || scenvalue.value
  const localCustId = uni.getStorageSync('cust_id') || ''
  const username = isAuto ? randomAutoUsername() : (uni.getStorageSync('username') || '匿名')
  emitBarrageMessage({ content: text, className: cls, isAuto })
  await postBarrageRecord(text, cls, username)
}

const fetchBulletHistory = async () => {
  try {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: 'https://www.listentoyouai.com:80/query_data/get_bullet_info_api',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    if (res.statusCode === 200 && Array.isArray(res.data)) {
      res.data.forEach(item => {
        pushBarrage({
          content: item.chat_content,
          className: item.class_name,
          serverId: item.id,
          expirationTime: item.expiration_time,
          cust_id: item.cust_id,
          username: item.user_name
        })
      })
    }
  } catch (err) {
    console.error('查询弹幕失败', err)
  }
}

const getBarrageStyle = (item = {}) => {
  const lane = item.lane || 0
  const top = lane * (LANE_HEIGHT + LANE_GAP)
  const duration = item.duration || DEFAULT_DURATION
  const delay = item.delay ?? DEFAULT_DELAY
  return `top: ${top}rpx; animation-duration: ${duration}s; animation-delay: ${delay}s;`
}

const generateAutoTucao = async (label) => {
  try {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: 'https://www.listentoyouai.com:80/chat/ds_api',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      data: {
        prompts: JSON.stringify([{ role: 'user', content: label }]),
        system_prompts: DS_SYSTEM_PROMPTS
      }
    })
    if (res.statusCode === 200) {
      if (typeof res.data === 'string') return res.data.trim()
      if (res.data && typeof res.data === 'object') {
        return (res.data.content || res.data.result || '').trim()
      }
    }
  } catch (err) {
    console.error('生成自动吐槽失败', err)
  }
  return ''
}

const triggerAutoBarrage = async (label) => {
  const content = await generateAutoTucao(label)
  if (!content) return
  await sendBarrageFlow({ content, className: label, isAuto: true })
}

const clearAutoTucaoTimers = () => {
  autoScheduleEnabled = false
  while (autoTucaoTimers.length) {
    clearTimeout(autoTucaoTimers.pop())
  }
}

const calcDelay = (hour, minute) => {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

const scheduleAutoTucao = () => {
  clearAutoTucaoTimers()
  autoScheduleEnabled = true
  AUTO_TUCAO_RULES.forEach(rule => {
    const scheduleNext = (delay) => {
      const timer = setTimeout(() => {
        const idx = autoTucaoTimers.indexOf(timer)
        if (idx > -1) autoTucaoTimers.splice(idx, 1)
        triggerAutoBarrage(rule.label).finally(() => {
          if (autoScheduleEnabled) {
            scheduleNext(24 * 60 * 60 * 1000)
          }
        })
      }, delay)
      autoTucaoTimers.push(timer)
    }
    scheduleNext(calcDelay(rule.hour, rule.minute))
  })
}

const handleSend = async () => {
  const user = uni.getStorageSync('token')
  if (!user) {
    uni.$u.toast('请先登录')
    uni.navigateTo({ url: '/pages/user/my' })
    return
  }
  if (!send_val.value) {
    uni.$u.toast('请输入点文字啦')
    return
  }
  const text = send_val.value
  send_val.value = ''
  await sendBarrageFlow({ content: text, className: scenvalue.value })
}

onMounted(() => {
  setupSocket()
  restoreBarrageFromCache()
  setTimeout(() => {
    if (!historyFetched) {
      historyFetched = true
      fetchBulletHistory()
    }
  }, 3000)
})

onShow(() => {
  scheduleAutoTucao()
})

onHide(() => {
  teardownMusic()
  clearAutoTucaoTimers()
})

onUnload(() => {
  teardownMusic()
  clearAutoTucaoTimers()
})
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

  .music-player-wrapper {
    position: fixed;
    top: 150rpx;
    top: calc(constant(safe-area-inset-top) + 220rpx);
    top: calc(env(safe-area-inset-top) + 220rpx);
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

  @keyframes barrageMove {
    0% {
      transform: translateX(100%);
    }

    100% {
      transform: translateX(-100%);
    }
  }

  .rant_wrap {
    position: relative;
    height: calc((72rpx + 20rpx) * 10);
    overflow: hidden;
    padding: 30rpx 0 0 0;
    pointer-events: none;

    .rant_content {
      position: absolute;
      left: 0;
      width: 100%;
      animation-name: barrageMove;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;
      transform: translateX(100%);
    }

    .rant_item {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      min-height: 72rpx;
      padding: 16rpx 24rpx;
      font-family: PingFang SC, PingFang SC;
      font-weight: normal;
      font-size: 28rpx;
      color: #4B052F;
      line-height: 40rpx;
      text-align: left;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 249, 242, 0.6) 100%);
      border-radius: 36rpx 36rpx 0 36rpx;
      border: 1rpx solid rgba(255, 255, 255, 0.8);
      box-sizing: border-box;
    }

    .rant_text {
      white-space: nowrap;
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
    z-index: 998;

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

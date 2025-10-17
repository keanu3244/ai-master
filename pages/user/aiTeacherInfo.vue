<template>
  <view class="form_wrap">
    <view class="bg_wrap_container">
      <!-- <image class="bg" :src="currentBgImage">
	    </image> -->
      <image src="https://www.listentoyouai.com/images/lan.gif" mode="aspectFill" class="bg"></image>
    </view>
    <view class="com_item">
      Hi，我是小芽教练，为了帮您解决问题，需要了解您的情况？
    </view>
    <view class="com_item">
      您期望AI的性别是？
    </view>
    <!-- <view class="com_item colum">
      <span class="sex_item" :class="{act:sexnum == 0}" @click="handleSex(0)">男生</span>
      <span class="sex_item" :class="{act:sexnum == 1}" @click="handleSex(1)">女生</span>
    </view> -->
    <view class="sex_container">
      <view class="sex_box" @click="handleSex(0)" :class="sexnum == 0 ? 'boy_active' : ''">
        <image :src="sexnum == 0 ? boyActive : boyNormal" mode="" class="sex_icon"></image>
        男生
      </view>
      <view class="sex_box" @click="handleSex(1)" :class="sexnum == 1 ? 'girl_active' : ''">
        <image :src="sexnum == 1 ? girlActive : girlNormal" mode="" class="sex_icon"></image>
        女生
      </view>
    </view>
    <view class="com_item">
      接下来告诉我，AI的年龄吧
    </view>
    <view class="com_item colum">

      <!-- <up-datetime-picker class="picker" :formatter="formatter" :show="calendarShow" mode="date" v-model="dateval"
        ref="datetimePickerRef" @confirm="handleConfirm"></up-datetime-picker> -->
      <picker mode="multiSelector" :range="aiDateRange" :value="aiDateIndex" @change="onAIDateChange"
        @columnchange="onAIColumnChange" class="picker">
        <div class="age_container" :class="confirmedAIDate ? 'active' : ''">{{ confirmedAIDate || '点击设置AI的出生日期'
        }}
        </div>
      </picker>

      <!-- <span class="sex_item" @click="calendarShow = true">{{ date }}</span> -->
    </view>
    <view class="com_item">
      接下来设置AI的性格？
    </view>
    <view class="com_item colum">
      <!-- <span class="sex_item" :class="{ act: characterType == 0 }" @click="handleCharacter(0)">成熟稳重</span>
      <span class="sex_item" :class="{ act: characterType == 1 }" @click="handleCharacter(1)">风趣幽默</span> -->
      <view class="character_container">
        <view class="character" :class="characterType == 0 ? 'active' : ''" @click="handleCharacter(0)">
          成熟稳重
        </view>
        <view class="character" :class="characterType == 1 ? 'active' : ''" @click="handleCharacter(1)">
          幽默风趣
        </view>
      </view>
    </view>

    <view class="protocol_item">
      <!-- <up-checkbox :customStyle="{ marginBottom: '8px' }" label="" name="agree" usedAlone
        v-model:checked="aloneChecked">
        <template #label>
          <view class="protocol">最后需要您同意<view class="protocol_text" @click="jumpage">《用户隐私协议》</view>
          </view>
        </template>
</up-checkbox> -->
      <view class="agree_protocol" @click="handleSubmit">
        保存
      </view>
    </view>

    <!-- <button class="submit" type="primary" @click="handleSubmit">
      提交资料
    </button> -->


  </view>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed
} from 'vue';
import {
  onReady,
  onShow
} from '@dcloudio/uni-app';
import girlActive from '@/static/img/girl_active.png'
import boyActive from '@/static/img/boy_active.png'
import boyNormal from '@/static/img/boy_nor.png'
import girlNormal from '@/static/img/girl_nor.png'
const avtor = ref('')
const nickname = ref('')
const calendarShow = ref(false)
const date = ref('点击设置你的出生日期')
const dateval = ref(Date.now())
const aloneChecked = ref(false);
const sexnum = ref(-1);
const characterType = ref(-1);
// const datetimePickerRef = ref(null);
onReady(() => {
  // 微信小程序需要用此写法
  // datetimePickerRef.value.setFormatter(formatter);
});



// 获取当前日期
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();
const confirmedAIDate = ref('') // AI确认后的日期显示

// 当前选中的索引（AI）
const aiDateIndex = ref([currentYear - 1950, currentMonth - 1, currentDay - 1]);

// 日期范围数据（AI）
const aiYears = ref([]);
const aiMonths = ref([]);
const aiDays = ref([]);

onShow(() => {
  initDateData()
  fetchAIInfo()
})
// 初始化日期数据
const initDateData = () => {
  clearAgeInfo()
  // 生成年份数据（1950-当前年份）
  for (let i = 1950; i <= currentYear; i++) {
    aiYears.value.push(i + '年');
  }

  // 生成月份数据
  for (let i = 1; i <= 12; i++) {
    aiMonths.value.push(i + '月');
  }

  updateAIDays();
};

// AI日期选择改变事件
const onAIDateChange = (e) => {
  aiDateIndex.value = e.detail.value;
  // 确认选择后更新显示文字
  confirmedAIDate.value = selectedAIDate.value;
  date.value = selectedAIDate.value
  //selectedAIDate.value 转换成 2025-01-01 格式
  date.value = selectedAIDate.value.replace('年', '-').replace('月', '-').replace('日', '')
  // 计算AI年龄并发送消息
  // const age = calculateAge(confirmedAIDate.value);
  // if (age > 0) {
  //   sendMessage(`AI今年${age}岁`, 'aiAge');
  // }
};

const clearAgeInfo = () => {
  aiYears.value = []
  aiMonths.value = []
  aiDays.value = []
}

// 更新AI天数数据（根据选中的年份和月份）
const updateAIDays = () => {
  const yearIndex = aiDateIndex.value[0];
  const monthIndex = aiDateIndex.value[1];

  const year = 1950 + yearIndex;
  const month = monthIndex + 1;

  // 计算当前月份的天数
  let daysInMonth = new Date(year, month, 0).getDate();

  // 更新天数数组
  aiDays.value = [];
  for (let i = 1; i <= daysInMonth; i++) {
    aiDays.value.push(i + '日');
  }

  // 如果当前选中的日期大于新月份的天数，则调整为最后一天
  if (aiDateIndex.value[2] >= daysInMonth) {
    aiDateIndex.value[2] = daysInMonth - 1;
  }
};

// AI日期范围
const aiDateRange = computed(() => {
  return [aiYears.value, aiMonths.value, aiDays.value];
});

// AI选中的日期显示（临时显示，用于选择器内部）
const selectedAIDate = computed(() => {
  if (aiYears.value.length && aiMonths.value.length && aiDays.value.length) {
    return `${aiYears.value[aiDateIndex.value[0]]}${aiMonths.value[aiDateIndex.value[1]]}${aiDays.value[aiDateIndex.value[2]]}`;
  }
  return '';
});

// AI列改变事件
const onAIColumnChange = (e) => {
  const { column, value } = e.detail;

  // 更新选中的索引
  aiDateIndex.value[column] = value;

  // 如果年份或月份改变，需要更新天数
  if (column === 0 || column === 1) {
    updateAIDays();
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

const formatter = (type, value) => {
  if (type === 'year') {
    return `${value}年`;
  }
  if (type === 'month') {
    return `${value}月`;
  }
  if (type === 'day') {
    return `${value}日`;
  }
  return value;
};
const timeFormat = uni.$u.timeFormat;
const handleConfirm = (e) => {
  calendarShow.value = false;
  console.log(e, dateval.value, timeFormat(dateval.value, 'yyyy-mm-dd'))
  date.value = timeFormat(dateval.value, 'yyyy-mm-dd')
}

const jumpage = () => {
  uni.navigateTo({
    url: '/pages/setting/info'
  })
}

const handleSex = (num) => {
  sexnum.value = num
}

const handleCharacter = (character) => {
  characterType.value = character
}

const resetAIDateDisplay = () => {
  confirmedAIDate.value = ''
  date.value = '点击设置你的出生日期'
}

const applyISODateToPicker = (isoDate) => {
  if (!isoDate || typeof isoDate !== 'string') {
    resetAIDateDisplay()
    return
  }

  const parts = isoDate.split('-')
  if (parts.length !== 3) {
    resetAIDateDisplay()
    return
  }

  const yearNum = Number(parts[0])
  const monthNum = Number(parts[1])
  const dayNum = Number(parts[2])

  if ([yearNum, monthNum, dayNum].some(num => Number.isNaN(num) || num <= 0)) {
    resetAIDateDisplay()
    return
  }

  const yearIndex = Math.min(Math.max(yearNum - 1950, 0), aiYears.value.length - 1)
  const monthIndex = Math.min(Math.max(monthNum - 1, 0), aiMonths.value.length - 1)

  aiDateIndex.value = [yearIndex, monthIndex, aiDateIndex.value[2]]
  updateAIDays()

  const maxDayIndex = aiDays.value.length - 1
  const dayIndex = Math.min(Math.max(dayNum - 1, 0), maxDayIndex)
  aiDateIndex.value = [yearIndex, monthIndex, dayIndex]

  confirmedAIDate.value = `${yearNum}年${monthNum}月${dayNum}日`
  date.value = isoDate
}

const populateAIForm = (info) => {
  if (!info || typeof info !== 'object') {
    return
  }

  if (info.sex_ai !== undefined && info.sex_ai !== null) {
    const sexValue = Number(info.sex_ai)
    if (!Number.isNaN(sexValue)) {
      sexnum.value = sexValue
    }
  }

  if (info.character_ai !== undefined && info.character_ai !== null) {
    const characterValue = Number(info.character_ai)
    if (!Number.isNaN(characterValue)) {
      characterType.value = characterValue
    }
  }

  if (info.age_ai) {
    applyISODateToPicker(info.age_ai)
  } else {
    resetAIDateDisplay()
  }
}

const fetchAIInfo = async () => {
  const userToken = uni.getStorageSync('token')
  const aiToken = uni.getStorageSync('ai_token')
  const authToken = aiToken || userToken

  if (!authToken) {
    return
  }

  try {
    const res = await uni.request({
      url: 'https://www.listentoyouai.com:80/query_data/get_ai_info_api',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (res.statusCode === 200) {
      populateAIForm(res.data)
    } else if (res.statusCode === 404) {
      // 没有配置AI信息，重置表单显示
      sexnum.value = -1
      characterType.value = -1
      resetAIDateDisplay()
    } else if (res.statusCode === 401) {
      console.warn('获取AI信息授权失败')
    } else {
      console.warn('获取AI信息失败', res.statusCode)
    }
  } catch (error) {
    console.error('获取AI信息异常:', error)
  }
}

const handleSubmit = async () => {
  if (sexnum.value === -1) {
    uni.$u.toast('请点击设置AI的性别信息')
    return;
  }
  if (characterType.value === -1) {
    uni.$u.toast('请点击设置AI的性格信息')
    return;
  }
  if (date.value == '点击设置你的出生日期') {
    uni.$u.toast('请点击设置你的出生日期')
    return;
  }
  // if (!aloneChecked.value) {
  //   uni.$u.toast('请勾选用户协议与隐私政策')
  //   return;
  // }
  // const params = {
  // 	usernname: nickname.value,
  // 	img: avtor.value,
  // 	date: date.value,
  // 	sex: sexnum.value,
  // 	character: characterType.value
  // }
  try {
    // 获取微信登录凭证
    const loginRes = await uni.login({ provider: 'weixin' });
    const code = loginRes.code; // 注意：uni.login 返回的是数组 [err, res]

    if (!code) {
      uni.$u.toast('获取微信登录凭证失败');
      return;
    }

    console.log('微信登录 code:', code);

    // 发送注册请求
    const callbackRes = await uni.request({
      url: 'https://www.listentoyouai.com:80/ai/register',
      //url: 'http://127.0.0.1:5001/ai/register',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        code: code,
        character_ai: characterType.value,
        age_ai: date.value,
        sex_ai: sexnum.value
      }
    });

    console.log('提交信息:', callbackRes);

    if (callbackRes.statusCode === 200) {
      const tokenData = callbackRes.data;
      uni.setStorageSync('ai_token', tokenData.access_token);
      await fetchAIInfo();
      uni.$u.toast('保存成功');
      // 页面跳转
      uni.navigateTo({
        url: '/pages/setting/train'
      })
    }
    else if (callbackRes.statusCode === 201) {
      await fetchAIInfo();
      uni.$u.toast('ai信息已保存,请勿重复提交');
      // 页面跳转
      uni.navigateTo({
        url: '/pages/setting/train'
      })
    }
    else {
      uni.$u.toast('保存失败，请重试');
    }
  } catch (error) {
    console.error('请求异常:', error);
    uni.$u.toast('网络异常，请稍后再试');
  }
}
</script>

<style lang="scss" scoped>
.form_wrap {
  padding: 20rpx;
  position: relative;

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

  .sex_container {
    display: flex;
    align-items: center;
    justify-content: center;
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
}

.protocol_item {
  padding-top: 40rpx;

  .protocol {
    display: flex;

    .protocol_text {
      color: #1A5DC5;
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
    margin: 40rpx auto 0 auto;
  }
}

.com_item {
  display: flex;
  align-items: center;
  padding-top: 40rpx;

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

  .avtor {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  &.colum {
    flex-direction: column;
    justify-content: center;
  }

  .sex_item {

    min-width: 240rpx;
    padding: 5rpx;
    height: 80rpx;
    margin-bottom: 20rpx;
    line-height: 80rpx;
    text-align: center;
    color: #fff;
    background-color: skyblue;
    border-radius: 6rpx;

    &.act {
      background-color: pink;
    }
  }


}

.button {
  padding: 40rpx 20rpx;
}

.submit {
  margin: 60rpx 0 0 0;
}
</style>

import App from './App'

import messages from './locale/index'

let i18nConfig = {
  legacy: false,
  locale: uni.getLocale(),
  messages
}

console.log('getLocale',uni.getLocale())

// #ifndef VUE3
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import './uni.promisify.adaptor'

Vue.use(VueI18n)
const i18n = new VueI18n(i18nConfig)
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App,
  i18n,
})


app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia';
import uviewPlus from '@/uni_modules/uview-plus'
import { createI18n } from 'vue-i18n'
const i18n = createI18n(i18nConfig)

export function createApp() {
  const app = createSSRApp(App);
  app.use(i18n);
  app.use(Pinia.createPinia());
  app.use(uviewPlus)
  
  return {
    app,
	Pinia
  }
}
// #endif
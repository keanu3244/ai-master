<template>
	<up-navbar leftIcon="" @rightClick="rightClick" :bgColor="bgColor" v-bind="$attrs">
		<template #left>
			<slot name="left"></slot>
		</template>
		<template #center>
			<view class="title" :style="{color}" v-if="!centerslot">{{title}}</view>
			<slot name="center"></slot>
		</template>
		<template #right v-if="right_icon">
			<image class="iconclose" src="/static/img/home/close.png"></image>
		</template>

	</up-navbar>
</template>

<script setup>
	import {
		useAttrs
	} from 'vue';
	const attr = useAttrs()
	const props = defineProps({
		placeholder: {
			type: Boolean,
			default: true
		},
		right_icon: {
			type: Boolean,
			default: true
		},
		centerslot: {
			type: Boolean,
			default: false
		},
		color: {
			type: String,
			default: '#000'
		},
		title: {
			type: String,
			default: ''
		},
		custom: {
			type: Boolean,
			default: false
		},
		bgColor: {
			type: String,
			default: '#fff'
		}
	})

	const emits = defineEmits(['back'])

	const rightClick = () => {
		if (props.custom) {
			emits('back');
			return
		}
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.title {
		color: $base-color;
	}

	.iconclose {
		position: absolute;
		width: 52rpx;
		height: 52rpx;
		right: 40rpx;

		&::after {
			content: "";
			position: absolute;
			left: -20rpx;
			top: -20rpx;
			bottom: -20rpx;
			right: -20rpx;

		}
	}
</style>
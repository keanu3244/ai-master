<template>
	<view class="picker-wrap">
		<up-picker :show="show" :columns="columns" @cancel="handlecancel" @confirm="handleconfirm"
			@change="handlechange" :keyName="keyName" :defaultIndex="defaultIndex"></up-picker>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	const props = defineProps({
		show: {
			type: Boolean,
			default: false
		},
		columns: {
			type: Array,
		},
		keyName: {
			type: String,
			default: ''
		},
		defaultIndex: {
			type: Array,
			default: [0]
		}
	})

	console.log('picker', props.show)

	const emits = defineEmits(['confirm', 'cancel', 'change'])

	const handleconfirm = (e) => {
		const {
			indexs,
			value
		} = e;
		console.log('confirm', e, indexs[0], value[0]);

		emits('confirm', {
			index: indexs[0],
			value
		})
	}

	const handlecancel = () => {
		emits('cancel')
	}

	const handlechange = (e) => {
		console.log('change', e);
		emits('change')
	}
</script>

<style lang="scss" scoped>

</style>
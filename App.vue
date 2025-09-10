<script>
	export default {
		onLaunch: function(e) {

		},
		onShow: function(res) {


		},
		onHide: function() {
			console.log('App Hide')

		},
		onLoad(options) {
			console.log('app-onLoad..', options)
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "@/uni_modules/uview-plus/index.scss";
	@import "/static/font/iconfont.css";
	@import "/static/css/animate.css";

	page {
		background-color: #fff;
		height: 100vh;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	.flex {
		display: flex;
		align-items: center;
	}

	.flex_center {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.flex_betweent {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.green {
		color: #6ede51;
	}

	.ellipsis {
		white-space: nowrap;
		/* 确保文本在一行内显示 */
		overflow: hidden;
		/* 隐藏溢出的内容 */
		text-overflow: ellipsis;
		/* 使用省略号表示溢出的文本 */
	}

	.content-wrap {
		width: 90%;
		margin: 0 auto;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.confirm {
		width: 90%;
		height: 80rpx;
		margin-left: 50%;
		transform: translateX(-50%);
		margin-top: 40rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		text-align: center;
		color: $base-color;
		background-color: #fff;
		border-radius: 40rpx;
		border: 1rpx solid $bor-color;
	}

	.no-data {
		text-align: center;
	}
</style>
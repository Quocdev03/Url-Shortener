<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Clock, Home, AlertCircle } from "@lucide/vue";

const router = useRouter();

const totalTime = 15;
const countdown = ref(totalTime);
let timer = null;

const goHome = () => {
	router.push("/");
};

onMounted(() => {
	timer = setInterval(() => {
		countdown.value--;
		if (countdown.value <= 0) {
			clearInterval(timer);
			goHome();
		}
	}, 1000);
});

onUnmounted(() => {
	if (timer) clearInterval(timer);
});
</script>

<template>
	<main class="expired-wrapper">
		<div class="expired-card">
			<div class="expired-header-icon">
				<div class="icon-ring-outer animate-pulse">
					<div class="icon-ring-inner">
						<Clock :size="40" class="clock-icon" />
					</div>
				</div>
			</div>

			<h1 class="expired-title">Liên Kết Hết Hạn</h1>

			<p class="expired-subtitle">
				Liên kết này đã hết thời gian hiệu lực hoặc đã bị gỡ bỏ bởi
				người tạo để bảo mật thông tin.
			</p>

			<div class="countdown-container">
				<div class="countdown-progress-bar">
					<div
						class="progress-fill"
						:style="{ width: (countdown / totalTime) * 100 + '%' }"
					></div>
				</div>
				<p class="countdown-text">
					Tự động chuyển hướng về trang chủ sau
					<span class="time-highlight">{{ countdown }}</span> giây...
				</p>
			</div>

			<button class="btn btn-primary btn-block" @click="goHome">
				<Home
					:size="18"
					style="margin-right: 8px; vertical-align: middle"
				/>
				Về trang chủ ngay
			</button>
		</div>
	</main>
</template>

<style scoped>
.expired-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	min-height: calc(100vh - 195px);
	box-sizing: border-box;
	padding: 20px;
}

.expired-card {
	background: var(--bg-card);
	backdrop-filter: var(--glass-blur);
	-webkit-backdrop-filter: var(--glass-blur);
	padding: 50px 40px;
	border-radius: 24px;
	box-shadow: var(--shadow-xl);
	border: 1px solid rgba(255, 255, 255, 0.6);
	width: 100%;
	max-width: 480px;
	text-align: center;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	animation: floatIn 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes floatIn {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.expired-header-icon {
	margin-bottom: 24px;
}

.icon-ring-outer {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: var(--danger-light);
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-ring-inner {
	width: 66px;
	height: 66px;
	border-radius: 50%;
	background: rgba(239, 68, 68, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
}

.clock-icon {
	color: var(--danger);
	animation: spinSlow 12s linear infinite;
}

@keyframes spinSlow {
	100% {
		transform: rotate(360deg);
	}
}

.expired-title {
	font-weight: var(--font-weight-extrabold);
	font-size: var(--font-size-3xl);
	line-height: 38px;
	margin: 0 0 12px 0;
	background: linear-gradient(135deg, #df3333 0%, var(--danger) 50%, #991b1b 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
}

.expired-subtitle {
	color: var(--text-muted);
	font-size: var(--font-size-base);
	line-height: 1.6;
	margin: 0 0 32px 0;
}

.countdown-container {
	width: 100%;
	background: #f8fafc;
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: 18px;
	margin-bottom: 30px;
	box-sizing: border-box;
}

.countdown-progress-bar {
	width: 100%;
	height: 6px;
	background: var(--border-color);
	border-radius: 99px;
	overflow: hidden;
	margin-bottom: 12px;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #fca5a5, var(--danger));
	border-radius: 99px;
	transition: width 1s linear;
}

.countdown-text {
	font-size: 13.5px;
	color: var(--secondary);
	margin: 0;
	font-weight: var(--font-weight-medium);
}

.time-highlight {
	font-weight: var(--font-weight-bold);
	color: var(--danger);
	font-size: 15px;
}
</style>

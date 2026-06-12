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

			<button class="btn-home-premium" @click="goHome">
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
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	padding: 50px 40px;
	border-radius: 24px;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
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
	background: rgba(239, 68, 68, 0.08);
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
	color: #ef4444;
	animation: spinSlow 12s linear infinite;
}

@keyframes spinSlow {
	100% {
		transform: rotate(360deg);
	}
}

.expired-title {
	font-weight: 800;
	font-size: 30px;
	line-height: 38px;
	margin: 0 0 12px 0;
	background: linear-gradient(135deg, #df3333 0%, #dc2626 50%, #991b1b 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
}

.expired-subtitle {
	color: #64748b;
	font-size: 15px;
	line-height: 1.6;
	margin: 0 0 32px 0;
}

.countdown-container {
	width: 100%;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	padding: 18px;
	margin-bottom: 30px;
	box-sizing: border-box;
}

.countdown-progress-bar {
	width: 100%;
	height: 6px;
	background: #e2e8f0;
	border-radius: 99px;
	overflow: hidden;
	margin-bottom: 12px;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #fca5a5, #ef4444);
	border-radius: 99px;
	transition: width 1s linear;
}

.countdown-text {
	font-size: 13.5px;
	color: #475569;
	margin: 0;
	font-weight: 500;
}

.time-highlight {
	font-weight: 700;
	color: #ef4444;
	font-size: 15px;
}

.btn-home-premium {
	width: 100%;
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	color: white;
	border: none;
	padding: 14px 24px;
	border-radius: 14px;
	font-weight: 600;
	font-size: 15px;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-home-premium:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
	background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.btn-home-premium:active {
	transform: translateY(0);
}
</style>

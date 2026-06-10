<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const countdown = ref(5);
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
			<h1 class="expired-title">Link Expired</h1>

			<div class="expired-icon">⏰</div>

			<p class="expired-subtitle">
				Liên kết này đã hết thời gian hiệu lực hoặc đã bị gỡ bỏ bởi
				người tạo.
			</p>

			<div class="countdown-box">
				Tự động quay về trang chủ sau
				<span class="time-highlight">{{ countdown }}</span> giây...
			</div>

			<button class="btn-home" @click="goHome">Về trang chủ ngay</button>
		</div>
	</main>
</template>

<style scoped>
/* Toàn bộ không gian bao bọc */
.expired-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	min-height: 80vh;
	font-family:
		system-ui,
		-apple-system,
		sans-serif;
	max-width: 480px;
	margin: 0 auto;
	box-sizing: border-box;
}

/* Card thông báo đồng bộ với home-main-card */
.expired-card {
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	padding: 40px 36px;
	border-radius: 20px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.5);
	width: 100%;
	text-align: center; /* Căn giữa toàn bộ nội dung thông báo */
	box-sizing: border-box;
}

/* CHỮ GRADIENT NGUYÊN BẢN */
.expired-title {
	font-weight: 800;
	font-size: 35px;
	line-height: 40px;
	margin: 0 0 16px 0;
	background: linear-gradient(135deg, #00c0fa 0%, #1a80e5 50%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
}

.expired-icon {
	font-size: 48px;
	margin-bottom: 16px;
}

.expired-subtitle {
	color: #64748b;
	font-size: 15px;
	line-height: 1.6;
	margin: 0 0 24px 0;
}

/* Khối đếm ngược mượt mà */
.countdown-box {
	font-size: 14px;
	color: #475569;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	padding: 12px 16px;
	border-radius: 10px;
	margin-bottom: 28px; /* Khoảng cách margin chuẩn chỉnh */
}

.time-highlight {
	font-weight: 700;
	color: #4261ed;
	font-size: 16px;
}

/* BUTTON NGUYÊN BẢN */
.btn-home {
	width: 100%;
	background: #4261ed;
	color: white;
	border: none;
	padding: 14px;
	border-radius: 10px;
	font-weight: 600;
	font-size: 16px;
	cursor: pointer;
	transition: background 0.3s ease;
}

.btn-home:hover {
	background: #1a80e5;
}
</style>

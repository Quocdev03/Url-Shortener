<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
	// Validate cơ bản
	if (!email.value || !password.value) {
		errorMessage.value = "Vui lòng nhập đầy đủ email và mật khẩu.";
		return;
	}

	errorMessage.value = "";
	isLoading.value = true;

	try {
		// Gọi API Đăng nhập của bạn ở đây
		// Ví dụ: await authStore.login(email.value, password.value);
		// Sau khi đăng nhập thành công, chuyển hướng về trang chủ
		// router.push('/');
	} catch (error) {
		errorMessage.value =
			error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
	} finally {
		isLoading.value = false;
	}
};
</script>
<template>
	<main class="auth">
		<div class="auth-container">
			<h1 class="auth-title">Đăng Nhập</h1>

			<div class="auth-input">
				<input
					type="email"
					v-model="email"
					placeholder="Nhập địa chỉ email"
					@keyup.enter="handleLogin"
				/>
			</div>

			<div class="auth-input">
				<input
					type="password"
					v-model="password"
					placeholder="Nhập mật khẩu"
					@keyup.enter="handleLogin"
				/>
			</div>

			<p v-if="errorMessage" class="auth-error">⚠️ {{ errorMessage }}</p>

			<button
				class="btn btn-primary auth-btn"
				@click="handleLogin"
				:disabled="isLoading"
			>
				{{ isLoading ? "Đang xử lý..." : "Đăng nhập" }}
			</button>

			<p class="auth-info">
				Chưa có tài khoản?
				<router-link to="/register">Đăng ký ngay</router-link>
			</p>
		</div>
	</main>
</template>

<style scoped>
.auth {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	padding: 20px;
	min-height: 80vh; /* Giúp căn giữa màn hình tốt hơn */
}

.auth-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 16px;
	background: #ffffff;
	padding: 40px;
	border-radius: 16px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
	width: 100%;
	max-width: 450px;
}

.auth-title {
	font-weight: 800;
	font-size: 35px;
	line-height: 40px;
	background: linear-gradient(135deg, #00c0fa 0%, #1a80e5 50%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
	margin-bottom: 12px;
}

.auth-input {
	width: 100%;
}

.auth-input input {
	width: 100%;
	padding: 14px 16px;
	font-size: 15px;
	color: #333;
	border: 2px solid #e2e8f0;
	border-radius: 10px;
	outline: none;
	transition:
		border-color 0.3s ease,
		box-shadow 0.3s ease;
}

.auth-input input:focus {
	border-color: #4261ed;
	box-shadow: 0 0 0 3px rgba(66, 97, 237, 0.15);
}

.auth-input input::placeholder {
	color: #94a3b8;
}

.auth-btn {
	width: 100%;
	padding: 14px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	border: none;
	border-radius: 10px;
	background: #4261ed;
	color: white;
	transition: background 0.3s ease;
	margin-top: 8px;
}

.auth-btn:hover {
	background: #1a80e5;
}

.auth-btn:disabled {
	background: #94a3b8;
	cursor: not-allowed;
}

.auth-error {
	color: #dc2626;
	font-size: 14px;
	align-self: flex-start;
	margin: 0;
}

.auth-info {
	font-size: 14px;
	color: #64748b;
	margin-top: 12px;
	line-height: 20px;
}

.auth-info a {
	color: #4261ed;
	text-decoration: none;
	font-weight: 600;
	transition: color 0.2s ease;
}

.auth-info a:hover {
	color: #1a80e5;
	text-decoration: underline;
}
</style>

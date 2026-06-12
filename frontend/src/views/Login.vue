<script setup>
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";
import { reactive, ref } from "vue";
import { toast } from "vue3-toastify";
import { Eye, EyeOff } from "@lucide/vue";

const authStore = useAuthStore();
const router = useRouter();

const credentials = reactive({ email: "", password: "" });
const showPassword = ref(false);

async function loginHandler() {
	const res = await authStore.login(credentials.email, credentials.password);

	if (!res.success) {
		toast.error(res.message);
		return;
	}
	toast.success("Đăng nhập thành công!");
	// Redirect to home after successful login
	router.push("/");
}
</script>
<template>
	<main class="auth">
		<div class="auth-container">
			<h1 class="auth-title">Đăng Nhập</h1>

			<div class="auth-input">
				<input
					type="email"
					v-model="credentials.email"
					placeholder="Nhập địa chỉ email"
				/>
			</div>

			<div class="auth-input password-input-wrapper">
				<input
					:type="showPassword ? 'text' : 'password'"
					v-model="credentials.password"
					placeholder="Nhập mật khẩu"
					@keyup.enter="loginHandler"
				/>
				<button
					type="button"
					class="password-toggle-btn"
					@click="showPassword = !showPassword"
					title="Ẩn/Hiện mật khẩu"
				>
					<Eye v-if="!showPassword" :size="20" />
					<EyeOff v-else :size="20" />
				</button>
			</div>

			<button
				class="btn btn-primary auth-btn"
				@click="loginHandler()"
				:disabled="authStore.loadingState"
			>
				{{ authStore.loadingState ? "Đang xử lý..." : "Đăng nhập" }}
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
	width: 100%;
	min-height: calc(100vh - 195px); /* viewport min-height minus header height (75px) and page padding block (120px) */
}

.auth-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 16px;
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	padding: 40px;
	border-radius: 16px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.5);
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

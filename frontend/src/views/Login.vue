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
	<main class="auth-layout">
		<div class="auth-layout-container">
			<h1 class="auth-layout-title">Đăng Nhập</h1>

			<div class="auth-layout-input">
				<input
					type="email"
					v-model="credentials.email"
					placeholder="Nhập địa chỉ email"
				/>
			</div>

			<div class="auth-layout-input password-input-wrapper">
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
				class="btn btn-primary btn-block"
				@click="loginHandler()"
				:disabled="authStore.loadingState"
			>
				{{ authStore.loadingState ? "Đang xử lý..." : "Đăng nhập" }}
			</button>

			<p class="auth-layout-info">
				Chưa có tài khoản?
				<router-link to="/register">Đăng ký ngay</router-link>
			</p>
		</div>
	</main>
</template>

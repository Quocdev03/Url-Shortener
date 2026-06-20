<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { toast } from "vue3-toastify";
import { Eye, EyeOff } from "@lucide/vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleRegister = async () => {
	// Validate dữ liệu đầu vào
	if (!email.value || !password.value || !confirmPassword.value) {
		errorMessage.value = "Vui lòng điền đầy đủ tất cả các trường.";
		return;
	}

	if (password.value !== confirmPassword.value) {
		errorMessage.value = "Mật khẩu xác nhận không khớp.";
		return;
	}

	if (password.value.length < 8) {
		errorMessage.value = "Mật khẩu phải có ít nhất 8 ký tự.";
		return;
	}

	errorMessage.value = "";

	const res = await authStore.register(email.value, password.value);

	if (!res.success) {
		errorMessage.value =
			res.message || "Đăng ký thất bại. Vui lòng thử lại.";
		toast.error(errorMessage.value);
		return;
	}

	toast.success("Đăng ký thành công!");
	router.push("/");
};
</script>
<template>
	<main class="auth-layout">
		<div class="auth-layout-container">
			<h1 class="auth-layout-title">Đăng Ký</h1>

			<div class="auth-layout-input">
				<input
					type="email"
					v-model="email"
					placeholder="Nhập địa chỉ email"
					@keyup.enter="handleRegister"
				/>
			</div>

			<div class="auth-layout-input password-input-wrapper">
				<input
					:type="showPassword ? 'text' : 'password'"
					v-model="password"
					placeholder="Nhập mật khẩu"
					@keyup.enter="handleRegister"
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

			<div class="auth-layout-input password-input-wrapper">
				<input
					:type="showConfirmPassword ? 'text' : 'password'"
					v-model="confirmPassword"
					placeholder="Xác nhận lại mật khẩu"
					@keyup.enter="handleRegister"
				/>
				<button
					type="button"
					class="password-toggle-btn"
					@click="showConfirmPassword = !showConfirmPassword"
					title="Ẩn/Hiện mật khẩu"
				>
					<Eye v-if="!showConfirmPassword" :size="20" />
					<EyeOff v-else :size="20" />
				</button>
			</div>

			<p v-if="errorMessage" class="auth-layout-error">⚠️ {{ errorMessage }}</p>

			<button
				class="btn btn-primary btn-block"
				@click="handleRegister"
				:disabled="authStore.loadingState"
			>
				{{
					authStore.loadingState ? "Đang tạo tài khoản..." : "Đăng ký"
				}}
			</button>

			<p class="auth-layout-info">
				Đã có tài khoản?
				<router-link to="/login">Đăng nhập</router-link>
			</p>
		</div>
	</main>
</template>

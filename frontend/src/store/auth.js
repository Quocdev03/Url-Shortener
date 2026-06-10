import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

export const useAuthStore = defineStore("auth", () => {
	const accessToken = ref(localStorage.getItem("access_token") || null);
	const refreshToken = ref(localStorage.getItem("refresh_token") || null);

	let savedUser = null;
	try {
		savedUser = JSON.parse(localStorage.getItem("user") || "null");
	} catch (error) {
		savedUser = null;
	}

	const user = ref(savedUser);
	const userProfile = ref(null);
	const loadingState = ref(false);

	const isAuthenticated = computed(() => {
		return accessToken.value !== null;
	});

	async function login(email, password) {
		loadingState.value = true;

		try {
			const res = await api.post("/v1/auth/login", { email, password });

			if (res.success) {
				const { data } = res;

				accessToken.value = data.accessToken;
				refreshToken.value = data.refreshToken;
				user.value = data.user;

				localStorage.setItem("access_token", data.accessToken);
				localStorage.setItem("refresh_token", data.refreshToken);
				localStorage.setItem("user", JSON.stringify(data.user));
			}
			return res;
		} catch (error) {
			console.error("Login error:", error);
			return {
				success: false,
				message: error,
			};
		} finally {
			loadingState.value = false;
		}
	}

	async function register(email, password) {
		loadingState.value = true;

		try {
			const res = await api.post("/v1/auth/register", { email, password });

			if (res.success) {
				const { data } = res;

				accessToken.value = data.accessToken;
				refreshToken.value = data.refreshToken;
				user.value = data.user;

				localStorage.setItem("access_token", data.accessToken);
				localStorage.setItem("refresh_token", data.refreshToken);
				localStorage.setItem("user", JSON.stringify(data.user));
			}
			return res;
		} catch (error) {
			console.error("Register error:", error);
			return {
				success: false,
				message: error,
			};
		} finally {
			loadingState.value = false;
		}
	}

	async function fetchProfile() {
		loadingState.value = true;
		try {
			const res = await api.get("/v1/auth/profile");
			if (res.success) {
				userProfile.value = res.data;
				return res;
			}
		} catch (error) {
			console.error("Profile error:", error);
			return {
				success: false,
				message: error,
			};
		} finally {
			loadingState.value = false;
		}
	}

	async function changePassword(currentPassword, newPassword) {
		loadingState.value = true;

		try {
			const res = await api.patch("/v1/auth/password", {
				currentPassword,
				newPassword,
			});
			if (res.success) {
				return res;
			}
		} catch (error) {
			console.error("Change password error:", error);
			return {
				success: false,
				message: error,
			};
		} finally {
			loadingState.value = false;
		}
	}

	async function logout() {
		try {
			await api.post("/v1/auth/logout", {
				refreshToken: refreshToken.value,
			});
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			accessToken.value = null;
			refreshToken.value = null;
			user.value = null;
			userProfile.value = null;
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			localStorage.removeItem("user");
		}
	}

	return {
		login,
		register,
		fetchProfile,
		changePassword,
		logout,
		user,
		userProfile,
		loadingState,
		isAuthenticated,
	};
});

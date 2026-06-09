import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api";

export const useUrlStore = defineStore("urls", () => {
	const loadingState = ref(false);
	const urls = ref([]);

	// Merge 2 functions thành 1: isAuth = true → /auth endpoint, false → public
	async function createUrl(data, isAuth = false) {
		loadingState.value = true;

		try {
			const endpoint = isAuth ? "/v1/urls/auth" : "/v1/urls";
			const res = await api.post(endpoint, data);

			// Chỉ add vào store nếu authenticated (public URLs không cần store)
			if (isAuth && res?.data) {
				urls.value.unshift({
					original: res.data.originalUrl,
					short: res.data.shortUrl,
				});
			}

			return res;
		} catch (error) {
			console.error(`Create URL error:`, error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	return { createUrl, loadingState, urls };
});

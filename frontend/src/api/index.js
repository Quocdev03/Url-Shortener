import axios from "axios";
import { useLoadingStore } from "@/store/loading";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("access_token");
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}

	if (config.showLoader !== false) {
		const loadingStore = useLoadingStore();
		loadingStore.startLoading();
	}

	return config;
});

api.interceptors.response.use(
	(response) => {
		if (response.config?.showLoader !== false) {
			const loadingStore = useLoadingStore();
			loadingStore.stopLoading();
		}
		return response.data;
	},
	(error) => {
		if (error.config && error.config.showLoader !== false) {
			const loadingStore = useLoadingStore();
			loadingStore.stopLoading();
		}

		if (error.response) {
			if (error.response.status === 401) {
				// Token expired / unauthorized: xử lý logout nếu cần
				localStorage.removeItem("access_token");
			}
			return Promise.reject(
				error.response.data?.message ||
					error.response.statusText ||
					"Server error",
			);
		}

		if (error.request) {
			return Promise.reject(
				"Không nhận được phản hồi từ server. Vui lòng kiểm tra lại kết nối.",
			);
		}

		return Promise.reject(error.message || "Lỗi khi tạo request.");
	},
);

export default api;

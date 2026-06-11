import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api";

export const useAdminStore = defineStore("admin", () => {
	const loadingState = ref(false);

	const users = ref([]);
	const userTotal = ref(0);
	const userTotalPages = ref(1);

	const urls = ref([]);
	const urlTotal = ref(0);
	const urlTotalPages = ref(1);

	const dropdownUsers = ref([]);

	// Fetch danh sách người dùng
	async function fetchUsers({ page = 1, limit = 10, search = "" }) {
		loadingState.value = true;
		try {
			const res = await api.get(
				`/v1/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
			);
			if (res.success) {
				users.value = res.data;
				userTotal.value = res.meta.total;
				userTotalPages.value = res.meta.totalPages;
			}
			return res;
		} catch (error) {
			console.error("Fetch users error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Tạo người dùng mới
	async function createUser({ email, password, role }) {
		loadingState.value = true;
		try {
			const res = await api.post("/v1/admin/users", { email, password, role });
			return res;
		} catch (error) {
			console.error("Create user error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Cập nhật người dùng
	async function updateUser(id, payload) {
		loadingState.value = true;
		try {
			const res = await api.put(`/v1/admin/users/${id}`, payload);
			return res;
		} catch (error) {
			console.error("Update user error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Xoá người dùng
	async function deleteUser(id) {
		loadingState.value = true;
		try {
			const res = await api.delete(`/v1/admin/users/${id}`);
			return res;
		} catch (error) {
			console.error("Delete user error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Fetch danh sách URLs
	async function fetchUrls({ page = 1, limit = 10, search = "", userId = "" }) {
		loadingState.value = true;
		try {
			let query = `/v1/admin/urls?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
			if (userId) {
				query += `&userId=${userId}`;
			}
			const res = await api.get(query);
			if (res.success) {
				urls.value = res.data;
				urlTotal.value = res.meta.total;
				urlTotalPages.value = res.meta.totalPages;
			}
			return res;
		} catch (error) {
			console.error("Fetch URLs error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Tạo URL mới
	async function createUrl(payload) {
		loadingState.value = true;
		try {
			const res = await api.post("/v1/admin/urls", payload);
			return res;
		} catch (error) {
			console.error("Create URL error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Cập nhật URL
	async function updateUrl(id, payload) {
		loadingState.value = true;
		try {
			const res = await api.patch(`/v1/admin/urls/${id}`, payload);
			return res;
		} catch (error) {
			console.error("Update URL error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Xoá URL
	async function deleteUrl(id) {
		loadingState.value = true;
		try {
			const res = await api.delete(`/v1/admin/urls/${id}`);
			return res;
		} catch (error) {
			console.error("Delete URL error:", error);
			throw error;
		} finally {
			loadingState.value = false;
		}
	}

	// Lấy tất cả user cho dropdown filter/selection
	async function fetchDropdownUsers() {
		try {
			const res = await api.get("/v1/admin/users?limit=1000");
			if (res.success) {
				dropdownUsers.value = res.data;
			}
			return res;
		} catch (error) {
			console.error("Fetch dropdown users error:", error);
			throw error;
		}
	}

	return {
		loadingState,
		users,
		userTotal,
		userTotalPages,
		urls,
		urlTotal,
		urlTotalPages,
		dropdownUsers,
		fetchUsers,
		createUser,
		updateUser,
		deleteUser,
		fetchUrls,
		createUrl,
		updateUrl,
		deleteUrl,
		fetchDropdownUsers,
	};
});

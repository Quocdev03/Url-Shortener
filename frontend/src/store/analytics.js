import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api";

export const useAnalyticsStore = defineStore("analytics", () => {
	const clickLogs = ref([]);
	const totalLogs = ref(0);
	const loading = ref(false);

	const statsLogs = ref([]);
	const statsLoading = ref(false);

	/**
	 * Fetch paginated click logs with query options.
	 * @param {Object} params - Query params (page, limit, search, urlId, sortBy, order)
	 */
	async function fetchAnalytics(params) {
		loading.value = true;
		try {
			const res = await api.get("/v1/analytics", { params });
			if (res.success) {
				clickLogs.value = res.data || [];
				totalLogs.value = res.meta?.total || 0;
				return res;
			}
		} catch (error) {
			console.error("Failed to fetch analytics logs in store:", error);
			throw error;
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Fetch a larger click log sample (up to 150) to build statistics dashboards.
	 * @param {number|string} urlId - Optional ID of the URL to filter
	 */
	async function fetchStatsLogs(urlId) {
		statsLoading.value = true;
		try {
			const params = {
				page: 1,
				limit: 150,
				urlId: urlId || undefined,
			};
			const res = await api.get("/v1/analytics", { params });
			if (res.success) {
				statsLogs.value = res.data || [];
				return res;
			}
		} catch (error) {
			console.error("Failed to fetch stats logs in store:", error);
			throw error;
		} finally {
			statsLoading.value = false;
		}
	}

	return {
		clickLogs,
		totalLogs,
		loading,
		statsLogs,
		statsLoading,
		fetchAnalytics,
		fetchStatsLogs,
	};
});

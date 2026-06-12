import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingStore = defineStore("loading", () => {
	const isLoading = ref(false);
	const requestCount = ref(0);
	let hideTimeout = null;

	const startLoading = () => {
		// Hủy timeout ẩn loader nếu có request mới xen vào
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
		requestCount.value++;
		isLoading.value = true;
	};

	const stopLoading = () => {
		if (requestCount.value > 0) {
			requestCount.value--;
		}

		// Chỉ lập lịch ẩn loader khi tất cả request/tác vụ đã hoàn thành
		if (requestCount.value === 0) {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
			}
			hideTimeout = setTimeout(() => {
				isLoading.value = false;
				hideTimeout = null;
			}, 150); // 150ms để tạo cảm giác chuyển tiếp mượt mà
		}
	};

	const forceStop = () => {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
		requestCount.value = 0;
		isLoading.value = false;
	};

	return {
		isLoading,
		requestCount,
		startLoading,
		stopLoading,
		forceStop,
	};
});

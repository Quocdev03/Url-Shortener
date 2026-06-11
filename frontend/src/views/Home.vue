<script setup>
import { computed, ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import { useUrlStore } from "@/store/url";
import { useAuthStore } from "@/store/auth";

const inputUrl = ref("");
const customAlias = ref("");
const expiresAt = ref("");
const showAdvanced = ref(false); // Toggle tùy chọn nâng cao

const urlStore = useUrlStore();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isAuthenticated);

const guestUrls = ref([]);

onMounted(() => {
	const savedUrls = localStorage.getItem("guest_urls");
	if (savedUrls) {
		try {
			guestUrls.value = JSON.parse(savedUrls);
		} catch (e) {
			console.error("Lỗi parse URLs từ localStorage", e);
		}
	}
});

const deleteGuestUrl = (index) => {
	guestUrls.value.splice(index, 1);
	localStorage.setItem("guest_urls", JSON.stringify(guestUrls.value));
	toast.success("Đã xoá URL khỏi lịch sử local!");
};

// Hàm sao chép nhanh link
const copyToClipboard = async (text) => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Đã sao chép link thành công!");
	} catch (err) {
		toast.error("Không thể sao chép tự động");
	}
};

const lastShortenedUrl = ref(null);

const shortenUrl = async () => {
	if (!inputUrl.value.trim()) return;

	try {
		let res;
		if (isLoggedIn.value) {
			const payload = { originalUrl: inputUrl.value };
			if (customAlias.value.trim())
				payload.customAlias = customAlias.value.trim();

			if (showAdvanced.value) {
				if (!expiresAt.value) {
					toast.error(
						"Vui lòng chọn ngày hết hạn khi sử dụng tùy chọn nâng cao!",
					);
					return;
				}
				payload.expiresAt = new Date(expiresAt.value).toISOString();
			}

			res = await urlStore.createUrl(payload, true);
			if (res?.data) {
				lastShortenedUrl.value = {
					original: res.data.originalUrl,
					short: res.data.shortUrl,
					customAlias: res.data.customAlias,
				};
			}
		} else {
			res = await urlStore.createUrl(
				{ originalUrl: inputUrl.value },
				false,
			);
			if (res?.data) {
				guestUrls.value.unshift(res.data);
				localStorage.setItem(
					"guest_urls",
					JSON.stringify(guestUrls.value),
				);
				lastShortenedUrl.value = {
					original: res.data.originalUrl,
					short: res.data.shortUrl,
					customAlias: null,
				};
			}
		}

		if (res?.data) {
			toast.success("URL đã được tạo thành công!");
		}
		inputUrl.value = "";
		customAlias.value = "";
		expiresAt.value = "";
		showAdvanced.value = false;
	} catch (err) {
		const message =
			typeof err === "string" ? err : err?.message || "Lỗi tạo URL";
		toast.error(message);
		console.error(err);
	}
};
</script>

<template>
	<main class="home-wrapper" :class="{ 'is-logged-in': isLoggedIn }">
		<div class="home-main-card">
			<h1 class="home-title">URL Shortener</h1>
			<p class="home-subtitle">
				Rút gọn liên kết dài của bạn chỉ trong một giây.
			</p>

			<div class="form-group">
				<div class="input-with-button">
					<input
						type="text"
						v-model="inputUrl"
						placeholder="Dán link dài vào đây..."
						required
						@keyup.enter="shortenUrl"
						class="main-input"
					/>
					<button
						class="btn btn-primary"
						@click="shortenUrl"
						:disabled="urlStore.loadingState"
					>
						{{ urlStore.loadingState ? "..." : "Rút gọn" }}
					</button>
				</div>
				<span class="home-example">Ví dụ: https://www.google.com</span>
			</div>

			<div
				v-if="isLoggedIn"
				class="advanced-toggle"
				@click="showAdvanced = !showAdvanced"
			>
				<span>⚡ Tùy chọn nâng cao (Alias, Hết hạn)</span>
			</div>

			<div v-if="isLoggedIn && showAdvanced" class="advanced-fields">
				<div class="field">
					<label>Custom Alias (Tùy chọn tên link)</label>
					<input
						type="text"
						v-model="customAlias"
						placeholder="Ví dụ: my-fb-profile"
					/>
				</div>

				<div class="field">
					<label>Ngày hết hạn (Bắt buộc)</label>
					<input type="datetime-local" v-model="expiresAt" required />
				</div>
			</div>

			<!-- Hộp hiển thị kết quả rút gọn mới tạo -->
			<div
				v-if="lastShortenedUrl"
				class="result-box-wrapper animate-fade-in"
			>
				<div class="result-box-header">
					<h4>🎉 Link rút gọn của bạn:</h4>
					<button
						class="btn-close-result"
						@click="lastShortenedUrl = null"
					>
						✕
					</button>
				</div>
				<div class="result-box-body">
					<div class="result-box-links">
						<a
							:href="lastShortenedUrl.short"
							target="_blank"
							class="result-short-url"
							>{{ lastShortenedUrl.short }}</a
						>
						<span
							class="result-original-url"
							:title="lastShortenedUrl.original"
							>{{ lastShortenedUrl.original }}</span
						>
					</div>
					<button
						class="btn-copy-result"
						@click="copyToClipboard(lastShortenedUrl.short)"
					>
						Sao chép 📋
					</button>
				</div>
			</div>

			<p v-if="!isLoggedIn" class="home-info">
				📌 Link của khách sẽ tạm thời lưu ở trình duyệt này. Hãy
				<router-link to="/login">Đăng nhập</router-link> để đặt biệt
				danh tùy chỉnh và lưu vĩnh viễn.
			</p>
		</div>

		<!-- Chỉ hiện lịch sử cục bộ cho Guest (khách chưa login), vì logged user đã có trang Profile -->
		<div
			class="home-history-panel"
			v-if="!isLoggedIn && guestUrls.length > 0"
		>
			<div class="panel-header">
				<h2>Liên Kết Vừa Rút Gọn</h2>
				<span class="badge">{{ guestUrls.length }} link</span>
			</div>

			<ul class="history-list">
				<li
					v-for="(item, index) in guestUrls"
					:key="'guest-' + index"
					class="history-item"
				>
					<div class="url-details">
						<span
							class="original-url"
							:title="item.originalUrl || item.original"
						>
							{{ item.originalUrl || item.original }}
						</span>
						<a
							:href="item.shortUrl || item.short"
							target="_blank"
							class="short-url"
						>
							{{ item.shortUrl || item.short }}
						</a>
					</div>
					<div class="actions">
						<button
							@click="
								copyToClipboard(item.shortUrl || item.short)
							"
							class="action-btn copy"
							title="Copy"
						>
							📋
						</button>
						<button
							@click="deleteGuestUrl(index)"
							class="action-btn delete"
							title="Xóa"
						>
							🗑️
						</button>
					</div>
				</li>
			</ul>
		</div>
	</main>
</template>

<style scoped>
/* Reset & Layout bọc ngoài */
.home-wrapper {
	padding: 40px 20px;
	min-height: 85vh;
}

/* Styling for new recently shortened result box */
.result-box-wrapper {
	background: rgba(66, 97, 237, 0.05);
	border: 1px solid rgba(66, 97, 237, 0.2);
	border-radius: 12px;
	padding: 16px;
	margin-top: 20px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.result-box-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.result-box-header h4 {
	font-size: 14px;
	font-weight: 700;
	color: #1e293b;
	margin: 0;
}

.btn-close-result {
	background: none;
	border: none;
	color: #94a3b8;
	font-size: 16px;
	cursor: pointer;
	line-height: 1;
	padding: 2px;
}

.btn-close-result:hover {
	color: #64748b;
}

.result-box-body {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.result-box-links {
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
	flex: 1;
}

.result-short-url {
	font-size: 16px;
	font-weight: 700;
	color: #2563eb;
	text-decoration: none;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.result-short-url:hover {
	text-decoration: underline;
}

.result-original-url {
	font-size: 12px;
	color: #94a3b8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.btn-copy-result {
	background: #2563eb;
	color: white;
	border: none;
	padding: 8px 16px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 700;
	cursor: pointer;
	transition:
		background-color 0.2s,
		transform 0.15s;
	white-space: nowrap;
}

.btn-copy-result:hover {
	background: #1d4ed8;
	transform: translateY(-1px);
}

.btn-copy-result:active {
	transform: translateY(0);
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-in {
	animation: fadeIn 0.3s ease forwards;
}

/* Card chính chứa form input */
.home-main-card {
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	padding: 32px;
	border-radius: 20px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.5);
	width: 100%;
}

.home-title {
	display: block;
	font-weight: 800;
	font-size: 35px;
	line-height: 40px;
	background-image: linear-gradient(
		135deg,
		#00b3fa 0%,
		#1a80e5 50%,
		#4261ed 100%
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
	margin-bottom: 12px;
}

.home-subtitle {
	color: #64748b;
	font-size: 14px;
	margin-bottom: 24px;
}

.form-group {
	width: 100%;
	margin-bottom: 20px;
}

.input-with-button {
	display: flex;
	position: relative;
	background: #f8fafc;
	border: 2px solid #e2e8f0;
	border-radius: 12px;
	padding: 4px;
	transition:
		border-color 0.2s,
		box-shadow 0.2s;
}

.input-with-button:focus-within {
	border-color: #2563eb;
	box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.main-input {
	flex: 1;
	border: none;
	background: transparent;
	padding: 12px 14px;
	font-size: 15px;
	outline: none;
	color: #1e293b;
	min-width: 0;
}

.home-example {
	display: block;
	font-size: 12px;
	color: #94a3b8;
	margin-top: 6px;
	padding-left: 4px;
}

/* Nút Toggle tùy chọn nâng cao */
.advanced-toggle {
	padding: 12px;
	background: #f1f5f9;
	border-radius: 8px;
	cursor: pointer;
	font-size: 13px;
	font-weight: 600;
	color: #475569;
	margin-top: 16px;
}

.advanced-toggle:hover {
	background: #e2e8f0;
}

.advanced-fields {
	background: #f8fafc;
	border: 2px solid #e2e8f0;
	border-radius: 12px;
	padding: 16px;
	margin-top: 15px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.advanced-fields .field {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.advanced-fields label {
	font-size: 12px;
	font-weight: 600;
	color: #475569;
}

.advanced-fields input {
	padding: 10px 12px;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	font-size: 14px;
	outline: none;
}

.advanced-fields input:focus {
	border-color: #2563eb;
}

.home-info {
	font-size: 13px;
	color: #475569;
	margin-top: 16px;
	padding: 12px;
	background: #eff6ff;
	border-left: 4px solid #2563eb;
	border-radius: 6px;
	line-height: 1.5;
}

.home-info a {
	color: #2563eb;
	text-decoration: none;
	font-weight: 600;
}

/* Panel quản lý danh sách URL (Được tách rộng rãi) */
.home-history-panel {
	width: 100%;
	flex: 1.3;
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	padding: 24px;
	border-radius: 20px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.5);
	max-height: 500px;
	display: flex;
	flex-direction: column;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #f1f5f9;
	padding-bottom: 14px;
	margin-bottom: 14px;
}

.panel-header h2 {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	margin: 0;
}

.panel-header .badge {
	background: #e0f2fe;
	color: #0369a1;
	font-size: 12px;
	padding: 4px 8px;
	border-radius: 999px;
	font-weight: 600;
}

.history-list {
	list-style: none;
	padding: 0;
	margin: 0;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding-right: 4px;
}

/* Các item trong danh sách */
.history-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #f8fafc;
	padding: 12px 16px;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
	gap: 16px;
}

.history-item:hover {
	background: #f1f5f9;
}

.url-details {
	display: flex;
	flex-direction: column;
	gap: 4px;
	flex: 1;
	min-width: 0;
}

.original-url {
	font-size: 12px;
	color: #94a3b8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.short-url {
	font-weight: 600;
	font-size: 14px;
	color: #2563eb;
	text-decoration: none;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.short-url:hover {
	text-decoration: underline;
}

.alias-tag {
	font-size: 11px;
	background: #fef08a;
	color: #713f12;
	padding: 2px 6px;
	border-radius: 4px;
	font-weight: 500;
	display: inline-block;
	margin-top: 2px;
	width: fit-content;
}

/* Cụm nút hành động */
.actions {
	display: flex;
	gap: 6px;
}

.action-btn {
	background: white;
	border: 1px solid #e2e8f0;
	padding: 6px 10px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 14px;
	transition: all 0.2s;
}

.action-btn:hover {
	transform: translateY(-1px);
}

.action-btn.copy:hover {
	background: #ecfdf5;
	border-color: #10b981;
}

.action-btn.delete:hover {
	background: #fef2f2;
	border-color: #ef4444;
}
</style>

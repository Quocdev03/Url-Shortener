<script setup>
import { computed, ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import { useUrlStore } from "@/store/url";

const inputUrl = ref("");
const customAlias = ref("");
const expiresAt = ref("");
const urlStore = useUrlStore();
const isLoggedIn = computed(() => Boolean(localStorage.getItem("token")));

// Biến lưu trữ list URLs cho public users (từ localStorage)
const guestUrls = ref([]);

// Khôi phục dữ liệu từ localStorage khi vừa load trang
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

// Hàm xoá một URL khỏi danh sách local của khách
const deleteGuestUrl = (index) => {
	guestUrls.value.splice(index, 1);
	localStorage.setItem("guest_urls", JSON.stringify(guestUrls.value));
	toast.success("Đã xoá URL khỏi lịch sử local!");
};

const shortenUrl = async () => {
	if (!inputUrl.value.trim()) return;

	try {
		let res;
		if (isLoggedIn.value) {
			// Authenticated user - support custom alias + expiration
			const payload = {
				originalUrl: inputUrl.value,
			};
			if (customAlias.value.trim()) {
				payload.customAlias = customAlias.value.trim();
			}
			if (expiresAt.value) {
				payload.expiresAt = new Date(expiresAt.value).toISOString();
			}
			res = await urlStore.createUrl(payload, true);
		} else {
			// Public user - only send originalUrl, save to localStorage
			res = await urlStore.createUrl(
				{ originalUrl: inputUrl.value },
				false,
			);

			// Add new URL to guest list and persist to localStorage
			if (res?.data) {
				guestUrls.value.unshift(res.data);
				localStorage.setItem(
					"guest_urls",
					JSON.stringify(guestUrls.value),
				);
			}
		}

		if (res?.data) {
			toast.success("URL đã được tạo thành công!");
		}
		inputUrl.value = "";
		customAlias.value = "";
		expiresAt.value = "";
	} catch (err) {
		const message =
			typeof err === "string" ? err : err?.message || "Lỗi tạo URL";
		toast.error(message);
		console.error(err);
	}
};
</script>

<template>
	<main class="home">
		<div class="home-container">
			<h1 class="home-title">URL Shortener</h1>

			<div class="home-input">
				<input
					type="text"
					v-model="inputUrl"
					placeholder="Enter a long URL to shorten"
					required
					@keyup.enter="shortenUrl"
				/>
			</div>

			<div v-if="isLoggedIn" class="home-input">
				<input
					type="text"
					v-model="customAlias"
					placeholder="Custom alias (optional)"
					class="home-input-secondary"
				/>
			</div>

			<div v-if="isLoggedIn" class="home-input">
				<input
					type="datetime-local"
					v-model="expiresAt"
					placeholder="Expiration date (optional)"
					class="home-input-secondary"
				/>
			</div>

			<span class="home-example">Example: https://www.google.com</span>

			<button
				class="btn btn-primary home-btn"
				@click="shortenUrl"
				:disabled="urlStore.loadingState"
			>
				{{ urlStore.loadingState ? "Đang tạo..." : "Shorten URL" }}
			</button>

			<p v-if="!isLoggedIn" class="home-info">
				📌 Public URLs are temporary and not saved to your account.
				Please
				<router-link to="/login">login</router-link> to save your URLs
				and use custom aliases.
			</p>

			<div
				class="home-history"
				v-if="guestUrls.length > 0 && !isLoggedIn"
			>
				<h2>Your Recent URLs</h2>
				<ul class="history-list">
					<li
						v-for="(item, index) in guestUrls"
						:key="index"
						class="history-item"
					>
						<div class="url-content">
							<div class="url-info">
								<span class="original-url">{{
									item.originalUrl || item.original
								}}</span>
								<a
									:href="item.shortUrl || item.short"
									target="_blank"
									class="short-url"
									>{{ item.shortUrl || item.short }}</a
								>
							</div>
							<button
								class="delete-btn"
								@click="deleteGuestUrl(index)"
								title="Xoá"
							>
								🗑️
							</button>
						</div>
					</li>
				</ul>
			</div>

			<div
				class="home-history"
				v-else-if="isLoggedIn && urlStore.urls.length > 0"
			>
				<h2>Your Shortened URLs</h2>
				<ul class="history-list">
					<li
						v-for="(item, index) in urlStore.urls"
						:key="index"
						class="history-item"
					>
						<div class="url-info">
							<span class="original-url">{{
								item.original
							}}</span>
							<a
								:href="item.short"
								target="_blank"
								class="short-url"
								>{{ item.short }}</a
							>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</main>
</template>

<style scoped>
.home {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	padding: 20px;
	min-height: 80vh;
}

.home-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 12px;
	background: #ffffff;
	padding: 40px;
	border-radius: 16px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
	width: 100%;
	max-width: 450px;
}

.home-title {
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

.home-input {
	width: 100%;
}

.home-input input {
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

.home-input input:focus {
	border-color: #4261ed;
	box-shadow: 0 0 0 3px rgba(66, 97, 237, 0.15);
}

.home-input input::placeholder {
	color: #94a3b8;
}

.home-input-secondary {
	width: 100%;
	padding: 12px 14px;
	font-size: 14px;
	color: #333;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	outline: none;
	transition: border-color 0.3s ease;
	margin-top: 8px;
}

.home-input-secondary:focus {
	border-color: #4261ed;
}

.home-example {
	font-size: 13px;
	color: #64748b;
	align-self: flex-start;
	margin-bottom: 15px;
}

.home-info {
	font-size: 13px;
	color: #64748b;
	margin-top: 12px;
	padding: 10px 12px;
	background: #f0f9ff;
	border-left: 3px solid #4261ed;
	border-radius: 4px;
	margin-bottom: 15px;
	line-height: 20px;
}

.home-info a {
	color: #4261ed;
	text-decoration: none;
	font-weight: 600;
	transition: color 0.2s ease;
}

.home-info a:hover {
	color: #1a80e5;
	text-decoration: underline;
}

.home-btn {
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
}

.home-btn:hover {
	background: #1a80e5;
}

.home-error {
	color: #dc2626;
	font-size: 14px;
	margin-top: 12px;
}

.home-history {
	width: 100%;
	margin-top: 24px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.home-history h2 {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
	text-align: left;
	margin-bottom: 8px;
	border-bottom: 2px solid #f1f5f9;
	padding-bottom: 8px;
}

.history-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-height: 300px;
	overflow-y: auto;
}

.history-item {
	background-color: #f8fafc;
	padding: 12px;
	border-radius: 10px;
	border: 1px solid #e2e8f0;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

/* Các class CSS được thêm mới/thay đổi để layout nút xoá */
.url-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.url-info {
	display: flex;
	flex-direction: column;
	gap: 6px;
	flex: 1;
	min-width: 0; /* Đảm bảo text ellipsis vẫn chạy đúng */
}

.original-url {
	font-size: 13px;
	color: #64748b;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.short-url {
	font-weight: 600;
	font-size: 15px;
	color: #4261ed;
	text-decoration: none;
}

.short-url:hover {
	text-decoration: underline;
}

.delete-btn {
	background: transparent;
	border: none;
	font-size: 16px;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 6px;
	transition:
		background 0.2s ease,
		transform 0.1s ease;
}

.delete-btn:hover {
	background: #fee2e2;
	transform: scale(1.1);
}
</style>

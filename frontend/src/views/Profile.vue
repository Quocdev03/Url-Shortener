<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/store/auth";

const router = useRouter();

const authStore = useAuthStore();

// State cho Form đổi mật khẩu
const oldPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const isUpdating = ref(false);
const pwdMessage = ref("");
const isSuccess = ref(false);

// Computed properties từ store
const profileData = computed(() => ({
	user: authStore.userProfile?.user,
}));
const isLoading = computed(() => authStore.loadingState);

// Gọi API lấy Profile khi component được mount
onMounted(async () => {
	try {
		await authStore.fetchProfile();
	} catch (err) {
		const message = typeof err === "string" ? err : err?.message || "Lỗi tải profile";
		toast.error(message);
		console.error("Error fetching profile:", err);
	}
});

// Xử lý đổi mật khẩu
const handleChangePassword = async () => {
	if (!oldPassword.value || !newPassword.value || !confirmNewPassword.value) {
		isSuccess.value = false;
		pwdMessage.value = "Vui lòng điền đủ các trường mật khẩu.";
		return;
	}

	if (newPassword.value !== confirmNewPassword.value) {
		isSuccess.value = false;
		pwdMessage.value = "Mật khẩu mới không trùng khớp.";
		return;
	}

	if (newPassword.value.length < 8) {
		isSuccess.value = false;
		pwdMessage.value = "Mật khẩu mới phải có ít nhất 8 ký tự.";
		return;
	}

	isUpdating.value = true;
	pwdMessage.value = "";

	try {
		const res = await authStore.changePassword(oldPassword.value, newPassword.value);
		
		if (res.success) {
			isSuccess.value = true;
			pwdMessage.value = "Đổi mật khẩu thành công!";
			toast.success("Đổi mật khẩu thành công!");
			oldPassword.value = "";
			newPassword.value = "";
			confirmNewPassword.value = "";
		} else {
			throw new Error(res.message || "Lỗi đổi mật khẩu");
		}
	} catch (err) {
		isSuccess.value = false;
		const message =
			typeof err === "string"
				? err
				: err?.message || "Có lỗi xảy ra, vui lòng thử lại.";
		pwdMessage.value = message;
		toast.error(message);
	} finally {
		isUpdating.value = false;
	}
};

// Hàm phụ trợ: Format ngày tháng cho gọn đẹp (timezone-safe)
// Backend luôn trả về ISO string UTC (có Z), parse và hiển thị theo giờ VN
const formatDate = (dateStr) => {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "Asia/Ho_Chi_Minh",
	});
};

// Hàm phụ trợ: Copy nhanh link
const copyLink = (text) => {
	navigator.clipboard.writeText(text);
	toast.success("Đã copy đường dẫn!");
};

// Hàm xử lý click vào link đã hết hạn → navigate đến trang Expired
const handleExpiredClick = () => {
	router.push({ name: "Expired" });
};
</script>
<template>
	<main class="profile">
		<div class="profile-grid">
			<div class="profile-sidebar">
				<div class="auth-container">
					<div class="profile-header">
						<div class="profile-avatar">
							{{
								profileData?.user?.email
									?.charAt(0)
									.toUpperCase()
							}}
						</div>
						<h2 class="profile-email">
							{{ profileData?.user?.email }}
						</h2>

						<span
							:class="[
								'role-badge',
								`role-${profileData?.user?.role}`,
							]"
						>
							{{
								profileData?.user?.role === "admin"
									? "⚡ Administrator"
									: "👤 Member"
							}}
						</span>
					</div>

					<hr class="profile-divider" />

					<div class="change-password-form">
						<h3>Đổi mật khẩu</h3>

						<div class="auth-input">
							<input
								type="password"
								v-model="oldPassword"
								placeholder="Mật khẩu hiện tại"
							/>
						</div>
						<div class="auth-input">
							<input
								type="password"
								v-model="newPassword"
								placeholder="Mật khẩu mới"
							/>
						</div>
						<div class="auth-input">
							<input
								type="password"
								v-model="confirmNewPassword"
								placeholder="Xác nhận mật khẩu mới"
							/>
						</div>

						<p
							v-if="pwdMessage"
							:class="[
								'status-msg',
								isSuccess ? 'success-text' : 'error-text',
							]"
						>
							{{ pwdMessage }}
						</p>

						<button
							class="auth-btn btn-primary"
							@click="handleChangePassword"
							:disabled="isUpdating"
						>
							{{
								isUpdating
									? "Đang cập nhật..."
									: "Cập nhật mật khẩu"
							}}
						</button>
					</div>
				</div>
			</div>

			<div class="profile-main">
				<div class="history-container">
					<div class="history-header">
						<h2>Kho Link Của Bạn</h2>
						<span class="url-count"
							>Tổng số:
							<strong>{{
								profileData?.user?.urls?.length || 0
							}}</strong>
							link</span
						>
					</div>

					<div
						v-if="!profileData?.user?.urls?.length"
						class="empty-state"
					>
						📌 Bạn chưa tạo link rút gọn nào.
						<router-link to="/">Tạo ngay!</router-link>
					</div>

					<ul v-else class="history-list">
						<li
							v-for="url in profileData.user.urls"
							:key="url.id"
							:class="[
								'history-item',
								{ expired: url.isExpired },
							]"
						>
							<div class="url-info">
								<span
									class="original-url"
									:title="url.originalUrl"
								>
									Link gốc: {{ url.originalUrl }}
								</span>
								<div class="short-link-group">
									<a
										v-if="!url.isExpired"
										:href="url.shortUrl"
										target="_blank"
										class="short-url"
									>
										{{ url.shortUrl }}
									</a>
									<span
										v-else
										class="short-url disabled-link"
										@click="handleExpiredClick"
										title="Link đã hết hạn - Nhấn để xem chi tiết"
									>
										{{ url.shortUrl }}
									</span>
									<button
										@click="
											copyLink(url.shortUrl)
										"
										class="btn-copy"
										title="Copy link"
									>
										📋
									</button>
								</div>
							</div>
							<div class="url-meta">
								<span class="meta-date"
									>🕒 {{ formatDate(url.createdAt) }}</span
								>
								<span
									v-if="url.expiresAt"
									:class="[
										'meta-expire',
										{ 'expired-badge': url.isExpired },
									]"
								>
									⏳ Hết hạn: {{ formatDate(url.expiresAt) }}
									<span
										v-if="url.isExpired"
										class="expired-tag"
										>❌ ĐÃ HẾT HẠN</span
									>
								</span>
								<span class="meta-clicks">
									👆 {{ url.clicks || 0 }} lượt nhấn
								</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</main>
</template>

<style scoped>
.profile {
	padding: 40px 20px;
	max-width: 1100px;
	margin: 0 auto;
	min-height: 85vh;
}

.profile-grid {
	display: flex;
	gap: 30px;
	width: 100%;
	align-items: flex-start;
}

/* Cột thông tin tài khoản */
.profile-sidebar {
	flex: 1;
	min-width: 320px;
}

.auth-container {
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	padding: 30px;
	border-radius: 16px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.5);
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.profile-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.profile-avatar {
	width: 64px;
	height: 64px;
	background: linear-gradient(135deg, #00c0fa 0%, #4261ed 100%);
	color: white;
	font-size: 24px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
}

.profile-email {
	font-size: 18px;
	color: #1e293b;
	font-weight: 600;
	margin: 0;
	word-break: break-all;
}

/* Thẻ hiển thị quyền (Role Badge) */
.role-badge {
	padding: 4px 12px;
	font-size: 12px;
	font-weight: 600;
	border-radius: 20px;
}
.role-user {
	background: #f0f9ff;
	color: #4261ed;
	border: 1px solid rgba(66, 97, 237, 0.2);
}
.role-admin {
	background: #fef2f2;
	color: #dc2626;
	border: 1px solid rgba(220, 38, 38, 0.2);
}

.profile-divider {
	border: 0;
	border-top: 1px solid #e2e8f0;
	margin: 0;
}

.change-password-form h3 {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
	margin: 0 0 14px 0;
}

.auth-input {
	width: 100%;
	margin-bottom: 12px;
}

.auth-input input {
	width: 100%;
	padding: 12px 14px;
	font-size: 14px;
	color: #333;
	border: 2px solid #e2e8f0;
	border-radius: 10px;
	outline: none;
	transition: all 0.3s ease;
}

.auth-input input:focus {
	border-color: #4261ed;
	box-shadow: 0 0 0 3px rgba(66, 97, 237, 0.15);
}

.auth-btn {
	width: 100%;
	padding: 12px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	border: none;
	border-radius: 10px;
	background: #4261ed;
	color: white;
	transition: background 0.3s ease;
}

.auth-btn:hover {
	background: #1a80e5;
}

/* Cột quản trị Danh sách URL */
.profile-main {
	flex: 2;
}

.history-container {
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	padding: 30px;
	border-radius: 16px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.5);
}

.history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 2px solid #f1f5f9;
	padding-bottom: 14px;
	margin-bottom: 16px;
}

.history-header h2 {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
	margin: 0;
}

.url-count {
	font-size: 13px;
	color: #64748b;
}

.history-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 14px;
	max-height: 520px;
	overflow-y: auto;
}

.history-item {
	background-color: #f8fafc;
	padding: 16px;
	border-radius: 10px;
	border: 1px solid #e2e8f0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.url-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.original-url {
	font-size: 13px;
	color: #64748b;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.short-link-group {
	display: flex;
	align-items: center;
	gap: 10px;
}

.short-url {
	font-weight: 600;
	font-size: 16px;
	color: #4261ed;
	text-decoration: none;
}

.short-url:hover {
	text-decoration: underline;
}

.btn-copy {
	background: none;
	border: none;
	cursor: pointer;
	font-size: 14px;
	padding: 2px;
	opacity: 0.7;
	transition: opacity 0.2s;
}

.btn-copy:hover {
	opacity: 1;
}

.url-meta {
	display: flex;
	gap: 16px;
	font-size: 12px;
	color: #94a3b8;
}

.status-msg {
	font-size: 13px;
	margin: 0 0 10px 0;
}
.error-text {
	color: #dc2626;
}
.success-text {
	color: #16a34a;
}

.empty-state {
	text-align: center;
	padding: 40px 0;
	color: #64748b;
}
.empty-state a {
	color: #4261ed;
	text-decoration: none;
	font-weight: 600;
}

/* Expired link styles */
.history-item.expired {
	background-color: #fef2f2;
	border-color: #fecaca;
	opacity: 0.8;
}

.short-url.disabled-link {
	color: #dc2626;
	cursor: pointer;
	opacity: 0.6;
	text-decoration: line-through;
}

.short-url.disabled-link:hover {
	text-decoration: line-through;
}

.meta-expire.expired-badge {
	color: #dc2626;
	font-weight: 600;
}

.expired-tag {
	display: inline-block;
	margin-left: 6px;
	padding: 2px 6px;
	background: #dc2626;
	color: white;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 700;
}

.meta-clicks {
	color: #16a34a;
	font-weight: 500;
}

/* Mobile responsive */
@media (max-width: 768px) {
	.profile-grid {
		flex-direction: column;
	}
	.profile-sidebar,
	.profile-main {
		width: 100%;
	}
}
</style>

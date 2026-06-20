<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/store/auth";
import api from "@/api";
import {
	User,
	ShieldCheck,
	Clock,
	BarChart3,
	Copy,
	Trash2,
	XCircle,
	Eye,
	EyeOff,
	Link2,
	AlertCircle,
	TimerOff,
	Settings,
	LogOut
} from "@lucide/vue";

const router = useRouter();

const authStore = useAuthStore();

const handleLogout = async () => {
	await authStore.logout();
	toast.success("Đăng xuất thành công!");
	router.push("/");
};

// Trạng thái tab hiện tại
const activeTab = ref("urls"); // "urls" | "settings"

// State cho Form đổi mật khẩu
const oldPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const isUpdating = ref(false);
const pwdMessage = ref("");
const isSuccess = ref(false);

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmNewPassword = ref(false);

// Computed properties từ store
const profileData = computed(() => ({
	user: authStore.userProfile?.user,
}));
const isLoading = computed(() => authStore.loadingState);

// Gọi API lấy Profile ngay khi component được khởi tạo
const loadProfileData = async () => {
	try {
		await authStore.fetchProfile();
	} catch (err) {
		const message = typeof err === "string" ? err : err?.message || "Lỗi tải profile";
		toast.error(message);
		console.error("Error fetching profile:", err);
	}
};
loadProfileData();

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

// Format ngày tháng (timezone-safe)
const formatDate = (dateStr) => {
	if (!dateStr) return "";
	
	let normalizedStr = dateStr;
	if (typeof dateStr === "string" && !dateStr.includes("T")) {
		normalizedStr = dateStr.replace(" ", "T");
		if (!normalizedStr.endsWith("Z") && !normalizedStr.includes("+")) {
			normalizedStr += "Z";
		}
	}
	
	const d = new Date(normalizedStr);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "Asia/Ho_Chi_Minh",
	});
};

// Copy nhanh link
const copyLink = (text) => {
	navigator.clipboard.writeText(text);
	toast.success("Đã copy đường dẫn!");
};

// Điều hướng hết hạn
const handleExpiredClick = () => {
	router.push({ name: "Expired" });
};

// Xoá Link State
const showDeleteModal = ref(false);
const urlToDelete = ref(null);
const isDeleting = ref(false);

const confirmDelete = (url) => {
	urlToDelete.value = url;
	showDeleteModal.value = true;
};

const handleDeleteUrl = async () => {
	if (!urlToDelete.value) return;

	isDeleting.value = true;
	try {
		const res = await api.delete(`/v1/urls/${urlToDelete.value.id}`);
		if (res.success) {
			toast.success("Xoá liên kết thành công!");
			await authStore.fetchProfile();
		} else {
			throw new Error(res.message || "Lỗi khi xoá liên kết");
		}
	} catch (err) {
		const message = typeof err === "string" ? err : err?.message || "Có lỗi xảy ra khi xoá liên kết.";
		toast.error(message);
		console.error("Error deleting URL:", err);
	} finally {
		isDeleting.value = false;
		showDeleteModal.value = false;
		urlToDelete.value = null;
	}
};
</script>
<template>
	<main class="profile-page">
		<div class="profile-layout glass-card">
			<!-- Menu Sidebar bên trái -->
			<aside class="profile-sidebar">
				<div class="user-info-section">
					<div class="profile-avatar">
						{{
							profileData?.user?.email
								?.charAt(0)
								.toUpperCase()
						}}
					</div>
					<h2 class="profile-email" :title="profileData?.user?.email">
						{{ profileData?.user?.email }}
					</h2>
					<span
						:class="[
							'role-badge',
							`role-${profileData?.user?.role}`,
						]"
					>
						<template v-if="profileData?.user?.role === 'admin'">
							<ShieldCheck :size="14" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Administrator
						</template>
						<template v-else>
							<User :size="14" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Member
						</template>
					</span>
				</div>

				<div class="sidebar-divider"></div>

				<nav class="profile-menu">
					<button
						:class="['menu-item', { active: activeTab === 'urls' }]"
						@click="activeTab = 'urls'"
					>
						<Link2 :size="18" />
						<span>Kho link của bạn</span>
					</button>
					<button
						:class="['menu-item', { active: activeTab === 'settings' }]"
						@click="activeTab = 'settings'"
					>
						<Settings :size="18" />
						<span>Cài đặt tài khoản</span>
					</button>
					<div class="profile-menu-divider"></div>
					<button
						class="menu-item logout-btn"
						@click="handleLogout"
					>
						<LogOut :size="18" />
						<span>Đăng xuất</span>
					</button>
				</nav>
			</aside>

			<!-- Vùng hiển thị nội dung bên phải -->
			<section class="profile-content">
				<!-- TAB 1: KHO LINK -->
				<Transition name="fade-slide" mode="out-in">
					<div v-if="activeTab === 'urls'" class="tab-panel" key="urls">
						<div class="panel-header">
							<h2>Kho Link Của Bạn</h2>
							<span class="url-count">
								Tổng số: <strong>{{ profileData?.user?.urls?.length || 0 }}</strong> link
							</span>
						</div>

						<div v-if="!profileData?.user?.urls?.length" class="empty-state">
							<Link2 :size="32" class="empty-icon" />
							<p>Bạn chưa tạo link rút gọn nào.</p>
							<router-link to="/shorten" class="btn btn-primary btn-sm">Tạo ngay!</router-link>
						</div>

						<ul v-else class="history-list">
							<li
								v-for="url in profileData.user.urls"
								:key="url.id"
								:class="['history-item', { expired: url.isExpired }]"
							>
								<div class="url-info">
									<span class="original-url" :title="url.originalUrl">
										Link gốc: {{ url.originalUrl }}
									</span>
									<div class="short-link-group">
										<a v-if="!url.isExpired" :href="url.shortUrl" target="_blank" class="short-url">
											{{ url.shortUrl }}
										</a>
										<span v-else class="short-url disabled-link" @click="handleExpiredClick" title="Link đã hết hạn - Nhấn để xem chi tiết">
											{{ url.shortUrl }}
										</span>
										<button @click="copyLink(url.shortUrl)" class="btn-icon-action" title="Copy link">
											<Copy :size="15" />
										</button>
										<button @click="confirmDelete(url)" class="btn-icon-action btn-icon-delete" title="Xoá liên kết">
											<Trash2 :size="15" />
										</button>
									</div>
								</div>
								<div class="url-meta">
									<span class="meta-item">
										<Clock :size="12" />
										{{ formatDate(url.createdAt) }}
									</span>
									<span v-if="url.expiresAt" :class="['meta-item', 'meta-expire', { 'expired-badge': url.isExpired }]">
										<TimerOff :size="12" />
										Hết hạn: {{ formatDate(url.expiresAt) }}
										<span v-if="url.isExpired" class="expired-tag">
											<XCircle :size="10" /> ĐÃ HẾT HẠN
										</span>
									</span>
									<router-link :to="`/analytics/${url.id}`" class="meta-item meta-clicks clickable" title="Xem thống kê chi tiết">
										<BarChart3 :size="12" />
										{{ url.clicks || 0 }} lượt nhấn
									</router-link>
								</div>
							</li>
						</ul>
					</div>

					<!-- TAB 2: CÀI ĐẶT TÀI KHOẢN -->
					<div v-else-if="activeTab === 'settings'" class="tab-panel" key="settings">
						<div class="panel-header">
							<h2>Cài Đặt Tài Khoản</h2>
						</div>

						<div class="settings-form-wrapper">
							<div class="account-card glass-card">
								<div class="account-field">
									<span class="field-label">Địa chỉ Email:</span>
									<span class="field-value">{{ profileData?.user?.email }}</span>
								</div>
								<div class="account-field">
									<span class="field-label">Quyền truy cập:</span>
									<span :class="['role-badge', `role-${profileData?.user?.role}`]">
										{{ profileData?.user?.role === 'admin' ? 'Admin' : 'Member' }}
									</span>
								</div>
							</div>

							<div class="change-password-form">
								<h3>Đổi Mật Khẩu</h3>
								
								<div class="form-group">
									<label>Mật khẩu hiện tại</label>
									<div class="auth-layout-input password-input-wrapper">
										<input
											:type="showOldPassword ? 'text' : 'password'"
											v-model="oldPassword"
											placeholder="Mật khẩu hiện tại"
										/>
										<button
											type="button"
											class="password-toggle-btn"
											@click="showOldPassword = !showOldPassword"
											title="Ẩn/Hiện mật khẩu"
										>
											<Eye v-if="!showOldPassword" :size="18" />
											<EyeOff v-else :size="18" />
										</button>
									</div>
								</div>

								<div class="form-group">
									<label>Mật khẩu mới</label>
									<div class="auth-layout-input password-input-wrapper">
										<input
											:type="showNewPassword ? 'text' : 'password'"
											v-model="newPassword"
											placeholder="Mật khẩu mới"
										/>
										<button
											type="button"
											class="password-toggle-btn"
											@click="showNewPassword = !showNewPassword"
											title="Ẩn/Hiện mật khẩu"
										>
											<Eye v-if="!showNewPassword" :size="18" />
											<EyeOff v-else :size="18" />
										</button>
									</div>
								</div>

								<div class="form-group">
									<label>Xác nhận mật khẩu mới</label>
									<div class="auth-layout-input password-input-wrapper">
										<input
											:type="showConfirmNewPassword ? 'text' : 'password'"
											v-model="confirmNewPassword"
											placeholder="Xác nhận mật khẩu mới"
										/>
										<button
											type="button"
											class="password-toggle-btn"
											@click="showConfirmNewPassword = !showConfirmNewPassword"
											title="Ẩn/Hiện mật khẩu"
										>
											<Eye v-if="!showConfirmNewPassword" :size="18" />
											<EyeOff v-else :size="18" />
										</button>
									</div>
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
									class="btn btn-primary btn-block"
									@click="handleChangePassword"
									:disabled="isUpdating"
								>
									{{ isUpdating ? "Đang cập nhật..." : "Cập nhật mật khẩu" }}
								</button>
							</div>
						</div>
					</div>
				</Transition>
			</section>
		</div>

		<!-- Modal xác nhận xoá link -->
		<div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
			<div class="delete-modal-card glass-card">
				<div class="delete-modal-header">
					<h3>
						<AlertCircle :size="20" style="display: inline-block; vertical-align: middle; margin-right: 6px; color: var(--danger);" />
						Xác nhận xoá liên kết
					</h3>
					<button class="btn-close-modal" @click="showDeleteModal = false">&times;</button>
				</div>
				<div class="delete-modal-body">
					<p>Bạn có chắc chắn muốn xoá liên kết này không? Hành động này sẽ xoá vĩnh viễn liên kết rút gọn cùng toàn bộ thống kê lượt nhấn và không thể hoàn tác.</p>
					<div class="url-preview-box" v-if="urlToDelete">
						<div class="preview-row">
							<strong>Link gốc:</strong>
							<span class="preview-text" :title="urlToDelete.originalUrl">{{ urlToDelete.originalUrl }}</span>
						</div>
						<div class="preview-row">
							<strong>Link rút gọn:</strong>
							<span class="preview-text highlight">{{ urlToDelete.shortUrl }}</span>
						</div>
					</div>
				</div>
				<div class="delete-modal-footer">
					<button class="btn btn-outline" @click="showDeleteModal = false" :disabled="isDeleting">
						Huỷ
					</button>
					<button class="btn btn-danger" @click="handleDeleteUrl" :disabled="isDeleting">
						{{ isDeleting ? "Đang xoá..." : "Xác nhận xoá" }}
					</button>
				</div>
			</div>
		</div>
	</main>
</template>

<style scoped>
.profile-page {
	width: 100%;
}

.profile-layout {
	display: flex;
	gap: 0;
	width: 100%;
	min-height: 580px;
	overflow: hidden;
	padding: 0 !important;
}

/* Cột thông tin & Menu Sidebar bên trái */
.profile-sidebar {
	width: 280px;
	background: rgba(248, 250, 252, 0.4);
	border-right: 1px solid var(--border-color);
	padding: 40px 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
	flex-shrink: 0;
}

.user-info-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	text-align: center;
	width: 100%;
}

.profile-avatar {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: var(--primary-gradient);
	color: white;
	font-size: 32px;
	font-weight: var(--font-weight-extrabold);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
	border: 3px solid white;
}

.profile-email {
	font-size: 16px;
	color: var(--text-main);
	font-weight: var(--font-weight-semibold);
	word-break: break-all;
	margin: 0;
}

/* Thẻ hiển thị quyền (Role Badge) */
.role-badge {
	padding: 4px 12px;
	font-size: 11px;
	font-weight: var(--font-weight-bold);
	border-radius: 20px;
	display: inline-block;
}
.role-badge.role-user {
	background: var(--primary-light);
	color: var(--primary);
	border: 1px solid rgba(37, 99, 235, 0.15);
}
.role-badge.role-admin {
	background: var(--danger-light);
	color: var(--danger);
	border: 1px solid rgba(239, 68, 68, 0.15);
}

.sidebar-divider {
	height: 1px;
	background: var(--border-color);
	width: 100%;
	margin: 24px 0;
}

.profile-menu {
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 100%;
	flex-grow: 1;
}

.menu-item {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	padding: 12px 16px;
	border-radius: 10px;
	border: none;
	background: transparent;
	color: var(--text-muted);
	font-weight: var(--font-weight-semibold);
	cursor: pointer;
	text-align: left;
	transition: all 0.2s ease;
}

.menu-item:hover {
	background: rgba(15, 23, 42, 0.04);
	color: var(--text-main);
}

.menu-item.active {
	background: var(--primary-light);
	color: var(--primary);
}

.profile-menu-divider {
	height: 1px;
	background: var(--border-color);
	width: 100%;
	margin: 16px 0;
	margin-top: auto;
}

.menu-item.logout-btn {
	color: var(--danger);
}

.menu-item.logout-btn:hover {
	background: var(--danger-light);
	color: var(--danger);
}

/* Vùng hiển thị nội dung bên phải */
.profile-content {
	flex: 1;
	padding: 40px;
	min-width: 0;
}

.tab-panel {
	width: 100%;
	height: 100%;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 2px solid var(--border-color);
	padding-bottom: 16px;
	margin-bottom: 24px;
}

.panel-header h2 {
	font-size: 20px;
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	margin: 0;
}

.url-count {
	font-size: 13px;
	color: var(--text-muted);
}

.empty-state {
	text-align: center;
	padding: 60px 20px;
	color: var(--text-muted);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.empty-icon {
	color: var(--text-disabled);
	margin-bottom: 8px;
}

.empty-state p {
	margin: 0 0 8px 0;
}

.settings-form-wrapper {
	display: flex;
	flex-direction: column;
	gap: 30px;
}

.account-card {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 20px !important;
}

.account-field {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
}

.field-label {
	font-weight: var(--font-weight-semibold);
	color: var(--text-muted);
	font-size: 14px;
}

.field-value {
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	font-size: 14px;
	word-break: break-all;
}

.change-password-form h3 {
	font-size: 16px;
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	margin-bottom: 20px;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-bottom: 16px;
}

.form-group label {
	font-size: 13px;
	font-weight: var(--font-weight-semibold);
	color: var(--secondary);
}

/* Kho Link list */
.history-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 16px;
	max-height: 480px;
	overflow-y: auto;
	padding-right: 4px;
}

.history-item {
	background-color: #f8fafc;
	padding: 16px 20px;
	border-radius: 12px;
	border: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	gap: 10px;
	transition: all 0.2s ease;
}

.history-item:hover {
	border-color: var(--text-disabled);
	background-color: #f1f5f9;
}

.url-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.original-url {
	font-size: 13px;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.short-link-group {
	display: flex;
	align-items: center;
	gap: 12px;
}

.short-url {
	font-weight: var(--font-weight-bold);
	font-size: 15px;
	color: var(--primary);
	text-decoration: none;
}

.short-url:hover {
	text-decoration: underline;
}

.short-url.disabled-link {
	color: var(--danger);
	opacity: 0.6;
	text-decoration: line-through;
	cursor: pointer;
}

.btn-icon-action {
	background: none;
	border: none;
	cursor: pointer;
	color: var(--text-muted);
	padding: 4px;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.btn-icon-action:hover {
	color: var(--primary);
	background: var(--primary-light);
}

.btn-icon-action.btn-icon-delete:hover {
	color: var(--danger);
	background: var(--danger-light);
}

.url-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	font-size: 12px;
	color: var(--text-disabled);
	align-items: center;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 4px;
}

.meta-clicks {
	color: var(--success);
	font-weight: var(--font-weight-semibold);
	text-decoration: none;
	padding: 2px 8px;
	border-radius: 6px;
	transition: all 0.2s;
}

.meta-clicks:hover {
	background: var(--success-light);
	text-decoration: underline;
}

.meta-expire.expired-badge {
	color: var(--danger);
	font-weight: var(--font-weight-semibold);
}

.expired-tag {
	background: var(--danger);
	color: white;
	font-size: 9px;
	font-weight: var(--font-weight-bold);
	padding: 1px 6px;
	border-radius: 4px;
	display: inline-flex;
	align-items: center;
	gap: 2px;
}

.status-msg {
	font-size: 13px;
	margin-bottom: 12px;
}
.error-text {
	color: var(--danger);
}
.success-text {
	color: var(--success);
}

/* Expired link card background override */
.history-item.expired {
	background-color: var(--danger-light);
	border-color: #fecaca;
}

/* Modal Overlay & Card (giữ nguyên) */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(15, 23, 42, 0.4);
	backdrop-filter: var(--glass-blur);
	-webkit-backdrop-filter: var(--glass-blur);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: fadeIn 0.25s ease-out;
}

.delete-modal-card {
	width: 90%;
	max-width: 500px;
	overflow: hidden;
	animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.delete-modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px 24px;
	border-bottom: 1px solid var(--border-color);
}

.delete-modal-header h3 {
	margin: 0;
	font-size: 18px;
	color: var(--text-main);
	font-weight: var(--font-weight-bold);
}

.btn-close-modal {
	background: none;
	border: none;
	font-size: 24px;
	color: var(--text-muted);
	cursor: pointer;
	transition: color 0.2s;
	line-height: 1;
}

.btn-close-modal:hover {
	color: var(--text-main);
}

.delete-modal-body {
	padding: 20px 24px;
	color: var(--secondary);
	font-size: 14px;
	line-height: 1.6;
}

.url-preview-box {
	background: rgba(241, 245, 249, 0.6);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 14px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.preview-row {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.preview-row strong {
	font-size: 11px;
	text-transform: uppercase;
	color: var(--text-disabled);
}

.preview-text {
	font-size: 13px;
	color: var(--text-main);
	word-break: break-all;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.preview-text.highlight {
	color: var(--primary);
	font-weight: var(--font-weight-semibold);
}

.delete-modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 16px 24px 24px;
	border-top: 1px solid var(--border-color);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.25s ease;
}

.fade-slide-enter-from {
	opacity: 0;
	transform: translateX(15px);
}

.fade-slide-leave-to {
	opacity: 0;
	transform: translateX(-15px);
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes scaleUp {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
	.profile-layout {
		flex-direction: column;
		min-height: auto;
	}
	.profile-sidebar {
		width: 100%;
		border-right: none;
		border-bottom: 1px solid var(--border-color);
		padding: 24px;
	}
	.sidebar-divider {
		margin: 16px 0;
	}
	.profile-menu {
		flex-direction: row;
		justify-content: center;
		gap: 12px;
	}
	.menu-item {
		width: auto;
		justify-content: center;
		padding: 10px 20px;
	}
	.profile-menu-divider {
		display: none;
	}
	.menu-item.logout-btn {
		margin-top: 0 !important;
	}
	.profile-content {
		padding: 24px;
	}
}

@media (max-width: 480px) {
	.profile-menu {
		flex-direction: column;
		width: 100%;
		gap: 6px;
	}
	.menu-item {
		width: 100%;
		padding: 12px 16px;
	}
}
</style>

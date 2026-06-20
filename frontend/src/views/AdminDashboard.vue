<script setup>
import { ref, watch } from "vue";
import { useAuthStore } from "@/store/auth";
import { useAdminStore } from "@/store/admin";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import {
	Users,
	Link2,
	Search,
	Plus,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Eye,
	EyeOff,
	AlertTriangle,
	X
} from "@lucide/vue";

const authStore = useAuthStore();
const adminStore = useAdminStore();
const router = useRouter();

// Trạng thái tab hiện tại
const activeTab = ref("users"); // "users" | "urls"

// ==========================================
// TRẠNG THÁI PHÂN TRANG / TÌM KIẾM (Local UI state)
// ==========================================
const userPage = ref(1);
const userSearch = ref("");

const urlPage = ref(1);
const urlSearch = ref("");
const urlFilterUserId = ref("");

// ==========================================
// MODAL VÀ FORM STATE
// ==========================================
const showUserModal = ref(false);
const isUserEditMode = ref(false);
const userForm = ref({
	id: null,
	email: "",
	password: "",
	confirmPassword: "",
	role: "user",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const showUrlModal = ref(false);
const isUrlEditMode = ref(false);
const urlForm = ref({
	id: null,
	userId: "",
	originalUrl: "",
	customAlias: "",
	expiresAt: "",
});

const showDeleteConfirmModal = ref(false);
const deleteTarget = ref({
	type: "", // "user" | "url"
	id: null,
	name: "",
});

const isSubmitting = ref(false);

// ==========================================
// FETCH DỮ LIỆU QUA STORE
// ==========================================

const fetchUsers = async () => {
	try {
		await adminStore.fetchUsers({
			page: userPage.value,
			limit: 10,
			search: userSearch.value,
		});
	} catch (error) {
		toast.error(
			typeof error === "string"
				? error
				: "Không thể tải danh sách người dùng.",
		);
	}
};

const fetchUrls = async () => {
	try {
		await adminStore.fetchUrls({
			page: urlPage.value,
			limit: 10,
			search: urlSearch.value,
			userId: urlFilterUserId.value,
		});
	} catch (error) {
		toast.error(
			typeof error === "string" ? error : "Không thể tải danh sách URLs.",
		);
	}
};

const fetchDropdownUsers = async () => {
	try {
		await adminStore.fetchDropdownUsers();
	} catch (error) {
		console.error("Error fetching dropdown users:", error);
	}
};

// ==========================================
// WATCHERS
// ==========================================

watch(userSearch, () => {
	userPage.value = 1;
	fetchUsers();
});

watch(urlSearch, () => {
	urlPage.value = 1;
	fetchUrls();
});

watch(urlFilterUserId, () => {
	urlPage.value = 1;
	fetchUrls();
});

watch(activeTab, (newTab) => {
	if (newTab === "users") {
		fetchUsers();
	} else {
		fetchUrls();
		fetchDropdownUsers();
	}
});

const checkAdminAndLoad = () => {
	if (authStore.user?.role !== "admin") {
		toast.error("Bạn không có quyền truy cập trang này!");
		router.push("/");
		return;
	}
	fetchUsers();
	fetchDropdownUsers();
};
checkAdminAndLoad();

// ==========================================
// HÀNH ĐỘNG - USERS
// ==========================================
const openCreateUserModal = () => {
	isUserEditMode.value = false;
	userForm.value = { id: null, email: "", password: "", confirmPassword: "", role: "user" };
	showPassword.value = false;
	showConfirmPassword.value = false;
	showUserModal.value = true;
};

const openEditUserModal = (user) => {
	isUserEditMode.value = true;
	userForm.value = {
		id: user.id,
		email: user.email,
		password: "",
		confirmPassword: "",
		role: user.role,
	};
	showPassword.value = false;
	showConfirmPassword.value = false;
	showUserModal.value = true;
};

const handleUserSubmit = async () => {
	if (!userForm.value.email) {
		toast.error("Vui lòng nhập email.");
		return;
	}
	if (!isUserEditMode.value && !userForm.value.password) {
		toast.error("Vui lòng nhập mật khẩu.");
		return;
	}
	if (userForm.value.password && userForm.value.password.length < 8) {
		toast.error("Mật khẩu phải có ít nhất 8 ký tự.");
		return;
	}
	if (userForm.value.password !== userForm.value.confirmPassword) {
		toast.error("Xác nhận mật khẩu không trùng khớp.");
		return;
	}

	isSubmitting.value = true;
	try {
		if (isUserEditMode.value) {
			const payload = {
				email: userForm.value.email,
				role: userForm.value.role,
			};
			if (userForm.value.password)
				payload.password = userForm.value.password;
			await adminStore.updateUser(userForm.value.id, payload);
			toast.success("Cập nhật người dùng thành công!");
		} else {
			await adminStore.createUser(userForm.value);
			toast.success("Tạo người dùng thành công!");
		}
		showUserModal.value = false;
		fetchUsers();
		fetchDropdownUsers();
	} catch (error) {
		toast.error(typeof error === "string" ? error : "Thao tác thất bại.");
	} finally {
		isSubmitting.value = false;
	}
};

// ==========================================
// HÀNH ĐỘNG - URLS
// ==========================================
const openCreateUrlModal = () => {
	isUrlEditMode.value = false;
	urlForm.value = {
		id: null,
		userId: adminStore.dropdownUsers[0]?.id || "",
		originalUrl: "",
		customAlias: "",
		expiresAt: "",
	};
	showUrlModal.value = true;
};

const openEditUrlModal = (url) => {
	isUrlEditMode.value = true;

	let formattedExpires = "";
	if (url.expiresAt) {
		const d = new Date(url.expiresAt);
		if (!isNaN(d.getTime())) {
			const tzOffset = d.getTimezoneOffset() * 60000;
			formattedExpires = new Date(d.getTime() - tzOffset)
				.toISOString()
				.slice(0, 16);
		}
	}

	urlForm.value = {
		id: url.id,
		userId: url.userId,
		originalUrl: url.originalUrl,
		customAlias: url.customAlias || "",
		expiresAt: formattedExpires,
	};
	showUrlModal.value = true;
};

const handleUrlSubmit = async () => {
	if (!urlForm.value.originalUrl) {
		toast.error("Vui lòng nhập đường dẫn gốc.");
		return;
	}
	if (!isUrlEditMode.value && !urlForm.value.userId) {
		toast.error("Vui lòng chọn chủ sở hữu.");
		return;
	}

	isSubmitting.value = true;
	try {
		const payload = {
			originalUrl: urlForm.value.originalUrl,
			expiresAt: urlForm.value.expiresAt || null,
		};

		if (isUrlEditMode.value) {
			await adminStore.updateUrl(urlForm.value.id, payload);
			toast.success("Cập nhật URL thành công!");
		} else {
			await adminStore.createUrl({
				...payload,
				userId: Number(urlForm.value.userId),
				customAlias: urlForm.value.customAlias.trim() || null,
			});
			toast.success("Tạo URL thành công!");
		}
		showUrlModal.value = false;
		fetchUrls();
	} catch (error) {
		toast.error(typeof error === "string" ? error : "Thao tác thất bại.");
	} finally {
		isSubmitting.value = false;
	}
};

// ==========================================
// XỬ LÝ XOÁ (USER & URL)
// ==========================================
const confirmDelete = (type, item) => {
	deleteTarget.value = {
		type,
		id: item.id,
		name: type === "user" ? item.email : item.code,
	};
	showDeleteConfirmModal.value = true;
};

const handleDeleteConfirm = async () => {
	isSubmitting.value = true;
	try {
		if (deleteTarget.value.type === "user") {
			await adminStore.deleteUser(deleteTarget.value.id);
			toast.success(
				"Xoá người dùng và toàn bộ URLs liên quan thành công!",
			);
			fetchUsers();
			fetchDropdownUsers();
		} else {
			await adminStore.deleteUrl(deleteTarget.value.id);
			toast.success("Xoá URL thành công!");
			fetchUrls();
		}
		showDeleteConfirmModal.value = false;
	} catch (error) {
		toast.error(typeof error === "string" ? error : "Xoá thất bại.");
	} finally {
		isSubmitting.value = false;
	}
};

// ==========================================
// UTILS
// ==========================================
const formatDate = (dateStr) => {
	if (!dateStr) return "Không giới hạn";
	let normalizedStr = dateStr;
	if (typeof dateStr === "string" && !dateStr.includes("T")) {
		normalizedStr = dateStr.replace(" ", "T");
		if (!normalizedStr.endsWith("Z") && !normalizedStr.includes("+")) {
			normalizedStr += "Z";
		}
	}
	const d = new Date(normalizedStr);
	if (isNaN(d.getTime())) return "Lỗi ngày";
	return d.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Ho_Chi_Minh",
	});
};

const getUserEmail = (userId) => {
	const found = adminStore.dropdownUsers.find((u) => u.id === userId);
	return found ? found.email : `User ID: ${userId}`;
};
</script>

<template>
	<div class="admin-dashboard-container">
		<div class="dashboard-header">
			<h1 class="gradient-text">Bảng Quản Trị Hệ Thống</h1>
			<p class="subtitle">
				Quản lý tài khoản người dùng và kho link rút gọn toàn hệ thống
			</p>

			<div class="tabs-container">
				<button
					@click="activeTab = 'users'"
					class="tab-btn"
					:class="{ active: activeTab === 'users' }"
				>
					<Users :size="16" style="display: inline-block; vertical-align: middle; margin-right: 6px;" /> Người Dùng
				</button>
				<button
					@click="activeTab = 'urls'"
					class="tab-btn"
					:class="{ active: activeTab === 'urls' }"
				>
					<Link2 :size="16" style="display: inline-block; vertical-align: middle; margin-right: 6px;" /> Liên Kết URLs
				</button>
			</div>
		</div>

		<!-- TAB 1: QUẢN LÝ NGƯỜI DÙNG -->
		<div v-if="activeTab === 'users'" class="dashboard-content">
			<div class="actions-row">
				<div class="search-box">
					<Search class="search-icon" :size="16" />
					<input
						v-model="userSearch"
						type="text"
						placeholder="Tìm kiếm email hoặc role..."
					/>
				</div>
				<button
					@click="openCreateUserModal"
					class="btn btn-primary"
				>
					<Plus :size="16" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Thêm Người Dùng
				</button>
			</div>

			<div class="glass-card table-wrapper">
				<div v-if="adminStore.loadingState" class="loading-overlay">
					<span class="spinner"></span> Đang tải...
				</div>

				<table class="dashboard-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Email</th>
							<th>Vai Trò</th>
							<th>Ngày Tạo</th>
							<th class="actions-col">Hành Động</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="adminStore.users.length === 0">
							<td colspan="5" class="empty-row">
								Không tìm thấy người dùng nào.
							</td>
						</tr>
						<tr v-for="user in adminStore.users" :key="user.id">
							<td class="id-cell">#{{ user.id }}</td>
							<td class="email-cell">{{ user.email }}</td>
							<td>
								<span
									:class="[
										'role-badge',
										user.role === 'admin'
											? 'role-admin'
											: 'role-user',
									]"
								>
									{{
										user.role === "admin" ? "Admin" : "User"
									}}
								</span>
							</td>
							<td class="date-cell">
								{{ formatDate(user.createdAt) }}
							</td>
							<td class="actions-cell">
								<!-- Disable nếu là admin (gồm cả bản thân và admin khác) -->
								<button
									@click="openEditUserModal(user)"
									class="btn btn-outline btn-sm"
									:disabled="user.role === 'admin'"
									:title="
										user.role === 'admin'
											? 'Không thể chỉnh sửa tài khoản Admin'
											: 'Sửa người dùng'
									"
								>
									<Edit :size="14" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Sửa
								</button>
								<button
									@click="confirmDelete('user', user)"
									class="btn btn-danger btn-sm"
									:disabled="user.role === 'admin'"
									:title="
										user.role === 'admin'
											? 'Không thể xoá tài khoản Admin'
											: 'Xoá người dùng'
									"
								>
									<Trash2 :size="14" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Xoá
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div v-if="adminStore.userTotalPages > 1" class="pagination">
				<button
					@click="
						userPage--;
						fetchUsers();
					"
					:disabled="userPage === 1"
					class="btn btn-outline btn-sm"
				>
					<ChevronLeft :size="14" style="display: inline-block; vertical-align: middle;" /> Trước
				</button>
				<span class="page-info"
					>Trang {{ userPage }} /
					{{ adminStore.userTotalPages }} (Tổng
					{{ adminStore.userTotal }} users)</span
				>
				<button
					@click="
						userPage++;
						fetchUsers();
					"
					:disabled="userPage === adminStore.userTotalPages"
					class="btn btn-outline btn-sm"
				>
					Sau <ChevronRight :size="14" style="display: inline-block; vertical-align: middle;" />
				</button>
			</div>
		</div>

		<!-- TAB 2: QUẢN LÝ URL -->
		<div v-else class="dashboard-content">
			<div class="actions-row">
				<div class="filters-group">
					<div class="search-box">
						<Search class="search-icon" :size="16" />
						<input
							v-model="urlSearch"
							type="text"
							placeholder="Tìm kiếm URL, code, custom alias..."
						/>
					</div>
					<div class="filter-select-wrapper">
						<select v-model="urlFilterUserId" class="filter-select">
							<option value="">-- Tất cả người dùng --</option>
							<option
								v-for="u in adminStore.dropdownUsers"
								:key="u.id"
								:value="u.id"
							>
								{{ u.email }} ({{ u.role }})
							</option>
						</select>
					</div>
				</div>
				<button
					@click="openCreateUrlModal"
					class="btn btn-primary"
				>
					<Plus :size="16" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Tạo Link URL mới
				</button>
			</div>

			<div class="glass-card table-wrapper">
				<div v-if="adminStore.loadingState" class="loading-overlay">
					<span class="spinner"></span> Đang tải...
				</div>

				<table class="dashboard-table">
					<thead>
						<tr>
							<th>Code</th>
							<th>Đường Dẫn Gốc</th>
							<th>Người Sở Hữu</th>
							<th>Clicks</th>
							<th>Hạn Dùng</th>
							<th>Trạng Thái</th>
							<th class="actions-col">Hành Động</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="adminStore.urls.length === 0">
							<td colspan="7" class="empty-row">
								Không tìm thấy liên kết nào.
							</td>
						</tr>
						<tr v-for="url in adminStore.urls" :key="url.id">
							<td class="code-cell">
								<a
									:href="url.shortUrl"
									target="_blank"
									class="short-link"
									>{{ url.code }}</a
								>
							</td>

							<td class="url-cell" :title="url.original">
								{{ url.original }}
							</td>
							<td class="email-cell">
								{{ getUserEmail(url.userId) }}
							</td>
							<td class="clicks-cell">{{ url.clicks }}</td>
							<td class="date-cell">
								{{ formatDate(url.expiresAt) }}
							</td>
							<td>
								<span
									:class="[
										'status-badge',
										url.isExpired
											? 'status-expired'
											: 'status-active',
									]"
								>
									{{
										url.isExpired
											? "Hết hạn"
											: "Đang hoạt động"
									}}
								</span>
							</td>
							<td class="actions-cell">
								<button
									@click="openEditUrlModal(url)"
									class="btn btn-outline btn-sm"
									title="Sửa liên kết"
								>
									<Edit :size="14" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Sửa
								</button>
								<button
									@click="confirmDelete('url', url)"
									class="btn btn-danger btn-sm"
									title="Xoá liên kết"
								>
									<Trash2 :size="14" style="display: inline-block; vertical-align: middle; margin-right: 4px;" /> Xoá
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div v-if="adminStore.urlTotalPages > 1" class="pagination">
				<button
					@click="
						urlPage--;
						fetchUrls();
					"
					:disabled="urlPage === 1"
					class="btn btn-outline btn-sm"
				>
					<ChevronLeft :size="14" style="display: inline-block; vertical-align: middle;" /> Trước
				</button>
				<span class="page-info"
					>Trang {{ urlPage }} / {{ adminStore.urlTotalPages }} (Tổng
					{{ adminStore.urlTotal }} links)</span
				>
				<button
					@click="
						urlPage++;
						fetchUrls();
					"
					:disabled="urlPage === adminStore.urlTotalPages"
					class="btn btn-outline btn-sm"
				>
					Sau <ChevronRight :size="14" style="display: inline-block; vertical-align: middle;" />
				</button>
			</div>
		</div>

		<!-- ==========================================
		MODAL 1: CREATE / EDIT USER
		========================================== -->
		<div v-if="showUserModal" class="modal-overlay">
			<div class="glass-card modal-card">
				<div class="modal-header">
					<h2>
						{{
							isUserEditMode
								? "Cập nhật Người dùng"
								: "Thêm Người dùng mới"
						}}
					</h2>
					<button
						@click="showUserModal = false"
						class="close-modal-btn"
					>
						<X :size="18" />
					</button>
				</div>
				<form @submit.prevent="handleUserSubmit" class="modal-form">
					<div class="form-group">
						<label>Email</label>
						<input
							v-model="userForm.email"
							type="email"
							placeholder="example@domain.com"
							required
						/>
					</div>
					<div class="form-group">
						<label
							>Mật khẩu
							{{
								isUserEditMode ? "(Bỏ trống nếu không đổi)" : ""
							}}</label
						>
						<div class="password-input-wrapper">
							<input
								v-model="userForm.password"
								:type="showPassword ? 'text' : 'password'"
								placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
								:required="!isUserEditMode"
							/>
							<button
								type="button"
								class="password-toggle-btn"
								@click="showPassword = !showPassword"
								title="Ẩn/Hiện mật khẩu"
							>
								<Eye v-if="!showPassword" :size="16" />
								<EyeOff v-else :size="16" />
							</button>
						</div>
					</div>
					<div class="form-group">
						<label
							>Xác nhận mật khẩu
							{{
								isUserEditMode ? "(Bỏ trống nếu không đổi)" : ""
							}}</label
						>
						<div class="password-input-wrapper">
							<input
								v-model="userForm.confirmPassword"
								:type="showConfirmPassword ? 'text' : 'password'"
								placeholder="Xác nhận mật khẩu mới"
								:required="!isUserEditMode || !!userForm.password"
							/>
							<button
								type="button"
								class="password-toggle-btn"
								@click="showConfirmPassword = !showConfirmPassword"
								title="Ẩn/Hiện mật khẩu"
							>
								<Eye v-if="!showConfirmPassword" :size="16" />
								<EyeOff v-else :size="16" />
							</button>
						</div>
					</div>
					<div class="form-group">
						<label>Vai trò (Role)</label>
						<select v-model="userForm.role" class="modal-select">
							<option value="user">
								User (Thành viên thường)
							</option>
							<option value="admin">Admin (Quản trị viên)</option>
						</select>
					</div>
					<div class="modal-footer">
						<button
							type="button"
							@click="showUserModal = false"
							class="btn btn-outline"
							:disabled="isSubmitting"
						>
							Huỷ
						</button>
						<button
							type="submit"
							class="btn btn-primary"
							:disabled="isSubmitting"
						>
							{{ isSubmitting ? "Đang lưu..." : "Lưu lại" }}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- ==========================================
		MODAL 2: CREATE / EDIT URL
		========================================== -->
		<div v-if="showUrlModal" class="modal-overlay">
			<div class="glass-card modal-card">
				<div class="modal-header">
					<h2>
						{{
							isUrlEditMode
								? "Cập nhật liên kết URL"
								: "Tạo liên kết URL mới"
						}}
					</h2>
					<button
						@click="showUrlModal = false"
						class="close-modal-btn"
					>
						<X :size="18" />
					</button>
				</div>
				<form @submit.prevent="handleUrlSubmit" class="modal-form">
					<div v-if="!isUrlEditMode" class="form-group">
						<label>Chủ sở hữu (Người dùng)</label>
						<select
							v-model="urlForm.userId"
							class="modal-select"
							required
						>
							<option value="" disabled>
								-- Chọn người dùng sở hữu --
							</option>
							<option
								v-for="u in adminStore.dropdownUsers"
								:key="u.id"
								:value="u.id"
							>
								{{ u.email }} ({{ u.role }})
							</option>
						</select>
					</div>
					<div class="form-group">
						<label>Đường dẫn gốc (Original URL)</label>
						<input
							v-model="urlForm.originalUrl"
							type="url"
							placeholder="https://example.com/some/long/path"
							required
						/>
					</div>
					<div v-if="!isUrlEditMode" class="form-group">
						<label
							>Custom Alias (Tùy chọn - Không thể sửa sau khi
							tạo)</label
						>
						<input
							v-model="urlForm.customAlias"
							type="text"
							placeholder="Chỉ điền chữ cái/số không chứa khoảng trắng"
						/>
					</div>
					<div class="form-group">
						<label>Hạn sử dụng (Tùy chọn)</label>
						<input
							v-model="urlForm.expiresAt"
							type="datetime-local"
						/>
					</div>
					<div class="modal-footer">
						<button
							type="button"
							@click="showUrlModal = false"
							class="btn btn-outline"
							:disabled="isSubmitting"
						>
							Huỷ
						</button>
						<button
							type="submit"
							class="btn btn-primary"
							:disabled="isSubmitting"
						>
							{{ isSubmitting ? "Đang lưu..." : "Lưu lại" }}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- ==========================================
		MODAL 3: XÁC NHẬN XOÁ (USER / URL)
		========================================== -->
		<div v-if="showDeleteConfirmModal" class="modal-overlay">
			<div class="glass-card modal-card confirm-modal">
				<div class="modal-header">
					<h2>
						<AlertTriangle :size="20" style="display: inline-block; vertical-align: middle; margin-right: 6px; color: var(--danger);" />
						Xác nhận xoá dữ liệu
					</h2>
					<button
						@click="showDeleteConfirmModal = false"
						class="close-modal-btn"
					>
						<X :size="18" />
					</button>
				</div>
				<div class="modal-body">
					<p v-if="deleteTarget.type === 'user'">
						Bạn có chắc chắn muốn xoá người dùng
						<strong>{{ deleteTarget.name }}</strong> không?
					</p>
					<p v-else>
						Bạn có chắc chắn muốn xoá liên kết code
						<strong>{{ deleteTarget.name }}</strong> không?
					</p>

					<div class="alert-box alert-danger">
						<strong>Cảnh báo quan trọng:</strong>
						<span v-if="deleteTarget.type === 'user'">
							Hành động này sẽ xoá vĩnh viễn tài khoản người dùng
							và **TOÀN BỘ** liên kết rút gọn, lịch sử thống kê
							truy cập của người dùng này khỏi hệ thống.
						</span>
						<span v-else>
							Hành động này sẽ xoá vĩnh viễn liên kết và các log
							phân tích truy cập của link này.
						</span>
						Hành động này **không thể** hoàn tác!
					</div>
				</div>
				<div class="modal-footer">
					<button
						@click="showDeleteConfirmModal = false"
						class="btn btn-outline"
						:disabled="isSubmitting"
					>
						Huỷ bỏ
					</button>
					<button
						@click="handleDeleteConfirm"
						class="btn btn-danger"
						:disabled="isSubmitting"
					>
						{{
							isSubmitting
								? "Đang xoá..."
								: "Tôi đồng ý, Xoá ngay"
						}}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.admin-dashboard-container {
	width: 100%;
	padding-bottom: 40px;
}

.dashboard-header {
	margin-bottom: 30px;
	text-align: center;
}

.dashboard-header h1.gradient-text {
	font-size: 34px;
	font-weight: var(--font-weight-extrabold);
	background: var(--primary-gradient);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin: 5px 0;
	line-height: 1.4;
	color: transparent;
}

.subtitle {
	font-size: 15px;
	color: var(--text-muted);
	margin-bottom: 25px;
}

/* Tab buttons */
.tabs-container {
	display: inline-flex;
	background: rgba(241, 245, 249, 0.8);
	padding: 5px;
	border-radius: 14px;
	border: 1px solid var(--border-color);
}

.tab-btn {
	padding: 10px 24px;
	font-size: 14px;
	font-weight: var(--font-weight-semibold);
	color: var(--text-muted);
	border: none;
	background: transparent;
	cursor: pointer;
	border-radius: 10px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn.active {
	color: var(--primary);
	background: white;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
}

/* Search and actions */
.dashboard-content {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.actions-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
}

.filters-group {
	display: flex;
	align-items: center;
	gap: 15px;
	flex-wrap: wrap;
}

.search-box {
	position: relative;
	width: 280px;
}

.search-icon {
	position: absolute;
	left: 14px;
	top: 50%;
	transform: translateY(-50%);
	font-size: 14px;
	color: var(--text-disabled);
}

.search-box input {
	width: 100%;
	padding: 10px 14px 10px 40px;
	font-size: 14px;
	border: 2px solid var(--border-color);
	border-radius: 12px;
	outline: none;
	background: rgba(255, 255, 255, 0.9);
	transition: all 0.3s ease;
}

.search-box input:focus {
	border-color: var(--primary);
	box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.filter-select-wrapper {
	position: relative;
}

.filter-select {
	padding: 10px 14px;
	font-size: 14px;
	border: 2px solid var(--border-color);
	border-radius: 12px;
	outline: none;
	background: white;
	cursor: pointer;
	min-width: 220px;
	transition: all 0.3s ease;
}

.filter-select:focus {
	border-color: var(--primary);
}

/* Glass Card & Tables */
.table-wrapper {
	position: relative;
	overflow-x: auto;
}

.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(4px);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 14px;
	font-weight: var(--font-weight-semibold);
	color: var(--primary);
	z-index: 5;
}

.spinner {
	width: 18px;
	height: 18px;
	border: 2px solid rgba(37, 99, 235, 0.2);
	border-top-color: var(--primary);
	border-radius: 50%;
	display: inline-block;
	animation: spin 0.8s linear infinite;
	margin-right: 8px;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.dashboard-table {
	width: 100%;
	border-collapse: collapse;
	text-align: left;
	font-size: 14px;
}

.dashboard-table th,
.dashboard-table td {
	padding: 16px 20px;
	border-bottom: 1px solid var(--border-color);
}

.dashboard-table th {
	font-weight: var(--font-weight-bold);
	color: var(--secondary);
	background: rgba(248, 250, 252, 0.5);
}

.dashboard-table tbody tr {
	transition: background-color 0.2s ease;
}

.dashboard-table tbody tr:hover {
	background-color: rgba(241, 245, 249, 0.4);
}

.id-cell {
	font-weight: var(--font-weight-semibold);
	color: var(--text-muted);
}

.email-cell {
	font-weight: var(--font-weight-semibold);
	color: var(--text-main);
	max-width: 250px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.code-cell {
	font-weight: var(--font-weight-bold);
}

.short-link {
	color: var(--primary);
	text-decoration: none;
	border-bottom: 1px dashed rgba(37, 99, 235, 0.4);
}

.short-link:hover {
	color: var(--primary-hover);
	border-bottom-style: solid;
}

.url-cell {
	color: var(--text-muted);
	max-width: 260px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.clicks-cell {
	font-weight: var(--font-weight-semibold);
	color: var(--text-main);
}

.date-cell {
	color: var(--text-muted);
	font-size: 13px;
}

.empty-row {
	text-align: center;
	color: var(--text-disabled);
	padding: 40px !important;
}

/* Badges */
.role-badge,
.status-badge {
	padding: 4px 10px;
	font-size: 12px;
	font-weight: var(--font-weight-semibold);
	border-radius: 20px;
	display: inline-block;
}

.role-user {
	background: var(--primary-light);
	color: var(--primary);
	border: 1px solid rgba(37, 99, 235, 0.15);
}

.role-admin {
	background: var(--danger-light);
	color: var(--danger);
	border: 1px solid rgba(239, 68, 68, 0.15);
}

.status-active {
	background: var(--success-light);
	color: var(--success);
	border: 1px solid rgba(16, 185, 129, 0.15);
}

.status-expired {
	background: #f8fafc;
	color: var(--text-disabled);
	border: 1px solid var(--border-color);
}

/* Action buttons inside table */
.actions-cell {
	display: flex;
	gap: 8px;
}

/* Pagination */
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 15px;
	margin-top: 10px;
}

.page-info {
	font-size: 13px;
	color: var(--text-muted);
	font-weight: var(--font-weight-semibold);
}

/* ==========================================
   MODAL STYLE (GLASSMORPHIC)
   ========================================== */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(15, 23, 42, 0.2);
	backdrop-filter: var(--glass-blur);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
	padding: 20px;
}

.modal-card {
	width: 100%;
	max-width: 480px;
	padding: 30px;
	box-shadow: var(--shadow-xl);
	animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 2px solid var(--border-color);
	padding-bottom: 14px;
	margin-bottom: 20px;
}

.modal-header h2 {
	font-size: 18px;
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	margin: 0;
}

.close-modal-btn {
	background: none;
	border: none;
	font-size: 18px;
	color: var(--text-disabled);
	cursor: pointer;
	transition: color 0.2s ease;
}

.close-modal-btn:hover {
	color: var(--text-main);
}

.modal-form {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.form-group label {
	font-size: 13px;
	font-weight: var(--font-weight-semibold);
	color: var(--secondary);
}

.form-group input,
.modal-select {
	padding: 11px 14px;
	font-size: 14px;
	border: 2px solid var(--border-color);
	border-radius: 10px;
	outline: none;
	width: 100%;
	transition: border-color 0.2s ease;
	background: white;
}

.form-group input:focus,
.modal-select:focus {
	border-color: var(--primary);
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: 10px;
}

/* Danger Confirm Modals */
.confirm-modal {
	max-width: 520px;
}

.modal-body {
	color: var(--secondary);
	font-size: 14px;
	line-height: 1.5;
	margin-bottom: 20px;
}

.alert-box {
	margin-top: 15px;
	padding: 14px;
	border-radius: 10px;
	font-size: 13px;
}

.alert-danger {
	background: var(--danger-light);
	border: 1px solid rgba(239, 68, 68, 0.2);
	color: var(--danger);
	display: flex;
	flex-direction: column;
	gap: 4px;
}

/* Responsiveness */
@media screen and (max-width: 768px) {
	.admin-dashboard-container {
		padding: 20px 10px;
	}
	.actions-row {
		flex-direction: column;
		align-items: stretch;
	}
	.search-box,
	.filter-select {
		width: 100%;
	}
	.filters-group {
		flex-direction: column;
		align-items: stretch;
		width: 100%;
	}
}
</style>

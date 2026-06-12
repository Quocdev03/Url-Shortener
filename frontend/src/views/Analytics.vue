<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/store/auth";
import { useAnalyticsStore } from "@/store/analytics";
import {
	ArrowLeft,
	BarChart3,
	RefreshCw,
	MousePointerClick,
	Link2,
	Zap,
	Monitor,
	Smartphone,
	Tablet,
	Tv,
	Terminal,
	Share2,
	Trophy,
	ChevronRight,
	History,
	ChevronLeft,
	Globe
} from "@lucide/vue";
import { parseUA, formatReferer } from "../utils/uaParser";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const analyticsStore = useAnalyticsStore();

const isAdmin = computed(() => authStore.user?.role === "admin");
const {
	clickLogs,
	totalLogs,
	loading: logsLoading,
	statsLogs,
	statsLoading,
} = storeToRefs(analyticsStore);

// State
const selectedUrlId = ref(""); // "" means all URLs
const currentPage = ref(1);
const limitPerPage = ref(10);
const searchKeyword = ref("");

// Dropdown options
const urlsList = computed(() => authStore.userProfile?.user?.urls || []);

// Fetch basic user profile to list the URLs
const loadProfile = async () => {
	try {
		await authStore.fetchProfile();
		// If route param contains url ID, pre-select it
		if (route.params.id) {
			const idStr = String(route.params.id);
			const exists = urlsList.value.some((u) => String(u.id) === idStr);
			if (exists) {
				selectedUrlId.value = idStr;
			}
		}
	} catch (err) {
		console.error("Failed to load user profile", err);
		toast.error("Không thể tải thông tin liên kết");
	}
};

// Fetch click logs from API using Pinia store action
const fetchLogs = async () => {
	try {
		const params = {
			page: currentPage.value,
			limit: limitPerPage.value,
			search: searchKeyword.value || undefined,
			urlId: selectedUrlId.value || undefined,
			sortBy: "clicked_at",
			order: "DESC",
		};
		await analyticsStore.fetchAnalytics(params);
	} catch (err) {
		console.error("Failed to fetch analytics logs", err);
		toast.error("Không thể tải lịch sử click");
	}
};

// Fetch distribution statistics from recent clicks using Pinia store action
const fetchStatsLogs = async () => {
	try {
		await analyticsStore.fetchStatsLogs(selectedUrlId.value);
	} catch (err) {
		console.error("Failed to fetch stats logs", err);
	}
};

// Total pages for log pagination
const totalPages = computed(() => {
	return Math.ceil(totalLogs.value / limitPerPage.value) || 1;
});

// Aggregate data for visualization
const distribution = computed(() => {
	const browsers = {};
	const os = {};
	const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
	const referers = {};

	statsLogs.value.forEach((log) => {
		const parsed = parseUA(log.userAgent);

		// Browser
		browsers[parsed.browser] = (browsers[parsed.browser] || 0) + 1;

		// OS
		os[parsed.os] = (os[parsed.os] || 0) + 1;

		// Device
		devices[parsed.device] = (devices[parsed.device] || 0) + 1;

		// Referers
		const cleanRef = formatReferer(log.referer);
		referers[cleanRef] = (referers[cleanRef] || 0) + 1;
	});

	// Helper to transform to sorted percentages array
	const toSortedPercentageArray = (obj) => {
		const total = Object.values(obj).reduce((sum, v) => sum + v, 0) || 1;
		return Object.entries(obj)
			.map(([name, count]) => ({
				name,
				count,
				percentage: Math.round((count / total) * 100),
			}))
			.sort((a, b) => b.count - a.count);
	};

	return {
		browsers: toSortedPercentageArray(browsers),
		os: toSortedPercentageArray(os),
		devices: toSortedPercentageArray(devices),
		referers: toSortedPercentageArray(referers).slice(0, 5), // top 5 only
	};
});

// Overall stats cards info
const kpis = computed(() => {
	const urls = urlsList.value;
	const totalLinks = urls.length;

	let totalClicks = 0;
	let activeLinks = 0;

	if (selectedUrlId.value) {
		const singleUrl = urls.find(
			(u) => String(u.id) === String(selectedUrlId.value),
		);
		if (singleUrl) {
			totalClicks = singleUrl.clicks || 0;
			activeLinks = singleUrl.isExpired ? 0 : 1;
		}
	} else {
		totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);
		activeLinks = urls.filter((u) => !u.isExpired).length;
	}

	const avgClicks =
		totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0;

	return {
		totalClicks,
		totalLinks,
		activeLinks,
		avgClicks,
	};
});

// Top performings links (overall user view)
const topLinks = computed(() => {
	return [...urlsList.value]
		.sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
		.slice(0, 5);
});

// Watch triggers
watch(selectedUrlId, (newId) => {
	currentPage.value = 1;
	fetchLogs();
	fetchStatsLogs();
	// Sync URL params
	if (newId) {
		router.replace({ name: "Analytics", params: { id: newId } });
	} else {
		router.replace({ name: "Analytics" });
	}
});

watch(currentPage, () => {
	fetchLogs();
});

const loadAnalyticsData = async () => {
	await loadProfile();
	fetchLogs();
	fetchStatsLogs();
};
loadAnalyticsData();

// Actions
const refreshAll = () => {
	loadProfile();
	fetchLogs();
	fetchStatsLogs();
	toast.success("Đã cập nhật dữ liệu thống kê!");
};

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
	return d.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Ho_Chi_Minh",
	});
};

const selectSpecificUrl = (id) => {
	selectedUrlId.value = String(id);
};
</script>

<template>
	<main class="analytics-page">
		<!-- Header & Controls -->
		<div class="analytics-header">
			<div class="title-group">
				<router-link to="/profile" class="btn-back">
					<ArrowLeft :size="14" style="display:inline-block;vertical-align:middle;margin-right:4px;" />
					Quay lại Kho Link
				</router-link>
				<h1 class="gradient-text">Phân Tích Thống Kê</h1>
				<p class="subtitle">
					Theo dõi chi tiết lưu lượng truy cập và hành vi người dùng
				</p>
			</div>

			<div class="controls-group">
				<!-- Dropdown chọn link -->
				<div class="select-wrapper glass">
					<select v-model="selectedUrlId" class="url-selector">
						<option value="">Tất cả các liên kết</option>
						<option
							v-for="url in urlsList"
							:key="url.id"
							:value="String(url.id)"
						>
							{{ url.customAlias || url.code }} -
							{{ url.originalUrl.substring(0, 30) }}... ({{
								url.clicks
							}}
							clicks)
						</option>
					</select>
				</div>
				<button
					class="btn-refresh glass"
					@click="refreshAll"
					title="Làm mới dữ liệu"
				>
					<RefreshCw :size="16" style="vertical-align: middle;" />
				</button>
			</div>
		</div>

		<!-- Thống kê KPIs -->
		<div class="kpi-grid">
			<div class="kpi-card glass">
				<div class="kpi-icon clicks">
					<MousePointerClick :size="20" style="color:#2563eb;" />
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Tổng lượt click</span>
					<h3 class="kpi-value">{{ kpis.totalClicks }}</h3>
				</div>
			</div>
			<div class="kpi-card glass">
				<div class="kpi-icon links">
					<Link2 :size="20" style="color:#0ea5e9;" />
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Tổng số liên kết</span>
					<h3 class="kpi-value">{{ kpis.totalLinks }}</h3>
				</div>
			</div>
			<div class="kpi-card glass">
				<div class="kpi-icon active">
					<Zap :size="20" style="color:#eab308;" />
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Liên kết đang hoạt động</span>
					<h3 class="kpi-value">{{ kpis.activeLinks }}</h3>
				</div>
			</div>
			<div class="kpi-card glass">
				<div class="kpi-icon average">
					<BarChart3 :size="20" style="color:#10b981;" />
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Clicks trung bình</span>
					<h3 class="kpi-value">
						{{ kpis.avgClicks }}
						<span class="kpi-value-unit">/ link</span>
					</h3>
				</div>
			</div>
		</div>

		<!-- Charts & Breakdowns -->
		<div class="charts-grid">
			<!-- Device Breakdown -->
			<div class="chart-card glass">
				<h3>
					<Monitor :size="16" style="display:inline-block;vertical-align:middle;margin-right:6px;color:#2563eb;" />
					Phân bố thiết bị
				</h3>
				<div class="chart-content" v-if="statsLogs.length">
					<div class="device-summary">
						<div
							v-for="item in distribution.devices"
							:key="item.name"
							class="device-row"
						>
							<div class="device-info">
								<span class="device-icon">
									<template v-if="item.name === 'Desktop'">
										<Monitor :size="16" style="display:inline-block;vertical-align:middle;margin-right:4px;" />
									</template>
									<template v-else-if="item.name === 'Mobile'">
										<Smartphone :size="16" style="display:inline-block;vertical-align:middle;margin-right:4px;" />
									</template>
									<template v-else>
										<Tablet :size="16" style="display:inline-block;vertical-align:middle;margin-right:4px;" />
									</template>
								</span>
								<span class="device-name">{{ item.name }}</span>
								<span class="device-count"
									>({{ item.count }})</span
								>
							</div>
							<div class="progress-bar-wrapper">
								<div
									class="progress-bar"
									:style="{ width: item.percentage + '%' }"
									:class="item.name.toLowerCase()"
								></div>
								<span class="percentage-label"
									>{{ item.percentage }}%</span
								>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="empty-chart">Chưa có dữ liệu lượt click</div>
			</div>

			<!-- Browser Breakdown -->
			<div class="chart-card glass">
				<h3>
					<Globe :size="16" style="display:inline-block;vertical-align:middle;margin-right:6px;color:#eab308;" />
					Trình duyệt sử dụng
				</h3>
				<div class="chart-content" v-if="statsLogs.length">
					<div class="distribution-list">
						<div
							v-for="item in distribution.browsers"
							:key="item.name"
							class="dist-row"
						>
							<div class="dist-info">
								<span class="dist-name">{{ item.name }}</span>
								<span class="dist-percentage"
									>{{ item.percentage }}%</span
								>
							</div>
							<div class="dist-bar-bg">
								<div
									class="dist-bar bg-blue"
									:style="{ width: item.percentage + '%' }"
								></div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="empty-chart">Chưa có dữ liệu lượt click</div>
			</div>

			<!-- OS Breakdown -->
			<div class="chart-card glass">
				<h3>
					<Terminal :size="16" style="display:inline-block;vertical-align:middle;margin-right:6px;color:#a855f7;" />
					Hệ điều hành
				</h3>
				<div class="chart-content" v-if="statsLogs.length">
					<div class="distribution-list">
						<div
							v-for="item in distribution.os"
							:key="item.name"
							class="dist-row"
						>
							<div class="dist-info">
								<span class="dist-name">{{ item.name }}</span>
								<span class="dist-percentage"
									>{{ item.percentage }}%</span
								>
							</div>
							<div class="dist-bar-bg">
								<div
									class="dist-bar bg-purple"
									:style="{ width: item.percentage + '%' }"
								></div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="empty-chart">Chưa có dữ liệu lượt click</div>
			</div>

			<!-- Referers / Sources -->
			<div class="chart-card glass">
				<h3>
					<Share2 :size="16" style="display:inline-block;vertical-align:middle;margin-right:6px;color:#10b981;" />
					Nguồn giới thiệu (Referer)
				</h3>
				<div class="chart-content" v-if="statsLogs.length">
					<div class="distribution-list">
						<div
							v-for="item in distribution.referers"
							:key="item.name"
							class="dist-row"
						>
							<div class="dist-info">
								<span
									class="dist-name text-truncate"
									:title="item.name"
									>{{ item.name }}</span
								>
								<span class="dist-percentage"
									>{{ item.percentage }}%</span
								>
							</div>
							<div class="dist-bar-bg">
								<div
									class="dist-bar bg-green"
									:style="{ width: item.percentage + '%' }"
								></div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="empty-chart">Chưa có dữ liệu lượt click</div>
			</div>
		</div>

		<!-- Top performing urls (only when overall view is selected) -->
		<div
			class="top-urls-section glass"
			v-if="!selectedUrlId && urlsList.length"
		>
			<h3>
				<Trophy :size="18" style="display:inline-block;vertical-align:middle;margin-right:6px;color:#eab308;" />
				Top 5 liên kết hiệu quả nhất
			</h3>
			<div class="top-urls-list">
				<div
					v-for="(url, index) in topLinks"
					:key="url.id"
					class="top-url-item"
					@click="selectSpecificUrl(url.id)"
				>
					<div class="url-rank">#{{ index + 1 }}</div>
					<div class="url-details-min">
						<span class="url-alias">{{
							url.customAlias || url.code
						}}</span>
						<span class="url-orig text-truncate">{{
							url.originalUrl
						}}</span>
					</div>
					<div class="url-stats-min">
						<span class="url-clicks-badge"
							>{{ url.clicks }} clicks</span
						>
						<ChevronRight :size="16" style="display:inline-block;vertical-align:middle;margin-left:4px;color:#64748b;" />
					</div>
				</div>
			</div>
		</div>

		<div class="logs-section glass">
			<div class="logs-header">
				<h3>
					<History :size="18" style="display:inline-block;vertical-align:middle;margin-right:6px;color:#2563eb;" />
					Nhật ký truy cập gần đây
				</h3>
				<div class="logs-search">
					<input
						type="text"
						v-model="searchKeyword"
						@input="fetchLogs"
						placeholder="Tìm theo IP, Code hoặc URL..."
					/>
				</div>
			</div>

			<div class="table-responsive" v-if="clickLogs.length">
				<table class="logs-table">
					<thead>
						<tr>
							<th>Liên kết</th>
							<th>Địa chỉ IP</th>
							<th>Thiết bị</th>
							<th>Trình duyệt / OS</th>
							<th>Nguồn giới thiệu</th>
							<th>Thời gian</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="log in clickLogs" :key="log.id">
							<td class="col-code">
								<span
									class="code-badge"
									@click="selectSpecificUrl(log.urlId)"
									:title="log.originalUrl"
								>
									/{{ log.code }}
								</span>
							</td>

							<td class="col-ip">
								<code>{{ log.ip || "Unknown" }}</code>
							</td>
							<td class="col-device">
								<span
									class="badge-device"
									:class="
										parseUA(
											log.userAgent,
										).device.toLowerCase()
									"
								>
									{{ parseUA(log.userAgent).device }}
								</span>
							</td>
							<td class="col-ua">
								<span class="ua-text">
									{{ parseUA(log.userAgent).browser }} /
									{{ parseUA(log.userAgent).os }}
								</span>
							</td>
							<td class="col-referer">
								<span class="referer-text" :title="log.referer">
									{{ formatReferer(log.referer) }}
								</span>
							</td>
							<td class="col-date">
								{{ formatDate(log.clickedAt) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div v-else-if="logsLoading" class="logs-loading">
				<span>Đang tải nhật ký click...</span>
			</div>
			<div v-else class="logs-empty">
				Chưa ghi nhận lượt click nào phù hợp với bộ lọc.
			</div>

			<div class="pagination" v-if="totalPages > 1">
				<button
					:disabled="currentPage === 1"
					@click="currentPage--"
					class="page-btn"
				>
					<ChevronLeft :size="14" style="display:inline-block;vertical-align:middle;" /> Trước
				</button>
				<span class="page-info"
					>Trang {{ currentPage }} / {{ totalPages }} (Tổng
					{{ totalLogs }} dòng)</span
				>
				<button
					:disabled="currentPage === totalPages"
					@click="currentPage++"
					class="page-btn"
				>
					Sau <ChevronRight :size="14" style="display:inline-block;vertical-align:middle;" />
				</button>
			</div>
		</div>
	</main>
</template>

<style scoped>
.analytics-page {
	display: flex;
	flex-direction: column;
	gap: 36px;
}

.analytics-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 24px;
	flex-wrap: wrap;
}

.title-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.title-group h1.gradient-text {
	font-size: 34px;
	font-weight: 800;
	background: linear-gradient(135deg, #00b3fa 0%, #1a80e5 50%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-top: 4px;
	line-height: 1.4;
}

.title-group p.subtitle {
	font-size: 15px;
	color: #64748b;
	font-weight: 500;
}

.btn-back {
	font-size: 14px;
	color: #4261ed;
	text-decoration: none;
	font-weight: 700;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	transition:
		transform 0.2s,
		color 0.2s;
	width: fit-content;
}

.btn-back:hover {
	color: #1a80e5;
	transform: translateX(-4px);
}

.back-arrow {
	font-size: 16px;
	line-height: 1;
}

.controls-group {
	display: flex;
	align-items: center;
	gap: 16px;
}

.select-wrapper {
	position: relative;
	border-radius: 12px;
	padding: 10px 16px;
	border: 1px solid rgba(66, 97, 237, 0.2);
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.45);
	transition:
		border-color 0.2s,
		box-shadow 0.2s;
}

.select-wrapper:focus-within {
	border-color: #4261ed;
	box-shadow: 0 0 0 4px rgba(66, 97, 237, 0.1);
}

.url-selector {
	border: none;
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	outline: none;
	background: transparent;
	cursor: pointer;
	max-width: 320px;
}

.btn-refresh {
	border-radius: 12px;
	padding: 10px 16px;
	cursor: pointer;
	font-size: 16px;
	border: 1px solid rgba(66, 97, 237, 0.2);
	transition:
		transform 0.2s,
		background-color 0.2s,
		border-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-refresh:hover {
	border-color: #4261ed;
	background: rgba(66, 97, 237, 0.08);
}

.refresh-icon {
	display: inline-block;
	transition: transform 0.3s ease;
}

.btn-refresh:hover .refresh-icon {
	transform: rotate(180deg);
}

/* KPIs cards */
.kpi-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 24px;
}

.kpi-card {
	padding: 26px 24px;
	display: flex;
	align-items: center;
	gap: 20px;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.kpi-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 30px rgba(66, 97, 237, 0.06);
}

.kpi-icon {
	font-size: 20px;
	width: 45px;
	height: 45px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	font-weight: bold;
}

.kpi-icon.clicks {
	background: rgba(59, 130, 246, 0.1);
	color: #2563eb;
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
}

.kpi-icon.links {
	background: rgba(245, 158, 11, 0.1);
	color: #d97706;
	box-shadow: 0 4px 12px rgba(245, 158, 11, 0.05);
}

.kpi-icon.active {
	background: rgba(16, 185, 129, 0.1);
	color: #059669;
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.05);
}

.kpi-icon.average {
	background: rgba(139, 92, 246, 0.1);
	color: #7c3aed;
	box-shadow: 0 4px 12px rgba(139, 92, 246, 0.05);
}

.kpi-content {
	display: flex;
	flex-direction: column;
}

.kpi-label {
	font-size: 13px;
	color: #64748b;
	font-weight: 600;
	text-transform: uppercase;
}

.kpi-value {
	font-size: 26px;
	font-weight: 800;
	color: #1e293b;
	margin-top: 4px;
}

.kpi-value-unit {
	font-size: 14px;
	color: #94a3b8;
	font-weight: 500;
}

/* Glass card (Glassmorphism) */
.glass {
	background: rgba(255, 255, 255, 0.45);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.6);
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
	border-radius: 16px;
	padding: 15px;
}

/* Charts grid */
.charts-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 24px;
}

.chart-card h3 {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 24px;
	border-bottom: 1px dashed rgba(66, 97, 237, 0.15);
	padding-bottom: 12px;
}

.empty-chart {
	text-align: center;
	padding: 50px 0;
	color: #94a3b8;
	font-size: 14px;
}

/* Distribution list */
.distribution-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.dist-row {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.dist-info {
	display: flex;
	justify-content: space-between;
	font-size: 14px;
	color: #475569;
	font-weight: 700;
}

.dist-bar-bg {
	background: rgba(15, 23, 42, 0.05);
	height: 8px;
	border-radius: 99px;
	overflow: hidden;
}

.dist-bar {
	height: 100%;
	border-radius: 99px;
	transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-blue {
	background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.bg-purple {
	background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.bg-green {
	background: linear-gradient(90deg, #10b981, #34d399);
}

/* Device Breakdown details */
.device-summary {
	display: flex;
	flex-direction: column;
}

.device-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 18px;
}

.device-row:last-child {
	margin-bottom: 0;
}

.device-info {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: #475569;
	font-weight: 700;
	min-width: 120px;
}

.device-icon {
	font-size: 18px;
}

.device-name {
	font-weight: 700;
}

.device-count {
	color: #94a3b8;
	font-size: 12px;
	margin-left: 2px;
}

.progress-bar-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 12px;
}

.progress-bar {
	height: 10px;
	border-radius: 6px;
	background: #cbd5e1;
	transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar.desktop {
	background: linear-gradient(90deg, #2563eb, #60a5fa);
}
.progress-bar.mobile {
	background: linear-gradient(90deg, #10b981, #34d399);
}
.progress-bar.tablet {
	background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.percentage-label {
	font-size: 13px;
	font-weight: 800;
	color: #1e293b;
	min-width: 36px;
	text-align: right;
}

/* Top performing links */
.top-urls-section h3 {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 20px;
	border-bottom: 1px dashed rgba(66, 97, 237, 0.15);
	padding-bottom: 12px;
}

.top-urls-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.top-url-item {
	display: flex;
	align-items: center;
	background: rgba(248, 250, 252, 0.6);
	padding: 16px 22px;
	border-radius: 14px;
	border: 1px solid rgba(226, 232, 240, 0.8);
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.top-url-item:hover {
	background: rgba(241, 245, 249, 0.9);
	border-color: #cbd5e1;
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(66, 97, 237, 0.04);
}

.url-rank {
	font-weight: 900;
	font-size: 18px;
	color: #4261ed;
	width: 44px;
}

.url-details-min {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	padding-right: 12px;
}

.url-alias {
	font-weight: 700;
	font-size: 15px;
	color: #1e293b;
}

.url-orig {
	font-size: 13px;
	color: #94a3b8;
	margin-top: 2px;
}

.url-stats-min {
	display: flex;
	align-items: center;
}

.url-clicks-badge {
	font-size: 13px;
	font-weight: 700;
	background: #ecfdf5;
	color: #10b981;
	padding: 6px 12px;
	border-radius: 8px;
}

.arrow-indicator {
	margin-left: 10px;
	opacity: 0.6;
}

/* Logs Table */
.logs-section {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.logs-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;
}

.logs-header h3 {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
}

.logs-search input {
	border: 2px solid #e2e8f0;
	border-radius: 10px;
	padding: 10px 16px;
	font-size: 14px;
	width: 280px;
	background: white;
	transition:
		border-color 0.2s,
		box-shadow 0.2s;
}

.logs-search input:focus {
	border-color: #4261ed;
	box-shadow: 0 0 0 3px rgba(66, 97, 237, 0.15);
}

.table-responsive {
	overflow-x: auto;
	border-radius: 12px;
	border: 1px solid rgba(226, 232, 240, 0.8);
}

.logs-table {
	width: 100%;
	border-collapse: collapse;
	text-align: left;
	font-size: 14px;
}

.logs-table th {
	padding: 16px 20px;
	border-bottom: 2px solid #e2e8f0;
	color: #475569;
	font-weight: 800;
	text-transform: uppercase;
	font-size: 12px;
	background: rgba(248, 250, 252, 0.8);
}

.logs-table td {
	padding: 16px 20px;
	border-bottom: 1px solid #f1f5f9;
	color: #334155;
	vertical-align: middle;
}

.logs-table tr:last-child td {
	border-bottom: none;
}

.col-code {
	font-weight: 700;
}

.code-badge {
	cursor: pointer;
	color: #4261ed;
	background: #f0f4ff;
	padding: 4px 8px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 700;
	transition:
		background-color 0.2s,
		color 0.2s;
}

.code-badge:hover {
	background: #4261ed;
	color: white;
	text-decoration: none;
}

.badge-device {
	font-size: 11px;
	font-weight: 800;
	padding: 4px 8px;
	border-radius: 6px;
	text-transform: uppercase;
}

.badge-device.desktop {
	background: #eff6ff;
	color: #2563eb;
}

.badge-device.mobile {
	background: #ecfdf5;
	color: #10b981;
}

.badge-device.tablet {
	background: #fffbeb;
	color: #d97706;
}

.ua-text {
	font-weight: 500;
}

.referer-text {
	max-width: 180px;
	display: inline-block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: #475569;
	font-size: 13px;
}

.owner-email {
	max-width: 180px;
	display: inline-block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: #4b5563;
	font-weight: 600;
	font-size: 13px;
}

.col-date {
	color: #94a3b8;
	font-size: 13px;
}

.logs-loading,
.logs-empty {
	text-align: center;
	padding: 50px;
	color: #64748b;
	font-size: 14px;
}

/* Pagination */
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 16px;
	padding-top: 10px;
}

.page-btn {
	background: white;
	border: 1px solid #cbd5e1;
	padding: 8px 16px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	color: #475569;
	transition: all 0.2s;
}

.page-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
	border-color: #4261ed;
	color: #4261ed;
	background: #f0f4ff;
}

.page-info {
	font-size: 13px;
	color: #64748b;
}

/* General utilities */
.text-truncate {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
	.analytics-header {
		flex-direction: column;
		align-items: stretch;
	}

	.controls-group {
		justify-content: space-between;
	}

	.url-selector {
		max-width: 100%;
	}

	.logs-search input {
		width: 100%;
	}
}
</style>

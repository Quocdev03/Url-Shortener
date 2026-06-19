<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";
import {
	Link2,
	BarChart3,
	Zap,
	Shield,
	Users,
	ChevronRight,
	Sparkles,
} from "@lucide/vue";

const authStore = useAuthStore();
const router = useRouter();

const isLoggedIn = computed(() => authStore.isAuthenticated);

const navigateToShorten = () => {
	router.push("/shorten");
};

const navigateToSecondAction = () => {
	if (isLoggedIn.value) {
		router.push("/profile");
	} else {
		router.push("/register");
	}
};
</script>

<template>
	<div class="landing-page">
		<!-- Hero Section -->
		<section class="hero-section">
			<div class="hero-glow hero-glow-1"></div>
			<div class="hero-glow hero-glow-2"></div>

			<div class="hero-container">
				<div class="badge-wrapper animate-fade-in-up">
					<span class="promo-badge">
						<Sparkles :size="14" class="badge-icon" />
						Giải pháp rút gọn link thế hệ mới
					</span>
				</div>

				<h1 class="hero-title animate-fade-in-up delay-1">
					Rút Gọn Liên Kết<br />
					<span class="gradient-text">Tối Ưu Trải Nghiệm</span>
				</h1>

				<p class="hero-subtitle animate-fade-in-up delay-2">
					Rút gọn, quản lý và theo dõi hiệu suất của các liên kết của
					bạn với giải pháp tối giản, an toàn và có độ trễ cực thấp.
				</p>

				<div class="hero-actions animate-fade-in-up delay-3">
					<button
						class="btn btn-primary btn-hero"
						@click="navigateToShorten"
					>
						Rút gọn ngay
						<ChevronRight :size="16" class="btn-icon" />
					</button>
					<button
						class="btn btn-outline btn-hero-secondary"
						@click="navigateToSecondAction"
					>
						{{
							isLoggedIn
								? "Quản lý link"
								: "Tạo tài khoản miễn phí"
						}}
					</button>
				</div>
			</div>
		</section>

		<!-- Trust/Stats Section -->
		<section class="stats-section">
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon-box blue">
						<Link2 :size="20" />
					</div>
					<div class="stat-info">
						<h3 class="stat-number">10M+</h3>
						<p class="stat-label">Liên kết được rút gọn</p>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon-box purple">
						<BarChart3 :size="20" />
					</div>
					<div class="stat-info">
						<h3 class="stat-number">50M+</h3>
						<p class="stat-label">Tổng lượt click ghi nhận</p>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon-box teal">
						<Zap :size="20" />
					</div>
					<div class="stat-info">
						<h3 class="stat-number">99.99%</h3>
						<p class="stat-label">Độ ổn định hệ thống</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section class="features-section">
			<div class="section-header">
				<h2 class="section-title">Tính năng ưu việt</h2>
				<p class="section-subtitle">
					Mọi thứ bạn cần để nâng cao tương tác trực tuyến
				</p>
			</div>

			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon-wrapper p-blue">
						<Zap :size="24" class="feature-icon" />
					</div>
					<h3 class="feature-name">Tốc độ cực nhanh</h3>
					<p class="feature-desc">
						Nhờ hệ thống cache Redis tiên tiến, các liên kết rút gọn
						được phản hồi và chuyển hướng chỉ trong vài mili-giây.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon-wrapper p-purple">
						<BarChart3 :size="24" class="feature-icon" />
					</div>
					<h3 class="feature-name">Thống kê chi tiết</h3>
					<p class="feature-desc">
						Theo dõi thời gian thực lượt truy cập, thiết bị sử dụng,
						vị trí địa lý của người nhấp chuột để tối ưu chiến dịch
						của bạn.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon-wrapper p-teal">
						<Link2 :size="24" class="feature-icon" />
					</div>
					<h3 class="feature-name">Biệt danh tùy chỉnh</h3>
					<p class="feature-desc">
						Tạo các liên kết thương hiệu mang dấu ấn riêng của bạn
						bằng cách tự cấu hình Alias dễ nhớ và chuyên nghiệp.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon-wrapper p-indigo">
						<Shield :size="24" class="feature-icon" />
					</div>
					<h3 class="feature-name">Bảo mật vượt trội</h3>
					<p class="feature-desc">
						Đảm bảo quyền riêng tư và ngăn ngừa các truy cập độc hại
						với cơ chế kiểm soát mã nguồn bảo mật tối đa.
					</p>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="cta-section">
			<div class="cta-card">
				<div class="cta-content">
					<h2>Bắt đầu rút gọn link chuyên nghiệp</h2>
					<p>
						Đăng ký tài khoản để mở khóa toàn bộ sức mạnh của số
						liệu thống kê và quản lý vĩnh viễn các đường link của
						bạn.
					</p>
					<button
						class="btn btn-outline btn-cta"
						@click="navigateToShorten"
					>
						Bắt đầu miễn phí
					</button>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
.landing-page {
	width: 100vw;
	margin-left: calc(-50vw + 50%);
	margin-right: calc(-50vw + 50%);
	background: linear-gradient(180deg, #f0f7ff 0%, #fafcfe 100%);
	margin-top: -40px;
	padding: 40px 24px 80px 24px;
	box-sizing: border-box;
	overflow: hidden;
	color: #0f172a;
}

/* Hero Section */
.hero-section {
	position: relative;
	padding: 50px 24px 80px 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	min-height: 70vh;
}

.hero-glow {
	position: absolute;
	width: 400px;
	height: 400px;
	border-radius: 50%;
	filter: blur(120px);
	opacity: 0.12;
	z-index: 0;
	pointer-events: none;
}

.hero-glow-1 {
	top: -50px;
	left: 10%;
	background: #00b3fa;
}

.hero-glow-2 {
	bottom: 0px;
	right: 10%;
	background: #4261ed;
}

.hero-container {
	position: relative;
	z-index: 1;
	max-width: 900px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* Badge promotion */
.badge-wrapper {
	margin-bottom: 24px;
}

.promo-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: rgba(66, 97, 237, 0.08);
	border: 1px solid rgba(66, 97, 237, 0.15);
	padding: 8px 16px;
	border-radius: 99px;
	font-size: 13px;
	font-weight: 700;
	color: #4261ed;
}

.badge-icon {
	color: #2563eb;
}

/* Hero Title */
.hero-title {
	font-size: 56px;
	font-weight: 800;
	line-height: 1.15;
	letter-spacing: -1.5px;
	color: #0f172a;
	margin-bottom: 24px;
}

.gradient-text {
	background: linear-gradient(135deg, #00b3fa 0%, #1a80e5 50%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
}

.hero-subtitle {
	font-size: 18px;
	color: #475569;
	max-width: 650px;
	line-height: 1.6;
	margin-bottom: 40px;
}

/* Hero Actions */
.hero-actions {
	display: flex;
	gap: 16px;
	justify-content: center;
	flex-wrap: wrap;
}

.btn-hero {
	padding: 14px 28px;
	font-size: 16px;
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.btn-hero-secondary {
	padding: 14px 28px;
	font-size: 16px;
}

.btn-icon {
	transition: transform 0.2s ease;
}

.btn-hero:hover .btn-icon {
	transform: translateX(4px);
}

/* Stats Section */
.stats-section {
	padding: 40px 24px;
}

.stats-grid {
	max-width: 1000px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 32px;
	padding: 8px;
}

.stat-card {
	display: flex;
	align-items: center;
	gap: 20px;
	background: rgba(255, 255, 255, 0.45);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.6);
	border-radius: 20px;
	padding: 24px 28px;
	box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
	transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-card:hover {
	background: rgba(255, 255, 255, 0.75);
	transform: translateY(-4px);
	box-shadow: 0 12px 30px rgba(66, 97, 237, 0.08);
	border-color: rgba(66, 97, 237, 0.2);
}

.stat-icon-box {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon-box {
	transform: scale(1.1) rotate(5deg);
}

.stat-icon-box.blue {
	background: rgba(14, 165, 233, 0.1);
	color: #0ea5e9;
}

.stat-icon-box.purple {
	background: rgba(168, 85, 247, 0.1);
	color: #a855f7;
}

.stat-icon-box.teal {
	background: rgba(20, 184, 166, 0.1);
	color: #14b8a6;
}

.stat-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
	text-align: left;
}

.stat-number {
	font-size: 32px;
	font-weight: 800;
	margin: 0;
	line-height: 1.1;
	background: linear-gradient(135deg, #00b3fa 0%, #1a80e5 50%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.stat-label {
	font-size: 13px;
	color: #64748b;
	font-weight: 600;
	margin: 0;
	text-transform: none;
}

/* Features Section */
.features-section {
	padding: 80px 24px;
}

.section-header {
	text-align: center;
	max-width: 600px;
	margin: 0 auto 60px auto;
}

.section-title {
	font-size: 32px;
	font-weight: 800;
	color: #0f172a;
	margin-bottom: 16px;
}

.section-subtitle {
	font-size: 16px;
	color: #64748b;
}

.features-grid {
	max-width: 1100px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 32px;
}

.feature-card {
	background: rgba(255, 255, 255, 0.45);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.6);
	border-radius: 20px;
	padding: 32px;
	box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
	transition: all 0.3s ease;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.feature-card:hover {
	background: rgba(255, 255, 255, 0.7);
	transform: translateY(-4px);
	box-shadow: 0 12px 40px rgba(66, 97, 237, 0.1);
	border-color: rgba(66, 97, 237, 0.25);
}

.feature-icon-wrapper {
	width: 54px;
	height: 54px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20px;
}

.feature-icon-wrapper.p-blue {
	background: rgba(14, 165, 233, 0.1);
	color: #0ea5e9;
}

.feature-icon-wrapper.p-purple {
	background: rgba(168, 85, 247, 0.1);
	color: #a855f7;
}

.feature-icon-wrapper.p-teal {
	background: rgba(20, 184, 166, 0.1);
	color: #14b8a6;
}

.feature-icon-wrapper.p-indigo {
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
}

.feature-name {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 12px;
}

.feature-desc {
	font-size: 14px;
	color: #64748b;
	line-height: 1.6;
}

/* CTA Section */
.cta-section {
	padding: 80px 24px;
}

.cta-card {
	max-width: 1000px;
	margin: 0 auto;
	background: #1488cc;
	background: -webkit-linear-gradient(to right, #2b32b2, #1488cc);
	background: linear-gradient(to right, #2b32b2, #1488cc);
	border-radius: 20px;
	padding: 64px 32px;
	text-align: center;
	color: white;
	position: relative;
	overflow: hidden;
	box-shadow: 0 20px 50px rgba(99, 102, 241, 0.15);
}

.cta-card::before {
	content: "";
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: radial-gradient(
		circle,
		rgba(99, 102, 241, 0.15) 0%,
		transparent 60%
	);
	pointer-events: none;
	z-index: 0;
}

.cta-content {
	position: relative;
	z-index: 1;
	max-width: 650px;
	margin: 0 auto;
}

.cta-content h2 {
	font-size: 36px;
	font-weight: 800;
	margin-bottom: 16px;
	color: white;
	line-height: 1.25;
	text-transform: none;
	letter-spacing: -0.5px;
}

.cta-content p {
	font-size: 16px;
	color: #cbd5e1;
	margin-bottom: 32px;
	line-height: 1.6;
	text-transform: none;
}

.btn-cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.btn-cta:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 30px rgba(66, 97, 237, 0.55);
	filter: brightness(1.1);
}

.btn-cta:active {
	transform: translateY(0);
}

/* Animations */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-in-up {
	animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-1 {
	animation-delay: 0.1s;
}

.delay-2 {
	animation-delay: 0.2s;
}

.delay-3 {
	animation-delay: 0.3s;
}

/* Responsive */
@media (max-width: 768px) {
	.hero-title {
		font-size: 40px;
	}
	.stats-grid {
		grid-template-columns: 1fr;
		gap: 32px;
		padding: 24px;
	}
	.features-grid {
		grid-template-columns: 1fr;
	}
	.hero-section {
		padding-top: 60px;
	}
}
</style>

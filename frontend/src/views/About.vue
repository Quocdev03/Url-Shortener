<script setup>
import {
	Sparkles,
	Compass,
	Eye,
	Award,
	Zap,
	Shield,
	Github,
	Link2,
	ChevronRight,
} from "lucide-vue-next";
</script>

<template>
	<div class="about-page mesh-background">
		<!-- Glass Background Glow Blobs -->
		<div class="bg-glow about-glow-1"></div>
		<div class="bg-glow about-glow-2"></div>
		<div class="bg-glow about-glow-3"></div>

		<!-- Hero Section -->
		<section class="about-hero animate-fade-in-up">
			<div class="badge-wrapper">
				<span class="promo-badge">
					<Sparkles :size="14" class="badge-icon" />
					Về Chúng Tôi
				</span>
			</div>
			<h1 class="hero-title">
				Kiến Tạo Tương Lai<br />
				<span class="gradient-text">Của Những Liên Kết</span>
			</h1>
			<p class="hero-subtitle">
				URL Shortener mang đến giải pháp rút ngắn liên kết thế hệ mới - nhanh chóng, tối giản, bảo mật và cung cấp phân tích dữ liệu thời gian thực.
			</p>
		</section>

		<!-- Mission & Vision Section -->
		<section class="mission-vision-section">
			<div class="section-grid">
				<div class="mv-card glass-card animate-hover-up">
					<div class="card-icon-wrapper blue">
						<Compass :size="24" />
					</div>
					<h3 class="card-title">Sứ mệnh của chúng tôi</h3>
					<p class="card-desc">
						Đơn giản hóa cách mọi người chia sẻ nội dung số trực tuyến. Chúng tôi biến đổi những đường dẫn dài phức tạp thành các liên kết ngắn gọn, có thương hiệu cá nhân và dễ ghi nhớ, giúp thu hẹp khoảng cách tiếp cận giữa bạn và khách hàng.
					</p>
				</div>

				<div class="mv-card glass-card vision-card animate-hover-up">
					<div class="card-icon-wrapper purple">
						<Eye :size="24" />
					</div>
					<h3 class="card-title">Tầm nhìn chiến lược</h3>
					<p class="card-desc">
						Trở thành nền tảng quản lý liên kết hàng đầu Việt Nam, hỗ trợ đắc lực cho các cá nhân, doanh nghiệp và nhà tiếp thị tối ưu hóa hiệu suất truyền thông thông qua dữ liệu phân tích chi tiết, an toàn tuyệt đối và tốc độ vượt trội.
					</p>
				</div>
			</div>
		</section>

		<!-- Core Values Section -->
		<section class="values-section">
			<div class="section-header">
				<span class="section-badge">Giá trị cốt lõi</span>
				<h2 class="section-title">Nền tảng của sự phát triển</h2>
				<p class="section-subtitle">
					Chúng tôi xây dựng sản phẩm dựa trên các tiêu chí khắt khe nhất để đáp ứng nhu cầu của bạn
				</p>
			</div>

			<div class="values-grid">
				<div class="value-card glass-card animate-hover-up">
					<div class="value-icon-box v-blue">
						<Zap :size="24" />
					</div>
					<h4 class="value-name">Tốc độ cực hạn</h4>
					<p class="value-desc">
						Phản hồi chuyển hướng liên kết chỉ trong vài mili-giây nhờ kiến trúc cache Redis tối ưu và hệ thống máy chủ hiệu năng cao.
					</p>
				</div>

				<div class="value-card glass-card animate-hover-up">
					<div class="value-icon-box v-purple">
						<Award :size="24" />
					</div>
					<h4 class="value-name">Độ tin cậy 99.99%</h4>
					<p class="value-desc">
						Dịch vụ của bạn luôn hoạt động trơn tru 24/7. Hệ thống giám sát tự động đảm bảo liên kết của bạn không bao giờ bị gián đoạn.
					</p>
				</div>

				<div class="value-card glass-card animate-hover-up">
					<div class="value-icon-box v-teal">
						<Shield :size="24" />
					</div>
					<h4 class="value-name">Bảo mật tuyệt đối</h4>
					<p class="value-desc">
						Mã hóa dữ liệu truyền tải, chống thư rác và phát hiện các liên kết độc hại để bảo vệ cả bạn và người nhấp chuột.
					</p>
				</div>
			</div>
		</section>

		<!-- Timeline Section -->
		<section class="timeline-section">
			<div class="section-header">
				<span class="section-badge">Hành trình</span>
				<h2 class="section-title">Lịch sử phát triển</h2>
				<p class="section-subtitle">
					Nhìn lại những cột mốc đáng nhớ trong quá trình hình thành sản phẩm
				</p>
			</div>

			<div class="timeline-container">
				<div class="timeline-line"></div>

				<div class="timeline-item left">
					<div class="timeline-dot"></div>
					<div class="timeline-content glass-card animate-hover-up">
						<span class="timeline-date">Q1 / 2026</span>
						<h4 class="timeline-title">Khởi đầu ý tưởng</h4>
						<p class="timeline-desc">
							Bắt đầu thiết kế kiến trúc hệ thống và xây dựng cơ sở dữ liệu rút gọn link đầu tiên với mục tiêu tối ưu hóa tốc độ chuyển hướng.
						</p>
					</div>
				</div>

				<div class="timeline-item right">
					<div class="timeline-dot"></div>
					<div class="timeline-content glass-card animate-hover-up">
						<span class="timeline-date">Q2 / 2026</span>
						<h4 class="timeline-title">Ra mắt bản thử nghiệm</h4>
						<p class="timeline-desc">
							Phát hành phiên bản Beta cho phép người dùng tự do rút gọn link và quản lý lịch sử cơ bản trên trình duyệt.
						</p>
					</div>
				</div>

				<div class="timeline-item left">
					<div class="timeline-dot"></div>
					<div class="timeline-content glass-card animate-hover-up">
						<span class="timeline-date">Q3 / 2026</span>
						<h4 class="timeline-title">Nâng cấp UI/UX Glassmorphic</h4>
						<p class="timeline-desc">
							Tái cấu trúc toàn bộ giao diện người dùng theo phong cách thiết kế kính mờ cao cấp, tích hợp Dashboard thống kê thời gian thực và quản lý tài khoản dạng Tab.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Creators Section -->
		<section class="creators-section">
			<div class="creator-card glass-card">
				<div class="creator-avatar">
					<span>Q</span>
				</div>
				<div class="creator-info">
					<span class="creator-role">Nhà Phát Triển</span>
					<h3 class="creator-name">Quocdev03</h3>
					<p class="creator-bio">
						Đam mê phát triển các ứng dụng web hiệu năng cao, tối giản giao diện và đem lại trải nghiệm người dùng mượt mà nhất. Người xây dựng và duy trì dự án URL Shortener.
					</p>
					<div class="creator-links">
						<a href="https://github.com/Quocdev03" target="_blank" class="creator-link-btn">
							<Github :size="16" />
							<span>GitHub Profile</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
.about-glow-1 {
	top: 10%;
	left: 15%;
	width: 450px;
	height: 450px;
	background: radial-gradient(circle, rgba(14, 165, 233, 0.5) 0%, rgba(37, 99, 235, 0.1) 100%);
	animation-duration: 20s;
}

.about-glow-2 {
	top: 45%;
	right: 5%;
	width: 500px;
	height: 500px;
	background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(99, 102, 241, 0.1) 100%);
	animation-duration: 28s;
	animation-delay: -5s;
}

.about-glow-3 {
	bottom: 10%;
	left: 10%;
	width: 450px;
	height: 450px;
	background: radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, rgba(14, 165, 233, 0.1) 100%);
	animation-duration: 24s;
	animation-delay: -10s;
}

/* Sections Global */
.about-hero,
.mission-vision-section,
.values-section,
.timeline-section,
.creators-section {
	position: relative;
	z-index: 1;
	max-width: 1100px;
	margin: 0 auto;
}

/* About Hero */
.about-hero {
	padding: 80px 24px 60px 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
}



.badge-icon {
	color: var(--primary);
}

.hero-title {
	font-size: 52px;
	font-weight: var(--font-weight-extrabold);
	line-height: 1.2;
	letter-spacing: -1px;
	color: var(--text-main);
	margin-bottom: 24px;
}

.gradient-text {
	background: var(--primary-gradient);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
}

.hero-subtitle {
	font-size: var(--font-size-lg);
	color: var(--text-muted);
	max-width: 700px;
	line-height: 1.6;
}

/* Mission & Vision */
.mission-vision-section {
	padding: 40px 24px;
}

.section-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 40px;
}

.mv-card {
	padding: 44px 36px;
	text-align: left;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	border: 1px solid rgba(255, 255, 255, 0.6) !important;
	background: rgba(255, 255, 255, 0.45) !important;
}

.mv-card:hover {
	transform: translateY(-6px);
	background: rgba(255, 255, 255, 0.75) !important;
	box-shadow: 0 20px 40px rgba(37, 99, 235, 0.08);
	border-color: rgba(37, 99, 235, 0.25) !important;
}

/* Vision Card Special Gradient border */
.mv-card.vision-card {
	background-image: linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), var(--primary-gradient);
	background-origin: border-box;
	background-clip: padding-box, border-box;
	border: 2px solid transparent !important;
	box-shadow: 0 15px 35px rgba(37, 99, 235, 0.05);
}

.mv-card.vision-card:hover {
	background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), var(--primary-gradient);
	box-shadow: 0 25px 45px rgba(37, 99, 235, 0.15);
}

.card-icon-wrapper {
	width: 52px;
	height: 52px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24px;
}

.card-icon-wrapper.blue {
	background: rgba(14, 165, 233, 0.1);
	color: #0ea5e9;
}

.card-icon-wrapper.purple {
	background: rgba(168, 85, 247, 0.1);
	color: #a855f7;
}

.card-title {
	font-size: 22px;
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	margin-bottom: 16px;
}

.card-desc {
	font-size: 15px;
	color: var(--text-muted);
	line-height: 1.6;
}

/* Values Section */
.values-section {
	padding: 80px 24px;
}



.values-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 32px;
}

.value-card {
	padding: 40px 32px;
	text-align: left;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	border: 1px solid rgba(255, 255, 255, 0.6) !important;
	background: rgba(255, 255, 255, 0.45) !important;
}

.value-card:hover {
	transform: translateY(-8px);
	background: rgba(255, 255, 255, 0.75) !important;
	box-shadow: 0 20px 40px rgba(37, 99, 235, 0.1);
	border-color: rgba(37, 99, 235, 0.25) !important;
}

.value-icon-box {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20px;
}

.value-icon-box.v-blue {
	background: rgba(14, 165, 233, 0.1);
	color: #0ea5e9;
}

.value-icon-box.v-purple {
	background: rgba(168, 85, 247, 0.1);
	color: #a855f7;
}

.value-icon-box.v-teal {
	background: rgba(20, 184, 166, 0.1);
	color: #14b8a6;
}

.value-name {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	margin-bottom: 12px;
}

.value-desc {
	font-size: 14.5px;
	color: var(--text-muted);
	line-height: 1.6;
}

/* Timeline */
.timeline-section {
	padding: 80px 24px;
}

.timeline-container {
	position: relative;
	max-width: 800px;
	margin: 40px auto 0 auto;
	padding: 20px 0;
}

.timeline-line {
	position: absolute;
	left: 50%;
	top: 0;
	bottom: 0;
	width: 2px;
	background: linear-gradient(to bottom, var(--primary-light), var(--primary), var(--primary-light));
	transform: translateX(-50%);
	z-index: 0;
}

.timeline-item {
	display: flex;
	justify-content: flex-end;
	width: 50%;
	position: relative;
	padding: 20px 40px;
	box-sizing: border-box;
}

.timeline-item.left {
	left: 0;
	text-align: right;
}

.timeline-item.right {
	left: 50%;
	justify-content: flex-start;
	text-align: left;
}

.timeline-dot {
	position: absolute;
	right: -8px;
	top: 36px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: white;
	border: 3px solid var(--primary);
	box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
	z-index: 2;
}

.timeline-item.right .timeline-dot {
	left: -8px;
}

.timeline-content {
	padding: 24px;
	max-width: 320px;
	border: 1px solid rgba(255, 255, 255, 0.6) !important;
	background: rgba(255, 255, 255, 0.45) !important;
	transition: all 0.3s ease;
	text-align: left;
}

.timeline-item.left .timeline-content {
	margin-right: auto;
}

.timeline-item.right .timeline-content {
	margin-left: auto;
}

.timeline-date {
	display: inline-block;
	font-size: 12px;
	font-weight: var(--font-weight-bold);
	color: var(--primary);
	margin-bottom: 8px;
}

.timeline-title {
	font-size: var(--font-size-base);
	font-weight: var(--font-weight-bold);
	color: var(--text-main);
	margin-bottom: 8px;
}

.timeline-desc {
	font-size: 13.5px;
	color: var(--text-muted);
	line-height: 1.5;
}

/* Creators Section */
.creators-section {
	padding: 80px 24px;
}

.creator-card {
	max-width: 750px;
	margin: 0 auto;
	padding: 44px;
	display: flex;
	align-items: center;
	gap: 40px;
	text-align: left;
	border: 1px solid rgba(255, 255, 255, 0.6) !important;
	background: rgba(255, 255, 255, 0.45) !important;
	border-radius: 20px;
}

.creator-avatar {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: var(--primary-gradient);
	color: white;
	font-size: 40px;
	font-weight: var(--font-weight-extrabold);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 10px 25px rgba(37, 99, 235, 0.25);
	border: 3px solid white;
}

.creator-info {
	display: flex;
	flex-direction: column;
}

.creator-role {
	font-size: 12px;
	font-weight: var(--font-weight-bold);
	color: var(--primary);
	text-transform: uppercase;
	letter-spacing: 1px;
	margin-bottom: 4px;
}

.creator-name {
	font-size: 24px;
	font-weight: var(--font-weight-extrabold);
	color: var(--text-main);
	margin-bottom: 12px;
}

.creator-bio {
	font-size: 14.5px;
	color: var(--text-muted);
	line-height: 1.6;
	margin-bottom: 24px;
}

.creator-links {
	display: flex;
	gap: 16px;
}

.creator-link-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: #0f172a;
	color: white;
	padding: 10px 20px;
	border-radius: 8px;
	text-decoration: none;
	font-size: 13.5px;
	font-weight: var(--font-weight-semibold);
	transition: all 0.25s ease;
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.creator-link-btn:hover {
	background: #1e293b;
	transform: translateY(-2px);
	box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
}

/* Animations */


/* Responsive */
@media (max-width: 768px) {
	.hero-title {
		font-size: 38px;
	}
	.section-grid {
		grid-template-columns: 1fr;
		gap: 24px;
	}
	.values-grid {
		grid-template-columns: 1fr;
		gap: 24px;
	}
	.timeline-line {
		left: 20px;
	}
	.timeline-item {
		width: 100%;
		padding-left: 45px;
		padding-right: 0;
		text-align: left !important;
	}
	.timeline-item.left {
		left: 0;
	}
	.timeline-item.right {
		left: 0;
	}
	.timeline-dot {
		left: 12px !important;
		right: auto !important;
	}
	.timeline-content {
		max-width: 100%;
	}
	.creator-card {
		flex-direction: column;
		text-align: center;
		padding: 32px;
		gap: 24px;
	}
	.creator-links {
		justify-content: center;
	}
}
</style>

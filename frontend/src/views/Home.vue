<script setup>
    import { ref, computed } from "vue";
    import { useAuthStore } from "@/store/auth";
    import { useRouter } from "vue-router";
    import {
        Link2,
        BarChart3,
        Zap,
        Shield,
        ChevronRight,
        Sparkles,
        HelpCircle,
        Check,
        X,
        ChevronDown,
        ArrowRight,
        UserPlus,
        Copy,
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

    // FAQ Interactive State
    const activeFaq = ref(null);
    const toggleFaq = (index) => {
        activeFaq.value = activeFaq.value === index ? null : index;
    };

    const faqs = [
        {
            question: "Rút gọn liên kết tại đây có mất phí không?",
            answer: "Hoàn toàn miễn phí 100%. Bạn có thể rút gọn liên kết nhanh chóng và không giới hạn mà không cần chi trả bất kỳ khoản chi phí nào.",
        },
        {
            question: "Các liên kết rút gọn tồn tại trong bao lâu?",
            answer: "Các liên kết được tạo ra sẽ tồn tại vĩnh viễn trên hệ thống, trừ khi bạn đặt thời hạn hết hạn cụ thể hoặc chủ động xóa chúng trong trang quản lý tài khoản của mình.",
        },
        {
            question:
                "Sự khác biệt giữa Khách truy cập và Thành viên đăng ký là gì?",
            answer: "Khách truy cập chỉ có thể rút gọn link cơ bản và lưu lịch sử tạm thời trên thiết bị hiện tại. Trong khi đó, Thành viên đăng ký sẽ được miễn phí cấu hình biệt danh (Alias) tự chọn, sở hữu dashboard quản lý danh sách link vĩnh viễn và theo dõi biểu đồ thống kê chi tiết theo thời gian thực.",
        },
        {
            question: "Hệ thống thống kê lượt click hoạt động như thế nào?",
            answer: "Khi có người dùng nhấp vào link rút gọn của bạn, hệ thống sẽ tự động xử lý và lưu trữ dữ liệu thống kê theo thời gian thực (Real-time). Bạn có thể xem ngay lập tức các thay đổi về số lượt click, nguồn thiết bị và quốc gia của khách truy cập trên Dashboard cá nhân.",
        },
    ];
</script>

<template>
    <div class="landing-page mesh-background">
        <!-- Glass Background Glow Blobs -->
        <div class="bg-glow bg-glow-1"></div>
        <div class="bg-glow bg-glow-2"></div>
        <div class="bg-glow bg-glow-3"></div>
        <div class="bg-glow bg-glow-4"></div>
        <div class="bg-glow bg-glow-5"></div>

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
                        class="btn btn-primary btn-lg"
                        @click="navigateToShorten"
                    >
                        Rút gọn ngay
                        <ChevronRight :size="16" class="btn-icon" />
                    </button>
                    <button
                        class="btn btn-outline btn-lg"
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
                <div class="stat-card glass-card">
                    <div class="stat-icon-box blue">
                        <Link2 :size="20" />
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-number">10M+</h3>
                        <p class="stat-label">Liên kết được rút gọn</p>
                    </div>
                </div>
                <div class="stat-card glass-card">
                    <div class="stat-icon-box purple">
                        <BarChart3 :size="20" />
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-number">50M+</h3>
                        <p class="stat-label">Tổng lượt click ghi nhận</p>
                    </div>
                </div>
                <div class="stat-card glass-card">
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

        <!-- How It Works Section -->
        <section class="how-it-works-section">
            <div class="section-header">
                <span class="section-badge">Quy trình</span>
                <h2 class="section-title">Rút gọn link chỉ với 3 bước</h2>
                <p class="section-subtitle">
                    Đơn giản, trực quan và tối ưu hóa thời gian của bạn
                </p>
            </div>

            <div class="steps-grid">
                <div class="step-card glass-card">
                    <div class="step-number-box">
                        <span class="step-number">01</span>
                    </div>
                    <div class="step-icon-wrapper blue">
                        <Copy :size="24" />
                    </div>
                    <h3 class="step-name">Dán link gốc</h3>
                    <p class="step-desc">
                        Sao chép liên kết dài cần rút gọn và dán trực tiếp vào ô
                        nhập liệu ở trang rút gọn.
                    </p>
                </div>

                <div class="step-card glass-card">
                    <div class="step-number-box">
                        <span class="step-number">02</span>
                    </div>
                    <div class="step-icon-wrapper purple">
                        <Zap :size="24" />
                    </div>
                    <h3 class="step-name">Tùy chỉnh cấu hình</h3>
                    <p class="step-desc">
                        Đặt biệt danh (Alias) gợi nhớ, thêm mật khẩu bảo vệ hoặc
                        chọn thời gian tự động hết hạn.
                    </p>
                </div>

                <div class="step-card glass-card">
                    <div class="step-number-box">
                        <span class="step-number">03</span>
                    </div>
                    <div class="step-icon-wrapper teal">
                        <BarChart3 :size="24" />
                    </div>
                    <h3 class="step-name">Chia sẻ & Theo dõi</h3>
                    <p class="step-desc">
                        Sao chép link ngắn chia sẻ lên mạng xã hội và theo dõi
                        các thống kê lượt click trực tiếp.
                    </p>
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
                <div class="feature-card glass-card">
                    <div class="feature-icon-wrapper p-blue">
                        <Zap :size="24" class="feature-icon" />
                    </div>
                    <h3 class="feature-name">Tốc độ cực nhanh</h3>
                    <p class="feature-desc">
                        Nhờ hệ thống cache Redis tiên tiến, các liên kết rút gọn
                        được phản hồi và chuyển hướng chỉ trong vài mili-giây.
                    </p>
                </div>

                <div class="feature-card glass-card">
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

                <div class="feature-card glass-card">
                    <div class="feature-icon-wrapper p-teal">
                        <Link2 :size="24" class="feature-icon" />
                    </div>
                    <h3 class="feature-name">Biệt danh tùy chỉnh</h3>
                    <p class="feature-desc">
                        Tạo các liên kết thương hiệu mang dấu ấn riêng của bạn
                        bằng cách tự cấu hình Alias dễ nhớ và chuyên nghiệp.
                    </p>
                </div>

                <div class="feature-card glass-card">
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

        <!-- Pricing/Benefits Section -->
        <section class="pricing-section">
            <div class="section-header">
                <span class="section-badge">Tính năng so sánh</span>
                <h2 class="section-title">Chọn giải pháp phù hợp với bạn</h2>
                <p class="section-subtitle">
                    Mở khóa toàn bộ sức mạnh quản lý liên kết hoàn toàn miễn phí
                </p>
            </div>

            <div class="pricing-grid">
                <!-- Guest Card -->
                <div class="pricing-card glass-card">
                    <div class="pricing-card-header">
                        <h3 class="plan-name">Khách truy cập</h3>
                        <p class="plan-desc">
                            Dành cho nhu cầu rút gọn nhanh không thường xuyên.
                        </p>
                        <div class="plan-price">
                            <span class="price-value">Miễn phí</span>
                        </div>
                    </div>

                    <div class="pricing-card-features">
                        <div class="feature-item">
                            <Check :size="16" class="icon-check" />
                            <span>Rút gọn link cơ bản</span>
                        </div>
                        <div class="feature-item">
                            <Check :size="16" class="icon-check" />
                            <span>Lưu lịch sử tạm thời trên thiết bị</span>
                        </div>
                        <div class="feature-item disabled">
                            <X :size="16" class="icon-x" />
                            <span>Biệt danh tùy chỉnh (Alias)</span>
                        </div>
                        <div class="feature-item disabled">
                            <X :size="16" class="icon-x" />
                            <span>Thống kê chi tiết (Analytics)</span>
                        </div>
                    </div>

                    <div class="pricing-card-action">
                        <button
                            class="btn btn-outline w-100"
                            @click="navigateToShorten"
                        >
                            Trải nghiệm ngay
                        </button>
                    </div>
                </div>

                <!-- Member Card (Premium / Recommended) -->
                <div class="pricing-card featured">
                    <div class="featured-badge">Khuyên dùng</div>
                    <div class="pricing-card-header">
                        <h3 class="plan-name">Thành viên đăng ký</h3>
                        <p class="plan-desc">
                            Dành cho cá nhân muốn quản lý và phân tích chuyên
                            sâu.
                        </p>
                        <div class="plan-price">
                            <span class="price-value">Miễn phí</span>
                            <span class="price-sub">khi tạo tài khoản</span>
                        </div>
                    </div>

                    <div class="pricing-card-features">
                        <div class="feature-item">
                            <Check :size="16" class="icon-check" />
                            <span
                                ><strong>Rút gọn không giới hạn</strong> số
                                lượng</span
                            >
                        </div>
                        <div class="feature-item">
                            <Check :size="16" class="icon-check" />
                            <span
                                ><strong>Tùy chỉnh biệt danh (Alias)</strong>
                                thương hiệu</span
                            >
                        </div>
                        <div class="feature-item">
                            <Check :size="16" class="icon-check" />
                            <span
                                ><strong
                                    >Dashboard quản lý vĩnh viễn</strong
                                ></span
                            >
                        </div>
                        <div class="feature-item">
                            <Check :size="16" class="icon-check" />
                            <span
                                ><strong
                                    >Thống kê chi tiết Real-time</strong
                                ></span
                            >
                        </div>
                    </div>

                    <div class="pricing-card-action">
                        <button
                            class="btn btn-primary w-100 btn-glow"
                            @click="navigateToSecondAction"
                        >
                            <UserPlus :size="16" class="btn-icon-left" />
                            {{
                                isLoggedIn
                                    ? "Vào Dashboard"
                                    : "Đăng ký miễn phí"
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section">
            <div class="section-header">
                <span class="section-badge">Hỗ trợ</span>
                <h2 class="section-title">Câu hỏi thường gặp</h2>
                <p class="section-subtitle">
                    Giải đáp các thắc mắc phổ biến nhất khi sử dụng dịch vụ rút
                    gọn liên kết
                </p>
            </div>

            <div class="faq-accordion">
                <div
                    v-for="(faq, index) in faqs"
                    :key="index"
                    class="faq-item glass-card"
                    :class="{ active: activeFaq === index }"
                    @click="toggleFaq(index)"
                >
                    <div class="faq-question">
                        <span>{{ faq.question }}</span>
                        <ChevronDown :size="18" class="faq-chevron" />
                    </div>
                    <div class="faq-answer-wrapper">
                        <div class="faq-answer">
                            <p>{{ faq.answer }}</p>
                        </div>
                    </div>
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
                        class="btn btn-outline btn-lg btn-cta"
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
    /* Hero Section */
    .hero-section {
        position: relative;
        z-index: 1;
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
        background: var(--primary);
    }

    .hero-glow-2 {
        bottom: 0px;
        right: 10%;
        background: var(--primary-hover);
    }

    .hero-container {
        position: relative;
        z-index: 1;
        max-width: 900px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .badge-icon {
        color: var(--primary);
    }

    /* Hero Title */
    .hero-title {
        font-size: 56px;
        font-weight: var(--font-weight-extrabold);
        line-height: 1.15;
        letter-spacing: -1.5px;
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

    .btn-icon {
        transition: transform 0.2s ease;
    }

    .hero-actions .btn:hover .btn-icon {
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
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        background: rgba(255, 255, 255, 0.45) !important;
    }

    .stat-card:hover {
        background: rgba(255, 255, 255, 0.85) !important;
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(37, 99, 235, 0.1);
        border-color: rgba(37, 99, 235, 0.35) !important;
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
        font-weight: var(--font-weight-extrabold);
        margin: 0;
        line-height: 1.1;
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .stat-label {
        font-size: 13px;
        color: var(--text-muted);
        font-weight: var(--font-weight-semibold);
        margin: 0;
        text-transform: none;
    }

    /* Features Section */
    .features-section {
        padding: 80px 24px;
    }

    .features-grid {
        max-width: 1100px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;
    }

    .feature-card {
        padding: 32px;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        background: rgba(255, 255, 255, 0.45) !important;
    }

    .feature-card:hover {
        background: rgba(255, 255, 255, 0.8) !important;
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(37, 99, 235, 0.15);
        border-color: rgba(37, 99, 235, 0.35) !important;
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
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--text-main);
        margin-bottom: 12px;
    }

    .feature-desc {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        line-height: 1.6;
    }

    /* CTA Section */
    .cta-section {
        position: relative;
        z-index: 1;
        padding: 80px 24px;
    }

    .cta-card {
        max-width: 1000px;
        margin: 0 auto;
        background: linear-gradient(
            135deg,
            rgba(43, 50, 178, 0.7) 0%,
            rgba(20, 136, 204, 0.7) 100%
        );
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 20px;
        padding: 64px 32px;
        text-align: center;
        color: white;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(37, 99, 235, 0.15);
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
        font-weight: var(--font-weight-extrabold);
        margin-bottom: 16px;
        color: white;
        line-height: 1.25;
        text-transform: none;
        letter-spacing: -0.5px;
    }

    .cta-content p {
        font-size: var(--font-size-base);
        color: #cbd5e1;
        margin-bottom: 32px;
        line-height: 1.6;
        text-transform: none;
    }

    .btn-cta {
        background: white;
        color: var(--primary);
        border-color: white;
        transition: all 0.3s ease;
    }

    .btn-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
        background: rgba(255, 255, 255, 0.9);
        color: var(--primary-hover);
        border-color: rgba(255, 255, 255, 0.9);
    }

    .btn-cta:active {
        transform: translateY(0);
    }

    /* How It Works Section */
    .how-it-works-section {
        padding: 80px 24px;
        position: relative;
        z-index: 1;
    }

    .steps-grid {
        max-width: 1100px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        position: relative;
    }

    .step-card {
        position: relative;
        padding: 40px 32px 32px 32px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        background: rgba(255, 255, 255, 0.45) !important;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: hidden;
    }

    .step-card:hover {
        transform: translateY(-8px);
        background: rgba(255, 255, 255, 0.75) !important;
        box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12);
        border-color: rgba(37, 99, 235, 0.3) !important;
    }

    .step-number-box {
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 80px;
        font-weight: var(--font-weight-extrabold);
        color: rgba(37, 99, 235, 0.05);
        user-select: none;
        line-height: 1;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .step-card:hover .step-number-box {
        color: rgba(37, 99, 235, 0.12);
        transform: scale(1.1) translate(-10px, 10px);
    }

    .step-icon-wrapper {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        transition: transform 0.3s ease;
    }

    .step-card:hover .step-icon-wrapper {
        transform: scale(1.1) rotate(5deg);
    }

    .step-icon-wrapper.blue {
        background: rgba(14, 165, 233, 0.1);
        color: #0ea5e9;
    }

    .step-icon-wrapper.purple {
        background: rgba(168, 85, 247, 0.1);
        color: #a855f7;
    }

    .step-icon-wrapper.teal {
        background: rgba(20, 184, 166, 0.1);
        color: #14b8a6;
    }

    .step-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--text-main);
        margin-bottom: 12px;
    }

    .step-desc {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        line-height: 1.6;
    }

    /* Pricing / Benefits Section */
    .pricing-section {
        padding: 80px 24px;
        position: relative;
        z-index: 1;
    }

    .pricing-grid {
        max-width: 900px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
        align-items: stretch;
    }

    .pricing-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 44px 36px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        height: 100%;
        position: relative;
    }

    .pricing-card:not(.featured) {
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        background: rgba(255, 255, 255, 0.45) !important;
    }

    .pricing-card:not(.featured):hover {
        transform: translateY(-6px);
        background: rgba(255, 255, 255, 0.75) !important;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
        border-color: rgba(37, 99, 235, 0.2) !important;
    }

    /* Premium Gradient Border glass card for Featured plan */
    .pricing-card.featured {
        position: relative;
        border-radius: 16px;
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        background-image:
            linear-gradient(
                rgba(255, 255, 255, 0.75),
                rgba(255, 255, 255, 0.75)
            ),
            var(--primary-gradient);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        border: 2px solid transparent !important;
        box-shadow: 0 15px 35px rgba(37, 99, 235, 0.12);
        transform: scale(1.03);
    }

    .pricing-card.featured:hover {
        transform: translateY(-8px) scale(1.03);
        box-shadow: 0 25px 50px rgba(37, 99, 235, 0.22);
    }

    .featured-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: var(--primary);
        color: white;
        font-size: 11px;
        font-weight: var(--font-weight-bold);
        padding: 4px 10px;
        border-radius: 99px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }

    .pricing-card-header {
        margin-bottom: 24px;
    }

    .plan-name {
        font-size: 20px;
        font-weight: var(--font-weight-bold);
        color: var(--text-main);
        margin-bottom: 8px;
    }

    .plan-desc {
        font-size: 13.5px;
        color: var(--text-muted);
        line-height: 1.4;
        margin-bottom: 20px;
    }

    .plan-price {
        display: flex;
        flex-direction: column;
    }

    .price-value {
        font-size: 36px;
        font-weight: var(--font-weight-extrabold);
        color: var(--primary);
        line-height: 1;
    }

    .price-sub {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
    }

    .pricing-card-features {
        margin-bottom: 36px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: var(--text-main);
        text-align: left;
    }

    .feature-item.disabled {
        color: var(--text-disabled);
    }

    .icon-check {
        color: var(--success);
        flex-shrink: 0;
    }

    .icon-x {
        color: var(--danger);
        flex-shrink: 0;
    }

    .pricing-card-action {
        width: 100%;
    }

    .w-100 {
        width: 100%;
    }

    .btn-icon-left {
        margin-right: 8px;
    }

    /* FAQ Accordion Section */
    .faq-section {
        padding: 80px 24px;
        position: relative;
        z-index: 1;
    }

    .faq-accordion {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .faq-item {
        padding: 20px 24px;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        background: rgba(255, 255, 255, 0.45) !important;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        gap: 0;
        border-radius: 14px;
    }

    .faq-item:hover {
        background: rgba(255, 255, 255, 0.7) !important;
        border-color: rgba(37, 99, 235, 0.25) !important;
        transform: translateY(-2px);
    }

    .faq-item.active {
        background: rgba(255, 255, 255, 0.8) !important;
        border-color: rgba(37, 99, 235, 0.35) !important;
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.05);
    }

    .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-base);
        color: var(--text-main);
        user-select: none;
        text-align: left;
        gap: 16px;
    }

    .faq-chevron {
        color: var(--text-muted);
        transition:
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            color 0.3s ease;
        flex-shrink: 0;
    }

    .faq-item.active .faq-chevron {
        transform: rotate(180deg);
        color: var(--primary);
    }

    /* Premium smooth height animation using grid-template-rows */
    .faq-answer-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
    }

    .faq-item.active .faq-answer-wrapper {
        grid-template-rows: 1fr;
    }

    .faq-answer {
        min-height: 0;
        transition: padding 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .faq-answer p {
        font-size: 14.5px;
        color: var(--text-muted);
        line-height: 1.6;
        padding-top: 12px;
        margin: 0;
        text-align: left;
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
        .steps-grid {
            grid-template-columns: 1fr;
            gap: 24px;
        }
        .pricing-grid {
            grid-template-columns: 1fr;
            gap: 32px;
        }
        .pricing-card.featured {
            transform: none;
        }
        .pricing-card.featured:hover {
            transform: translateY(-6px);
        }
    }
</style>

<script setup>
    import { ref, onMounted, onUnmounted } from "vue";
    import { useAuthStore } from "@/store/auth";
    import { useRouter } from "vue-router";
    import { toast } from "vue3-toastify";
    import logo from "../assets/logo/logo.svg";
    import {
        Home,
        User,
        BarChart3,
        Settings,
        LogOut,
        Link2,
    } from "@lucide/vue";

    const authStore = useAuthStore();
    const router = useRouter();

    const showDropdown = ref(false);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        showDropdown.value = !showDropdown.value;
    };

    const closeDropdown = () => {
        showDropdown.value = false;
    };

    const handleLogoutClick = async () => {
        closeDropdown();
        await authStore.logout();
        toast.success("Logged out successfully!");
        router.push("/");
    };

    onMounted(() => {
        window.addEventListener("click", closeDropdown);
    });

    onUnmounted(() => {
        window.removeEventListener("click", closeDropdown);
    });
</script>
<template>
    <header class="header-main">
        <div class="header-logo">
            <router-link to="/">
                <img :src="logo" alt="" />
            </router-link>
        </div>

        <!-- Menu điều hướng chính -->
        <nav class="header-nav">
            <router-link to="/" class="nav-link" exact-active-class="active">
                Trang chủ
            </router-link>
            <router-link to="/about" class="nav-link" active-class="active">
                Giới thiệu
            </router-link>
            <router-link to="/shorten" class="nav-link" active-class="active">
                Rút gọn link
            </router-link>
            <router-link
                v-if="authStore.isAuthenticated"
                to="/analytics"
                class="nav-link"
                active-class="active"
            >
                Thống kê
            </router-link>
            <router-link
                v-if="
                    authStore.isAuthenticated &&
                    authStore.user?.role === 'admin'
                "
                to="/admin"
                class="nav-link"
                active-class="active"
            >
                Quản trị
            </router-link>
        </nav>

        <div class="header-auth">
            <div
                v-if="!authStore.isAuthenticated"
                class="header-unauthenticated"
            >
                <router-link to="/login" class="btn btn-primary">
                    Đăng nhập
                </router-link>
                <router-link to="/register" class="btn btn-outline">
                    Đăng ký
                </router-link>
            </div>
            <!-- Đã đăng nhập -->
            <div v-else class="header-authenticated">
                <div class="user-menu-container">
                    <button
                        @click="toggleDropdown"
                        class="user-avatar-trigger"
                        title="Tài khoản"
                    >
                        <div class="avatar-circle">
                            {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                        </div>
                        <span class="chevron-icon">▼</span>
                    </button>

                    <!-- Dropdown Menu -->
                    <div
                        v-if="showDropdown"
                        class="user-dropdown-menu"
                        @click.stop
                    >
                        <div class="dropdown-header">
                            <span
                                class="dropdown-email"
                                :title="authStore.user?.email"
                            >
                                {{ authStore.user?.email }}
                            </span>
                            <span
                                :class="[
                                    'role-badge-mini',
                                    authStore.user?.role === 'admin'
                                        ? 'role-admin'
                                        : 'role-user',
                                ]"
                            >
                                {{
                                    authStore.user?.role === "admin"
                                        ? "Admin"
                                        : "Member"
                                }}
                            </span>
                        </div>
                        <div class="dropdown-divider"></div>

                        <router-link
                            to="/"
                            class="dropdown-item"
                            @click="closeDropdown"
                        >
                            <Home :size="16" class="item-icon" /> Trang chủ
                        </router-link>

                        <router-link
                            to="/shorten"
                            class="dropdown-item"
                            @click="closeDropdown"
                        >
                            <Link2 :size="16" class="item-icon" /> Rút gọn link
                        </router-link>

                        <router-link
                            to="/profile"
                            class="dropdown-item"
                            @click="closeDropdown"
                        >
                            <User :size="16" class="item-icon" /> Trang cá nhân
                        </router-link>

                        <router-link
                            to="/analytics"
                            class="dropdown-item"
                            @click="closeDropdown"
                        >
                            <BarChart3 :size="16" class="item-icon" /> Thống kê
                        </router-link>

                        <router-link
                            v-if="authStore.user?.role === 'admin'"
                            to="/admin"
                            class="dropdown-item"
                            @click="closeDropdown"
                        >
                            <Settings :size="16" class="item-icon" /> Quản trị
                            hệ thống
                        </router-link>

                        <div class="dropdown-divider"></div>

                        <button
                            @click="handleLogoutClick"
                            class="dropdown-item logout-item"
                        >
                            <LogOut :size="16" class="item-icon" /> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);
        padding: 15px 35px;
        height: 75px;
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
        border-bottom: 1px solid var(--border-color);
    }
    .header-auth {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
    }

    .header-unauthenticated {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }

    .header-unauthenticated > * {
        text-decoration: none;
    }

    .header-authenticated {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .header-logo > a > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Navigation Menu */
    .header-nav {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .nav-link {
        font-size: 15px;
        font-weight: var(--font-weight-semibold);
        color: var(--text-muted);
        text-decoration: none;
        padding: 15px 18px;
        border-radius: 6px;
        transition: all 0.25s ease;
    }

    .nav-link:hover {
        color: var(--text-main);
        background: rgba(15, 23, 42, 0.04);
    }

    .nav-link.active {
        color: var(--primary);
        background: var(--primary-light);
    }

    /* User Profile dropdown menu styling */
    .user-menu-container {
        position: relative;
    }

    .user-avatar-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px;
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: 50%;
        transition: transform 0.2s ease;
    }

    .user-avatar-trigger:hover {
        transform: scale(1.05);
    }

    .avatar-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--primary-gradient);
        color: white;
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-base);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(37, 99, 235, 0.25);
        border: 2px solid white;
    }

    .chevron-icon {
        font-size: 10px;
        color: var(--text-muted);
        transition: transform 0.25s ease;
    }

    .user-avatar-trigger:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }

    .user-dropdown-menu {
        position: absolute;
        top: 50px;
        right: 0;
        width: 220px;
        background: var(--bg-card);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 14px;
        box-shadow: var(--shadow-lg);
        padding: 8px;
        z-index: 100;
        animation: slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideDownFade {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .dropdown-header {
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .dropdown-email {
        font-size: 13px;
        font-weight: var(--font-weight-bold);
        color: var(--text-main);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .role-badge-mini {
        font-size: 10px;
        font-weight: var(--font-weight-bold);
        padding: 2px 6px;
        border-radius: 20px;
        width: fit-content;
    }

    .role-badge-mini.role-user {
        background: var(--primary-light);
        color: var(--primary);
    }

    .role-badge-mini.role-admin {
        background: var(--danger-light);
        color: var(--danger);
    }

    .dropdown-divider {
        height: 1px;
        background: var(--border-color);
        margin: 6px 0;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--secondary);
        text-decoration: none;
        border-radius: 8px;
        width: 100%;
        text-align: left;
        transition: all 0.2s ease;
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .dropdown-item:hover {
        background: rgba(15, 23, 42, 0.04);
        color: var(--text-main);
    }

    .dropdown-item.logout-item {
        color: var(--danger);
    }

    .dropdown-item.logout-item:hover {
        background: var(--danger-light);
        color: var(--danger);
    }

    .item-icon {
        font-size: 16px;
    }

    /* Mobile responsive styles */
    @media screen and (max-width: 768px) {
        .header-main {
            padding: 15px 20px;
        }
        .header-nav {
            gap: 8px;
        }
        .nav-link {
            padding: 6px 12px;
            font-size: var(--font-size-sm);
        }

        .header-logo > a > img {
            max-width: 200px;
        }
    }

    @media screen and (max-width: 576px) {
        .header-nav {
            display: none;
        }
    }
</style>

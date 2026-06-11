<script setup>
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import logo from "../assets/logo/logo.svg";
import avatar from "../assets/image/user.png";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
	await authStore.logout();
	toast.success("Logged out successfully!");
	router.push("/");
};

const handleProfileClick = () => {
	router.push("/profile");
};
</script>
<template>
	<header class="header-main">
		<div class="header-logo">
			<router-link to="/">
				<img :src="logo" alt="" />
			</router-link>
		</div>

		<!-- Menu điều hướng chính khi đã đăng nhập -->
		<nav v-if="authStore.isAuthenticated" class="header-nav">
			<router-link to="/" class="nav-link" exact-active-class="active">
				Trang chủ
			</router-link>
			<router-link to="/analytics" class="nav-link" active-class="active">
				Thống kê
			</router-link>
			<router-link v-if="authStore.user?.role === 'admin'" to="/admin" class="nav-link" active-class="active">
				Quản trị
			</router-link>
		</nav>

		<div class="header-auth">
			<div
				v-if="!authStore.isAuthenticated"
				class="header-unauthenticated"
			>
				<router-link to="/login" class="btn btn-primary">
					Login
				</router-link>
				<router-link to="/register" class="btn btn-outline">
					Sign Up
				</router-link>
			</div>
			<!-- Đã đăng nhập -->
			<div v-else class="header-authenticated">
				<div @click="handleProfileClick" class="user-profile-pill" title="Trang cá nhân">
					<img :srcset="`${avatar} 2x`" alt="Avatar" class="user-avatar-img" />
					<span class="user-email-text">{{ authStore.user?.email }}</span>
				</div>
				<button @click="handleLogout" class="btn btn-outline">
					Logout
				</button>
			</div>
		</div>
	</header>
</template>

<style scoped>
.header-main {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
	padding: 15px 35px;
	height: 75px;
	background-color: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
	border-bottom: 1px solid #dadee0;
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

/* Navigation Menu */
.header-nav {
	display: flex;
	align-items: center;
	gap: 20px;
}

.nav-link {
	font-size: 15px;
	font-weight: 600;
	color: #64748b;
	text-decoration: none;
	padding: 8px 16px;
	border-radius: 12px;
	transition: all 0.25s ease;
}

.nav-link:hover {
	color: #0f172a;
	background: rgba(15, 23, 42, 0.04);
}

.nav-link.active {
	color: #4261ed;
	background: rgba(66, 97, 237, 0.08);
}

/* User Profile Badge Capsule */
.user-profile-pill {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 14px 6px 6px;
	background: rgba(255, 255, 255, 0.65);
	border: 1px solid rgba(226, 232, 240, 0.8);
	border-radius: 30px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.user-profile-pill:hover {
	background: rgba(255, 255, 255, 0.95);
	border-color: rgba(66, 97, 237, 0.4);
	box-shadow: 0 4px 12px rgba(66, 97, 237, 0.08);
	transform: translateY(-1px);
}

.user-avatar-img {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid white;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-email-text {
	font-size: 13px;
	font-weight: 600;
	color: #475569;
	max-width: 140px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	transition: color 0.3s ease;
}

.user-profile-pill:hover .user-email-text {
	color: #0f172a;
}

/* Mobile responsive styles */
@media screen and (max-width: 768px) {
	.header-main {
		padding: 15px 20px;
	}
	.user-email-text {
		display: none;
	}
	.user-profile-pill {
		padding: 4px;
	}
	.header-nav {
		gap: 8px;
	}
	.nav-link {
		padding: 6px 12px;
		font-size: 14px;
	}
}

@media screen and (max-width: 480px) {
	.nav-link:first-child {
		display: none; /* Hide 'Trang chủ' since logo links to '/' */
	}
	.header-nav {
		gap: 4px;
	}
}
</style>

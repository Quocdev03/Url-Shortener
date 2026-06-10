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
				<span class="user-email">{{ authStore.user?.email }}</span>
				<button
					@click="handleProfileClick"
					class="header-avatar"
					title="View Profile"
				>
					<img :srcset="`${avatar} 2x`" alt="Avatar" />
				</button>
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

.user-email {
	font-size: 14px;
	color: #64748b;
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.header-avatar {
	width: 40px;
	height: 40px;
	flex-shrink: 0;
	cursor: pointer;
	border: none;
	background: none;
	padding: 0;
	border-radius: 50%;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.header-avatar:hover {
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.header-avatar img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	object-fit: cover;
}
@media screen and (max-width: 767.98px) {
	.user-email {
		display: none;
	}
}
@media screen and (max-width: 374.98px) {
}
</style>

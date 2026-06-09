<script setup>
import { ref } from "vue";
import logo from "../assets/icon/logo.svg";
import avatar from "../assets/icon/user.png";
const unauthenticated = ref(true);
</script>
<template>
	<header class="header-main">
		<div class="header-logo">
			<router-link to="/">
				<img :src="logo" alt="" />
			</router-link>
		</div>
		<div class="header-auth">
			<div v-if="unauthenticated == true" class="header-unauthenticated">
				<router-link to="/login" class="btn btn-primary"
					>Login</router-link
				>
				<router-link to="/register" class="btn btn-outline"
					>Sign Up</router-link
				>
			</div>
			<div v-else class="header-unauthorized">
				<router-link to="/logout" class="btn btn-outline"
					>Logout</router-link
				>
				<div class="header-unauthorized-avt">
					<img :srcset="`${avatar} 2x`" alt="" />
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
	margin-bottom: 20px;
	padding: 15px 35px;
	height: 75px;
	background-color: var(--primary-bg);
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
.header-unauthorized > * {
	text-decoration: none;
}
.header-unauthorized {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10px;
}
.header-unauthorized {
	display: flex;
	align-items: center;
	gap: 12px;
}

.header-unauthorized-avt {
	width: 40px;
	height: 40px;
	flex-shrink: 0;
	cursor: pointer;
}

.header-unauthorized-avt img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	object-fit: cover;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.header-unauthorized-avt img:hover {
	transform: scale(1.08);
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>

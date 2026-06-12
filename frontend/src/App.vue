<script setup>
import { useRouter } from "vue-router";
import { useLoadingStore } from "@/store/loading";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import PageLoader from "./components/PageLoader.vue";

const router = useRouter();
const loadingStore = useLoadingStore();

router.beforeEach((to, from, next) => {
	loadingStore.startLoading();
	next();
});

router.afterEach(() => {
	loadingStore.stopLoading();
});
</script>

<template>
	<PageLoader :active="loadingStore.isLoading" text="Đang tải trang..." />
	<Header />
	<main class="app-main">
		<router-view />
	</main>
	<Footer />
</template>


<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
	<Header />
	<main class="app-main">
		<router-view />
	</main>
	<Footer />
</template>

<style scoped></style>

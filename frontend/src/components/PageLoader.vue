<script setup>
defineProps({
	active: {
		type: Boolean,
		default: false,
	},
});
</script>

<template>
	<Transition name="fade">
		<div v-if="active" class="page-loader-overlay">
			<div class="skeleton-page">
				<!-- Mocks header -->
				<header class="skeleton-header">
					<div class="skeleton skeleton-logo"></div>
					<div class="skeleton-nav">
						<div class="skeleton skeleton-nav-item"></div>
						<div class="skeleton skeleton-nav-item"></div>
						<div class="skeleton skeleton-nav-item"></div>
					</div>
					<div class="skeleton skeleton-avatar"></div>
				</header>
				
				<!-- Mocks main content -->
				<main class="skeleton-content">
					<div class="skeleton skeleton-title"></div>
					<div class="skeleton skeleton-subtitle"></div>
					
					<div class="skeleton-grid">
						<div class="skeleton-card" v-for="n in 3" :key="n">
							<div class="skeleton skeleton-card-title"></div>
							<div class="skeleton skeleton-card-text"></div>
							<div class="skeleton skeleton-card-text short"></div>
						</div>
					</div>
				</main>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.page-loader-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: var(--bg-main);
	z-index: 9999;
	padding: 0 var(--space-6);
	box-sizing: border-box;
}

.skeleton-page {
	max-width: 1200px;
	margin: 0 auto;
	width: 100%;
}

.skeleton-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 75px;
	border-bottom: 1px solid var(--border-color);
	margin-bottom: var(--space-8);
}

.skeleton-nav {
	display: flex;
	gap: var(--space-4);
}

@keyframes skeleton-pulse {
	0% {
		background-color: rgba(0, 0, 0, 0.05);
	}
	50% {
		background-color: rgba(0, 0, 0, 0.1);
	}
	100% {
		background-color: rgba(0, 0, 0, 0.05);
	}
}

.skeleton {
	animation: skeleton-pulse 1.5s ease-in-out infinite;
	border-radius: 6px;
	background-color: rgba(0, 0, 0, 0.05);
}

.skeleton-logo {
	width: 120px;
	height: 32px;
}

.skeleton-nav-item {
	width: 80px;
	height: 20px;
}

.skeleton-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
}

.skeleton-content {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
	padding: var(--space-8) 0;
}

.skeleton-title {
	width: 300px;
	height: 48px;
	margin-bottom: var(--space-2);
}

.skeleton-subtitle {
	width: 500px;
	height: 24px;
	margin-bottom: var(--space-8);
}

.skeleton-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--space-6);
}

.skeleton-card {
	background: #ffffff;
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: var(--space-6);
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.skeleton-card-title {
	width: 120px;
	height: 24px;
	margin-bottom: var(--space-2);
}

.skeleton-card-text {
	width: 100%;
	height: 16px;
}

.skeleton-card-text.short {
	width: 60%;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

@media (max-width: 768px) {
	.skeleton-nav {
		display: none;
	}
	.skeleton-grid {
		grid-template-columns: 1fr;
	}
	.skeleton-subtitle {
		width: 100%;
	}
}
</style>

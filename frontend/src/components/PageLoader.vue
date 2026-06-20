<script setup>
defineProps({
	active: {
		type: Boolean,
		default: false,
	},
	text: {
		type: String,
		default: "Đang tải dữ liệu...",
	},
});
</script>

<template>
	<Transition name="fade">
		<div v-if="active" class="page-loader-overlay">
			<div class="loader-content">
				<div class="spinner-container">
					<div class="spinner-outer"></div>
					<div class="spinner-inner"></div>
					<div class="spinner-center">
						<span class="logo-icon">⚡</span>
					</div>
				</div>
				<p class="loader-text">{{ text }}</p>
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
	background: rgba(250, 252, 254, 0.75);
	backdrop-filter: var(--glass-blur);
	-webkit-backdrop-filter: var(--glass-blur);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999; /* Higher than header and footer */
}

.loader-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
}

.spinner-container {
	position: relative;
	width: 80px;
	height: 80px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.spinner-outer {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 3px solid transparent;
	border-top-color: var(--primary);
	border-bottom-color: #00c0fa;
	border-radius: 50%;
	animation: rotateClockwise 1.5s cubic-bezier(0.53, 0.21, 0.29, 0.82) infinite;
	filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.4));
	will-change: transform;
}

.spinner-inner {
	position: absolute;
	width: 75%;
	height: 75%;
	border: 3px solid transparent;
	border-left-color: var(--primary-hover);
	border-right-color: #00b3fa;
	border-radius: 50%;
	animation: rotateCounterClockwise 1.2s cubic-bezier(0.53, 0.21, 0.29, 0.82) infinite;
	filter: drop-shadow(0 0 3px rgba(0, 192, 250, 0.3));
	will-change: transform;
}

.spinner-center {
	width: 40%;
	height: 40%;
	background: white;
	border-radius: 50%;
	box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
	display: flex;
	justify-content: center;
	align-items: center;
	animation: pulseCenter 1.5s ease-in-out infinite;
}

.logo-icon {
	font-size: 16px;
	background: var(--primary-gradient);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	font-weight: bold;
}

.loader-text {
	font-family: "Manrope", sans-serif;
	font-size: 14px;
	font-weight: var(--font-weight-bold);
	color: var(--primary);
	margin: 0;
	text-transform: capitalize;
	animation: fadePulse 1.5s ease-in-out infinite;
}

/* Animations */
@keyframes rotateClockwise {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes rotateCounterClockwise {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(-360deg);
	}
}

@keyframes pulseCenter {
	0%, 100% {
		transform: scale(1);
		box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
	}
	50% {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
	}
}

@keyframes fadePulse {
	0%, 100% {
		opacity: 0.6;
	}
	50% {
		opacity: 1;
	}
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>

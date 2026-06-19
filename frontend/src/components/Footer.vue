<script setup>
import logo from "../assets/logo/icon-only.svg";
</script>
<template>
	<footer class="footer">
		<div class="footer-container">
			<div class="footer-brand">
				<router-link to="/" class="footer-logo">
					<img :src="logo" alt="Logo URL Shortener" />
				</router-link>
				<p class="footer-copyright">
					&copy; 2026 <span>URL Shortener</span>. Built with passion.
				</p>
			</div>

			<div class="footer-links">
				<router-link to="/">Trang chủ</router-link>
				<router-link to="/shorten">Rút gọn link</router-link>
				<a href="https://github.com/Quocdev03" target="_blank">
					Github
				</a>
			</div>
		</div>
	</footer>
</template>
<style scoped>
.footer {
	width: 100%;
	background-color: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border-top: 1px solid rgba(226, 232, 240, 0.7);
	padding: 16px 0;
	position: fixed;
	bottom: 0;
	left: 0;
	z-index: 1000;
}

.footer-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;
}

/* Brand */
.footer-brand {
	display: flex;
	align-items: center;
	gap: 10px;
}

.footer-logo {
	display: flex;
	align-items: center;
}

.footer-logo img {
	object-fit: contain;
	transition: transform 0.2s ease;
}

.footer-logo:hover img {
	transform: scale(1.08) rotate(-4deg);
}

.footer-copyright {
	font-size: 13.5px;
	color: #64748b;
	margin: 0;
	line-height: 1.4;
}

.footer-copyright span {
	font-weight: 600;
	background: linear-gradient(135deg, #00c0fa 0%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

/* Links */
.footer-links {
	display: flex;
	align-items: center;
	gap: 20px;
}

.footer-links a {
	position: relative;
	font-size: 14px;
	color: #64748b;
	text-decoration: none;
	font-weight: 500;
	transition: color 0.2s ease;
}

.footer-links a:not(:last-child)::after {
	content: "";
	position: absolute;
	right: -10px;
	top: 50%;
	transform: translateY(-50%);
	width: 1px;
	height: 12px;
	background-color: #cbd5e1;
}

.footer-links a:hover {
	color: #4261ed;
}

/* Responsive */
@media (max-width: 600px) {
	.footer-container {
		flex-direction: column;
		text-align: center;
		gap: 10px;
		padding: 0 16px;
	}

	.footer-links {
		gap: 16px;
	}

	.footer-links a:not(:last-child)::after {
		right: -8px;
	}
}
</style>

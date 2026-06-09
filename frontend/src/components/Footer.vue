<template>
	<footer class="footer">
		<div class="footer-container">
			<p class="footer-copyright">
				&copy; 2026 <span>URL Shortener</span>. Built with passion.
			</p>

			<div class="footer-links">
				<router-link to="/">Trang chủ</router-link>
				<a href="#" target="_blank">API Docs</a>
				<a href="https://github.com/Quocdev03" target="_blank">Github</a>
			</div>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	width: 100%;
	background-color: #ffffff;
	border-top: 1px solid #e2e8f0;
	padding: 20px 0;
	margin-top: auto; /* Đẩy footer xuống đáy nếu nội dung trang ít */
}

.footer-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
}

.footer-copyright {
	font-size: 14px;
	color: #64748b;
	margin: 0;
}

.footer-copyright span {
	font-weight: 600;
	background: linear-gradient(135deg, #00c0fa 0%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.footer-links {
	display: flex;
	gap: 20px;
}

.footer-links a {
	font-size: 14px;
	color: #64748b;
	text-decoration: none;
	transition: color 0.2s ease;
	font-weight: 500;
}

.footer-links a:hover {
	color: #4261ed;
}

/* Responsive cho điện thoại */
@media (max-width: 480px) {
	.footer-container {
		flex-direction: column;
		text-align: center;
		gap: 8px;
	}
}
</style>

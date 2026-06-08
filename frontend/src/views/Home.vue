<script setup></script>

<template>
	<main class="home">
		<div class="home-container">
			<h1 class="home-title">URL Shortener</h1>

			<div class="home-input">
				<input type="text" placeholder="Enter a long URL to shorten" />
			</div>
			<span class="home-example">Example: https://www.google.com</span>

			<button class="btn btn-primary home-btn">Shorten URL</button>

			<div class="home-result">
				<h2>Shortened URL</h2>
				<div class="home-result-url">
					<span>https://short.url/abcd123</span>
				</div>
			</div>
		</div>
	</main>
</template>

<style scoped>
/* Căn giữa toàn bộ trang */
.home {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 1rem;
}

/* Tạo khối (card) chứa nội dung */
.home-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 12px;
	background: #ffffff;
	padding: 40px;
	border-radius: 16px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
	width: 100%;
	max-width: 450px;
}

.home-title {
	font-weight: 800;
	font-size: 35px;
	line-height: 40px;
	background: linear-gradient(135deg, #00c0fa 0%, #1a80e5 50%, #4261ed 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	color: transparent;
	margin-bottom: 12px;
}

/* Style cho Input */
.home-input {
	width: 100%;
}

.home-input input {
	width: 100%;
	padding: 14px 16px;
	font-size: 15px;
	color: #333;
	border: 2px solid #e2e8f0;
	border-radius: 10px;
	outline: none;
	transition:
		border-color 0.3s ease,
		box-shadow 0.3s ease;
}

.home-input input:focus {
	border-color: #4261ed;
	box-shadow: 0 0 0 3px rgba(66, 97, 237, 0.15);
}

.home-input input::placeholder {
	color: #94a3b8;
}

.home-example {
	font-size: 13px;
	color: #64748b;
	align-self: flex-start;
	margin-bottom: 15px;
}

.home-btn {
	width: 100%;
	padding: 14px;
	font-size: 16px;
	font-weight: 600;
}

.home-result {
	width: 100%;
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.home-result h2 {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
	text-align: center;
}

.home-result-url {
	background-color: #f1f5f9;
	padding: 14px;
	border-radius: 10px;
	border: 1px dashed #cbd5e1;
	text-align: center;
	color: #4261ed;
	font-weight: 500;
	font-size: 15px;
	word-break: break-all;
}
</style>

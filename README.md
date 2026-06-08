# 🔗 URL Shortener API

REST API rút gọn URL với xác thực JWT, phân quyền, Redis caching và analytics.

**Tech Stack:** Node.js 20 · Express.js · MySQL 8 · Redis 7 · Docker

---

## ⭐ Tính năng

- **URL rút gọn** — Hỗ trợ alias tùy chỉnh, thời gian hết hạn, cả public lẫn authenticated
- **Authentication** — Đăng ký, đăng nhập, refresh token, logout, đổi mật khẩu
- **JWT + Token Rotation** — Access & refresh token, revoke theo từng thiết bị hoặc tất cả
- **Phân quyền (RBAC)** — Admin thấy tất cả URL, user chỉ thấy URL của mình
- **Analytics** — Theo dõi clicks, IP, user agent, referer
- **Redis Cache** — Cache URL redirect, click counter, rate limiting
- **Rate Limiting** — Sliding window, cấu hình theo từng endpoint

---

## 📋 Yêu cầu

- **Docker & Docker Compose** _(khuyến nghị)_
- **Node.js 20+** _(nếu chạy local)_

---

## 🏗️ Kiến trúc

```
Request
   ↓
[Middleware: Auth · Rate Limit]
   ↓
[Controller] — nhận request, trả response
   ↓
[Service] — business logic
   ↓
[Repository] — truy vấn database
   ↓
[MySQL / Redis]
```

### Cấu trúc project

```
url-shortener/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── url.controller.js
│   ├── database/
│   │   ├── init.js
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   └── index.js
│   ├── repositories/
│   │   ├── user.repository.js
│   │   └── url.repository.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── url.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── url.service.js
│   └── utils/
│       ├── errors.js
│       ├── logger.js
│       └── validators.js
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## 🔧 Cấu hình môi trường

Tạo file `.env` từ `.env.example` và điều chỉnh các cấu hình. `docker-compose.yml` sẽ tự động nạp cấu hình từ file `.env` này qua `env_file`.

```env
# Server
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=urlshortener

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Authentication
JWT_SECRET=supersecretkey
PASSWORD_PEPPER=your-pepper-secret
BCRYPT_SALT_ROUNDS=12

# Token expiration
ACCESS_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

> **Production:** `JWT_SECRET` và `PASSWORD_PEPPER` phải là các chuỗi ngẫu nhiên có độ dài tối thiểu 32 ký tự. Không được commit file `.env` lên Git.

---

## 📊 Dữ liệu mẫu

Khi khởi động lần đầu, database tự động seed 2 tài khoản:

| Email               | Mật khẩu    | Role  |
| ------------------- | ----------- | ----- |
| `admin@example.com` | `secret123` | admin |
| `user@example.com`  | `secret123` | user  |

---

## 🔐 Bảo mật

### Password Hashing

```
password + PASSWORD_PEPPER  →  bcrypt.hash(12 rounds)  →  lưu vào DB
```

Pepper không lưu trong DB, tăng độ phức tạp brute-force và giảm nguy cơ rainbow table.

### Access Control

| Loại       | Yêu cầu                         |
| ---------- | ------------------------------- |
| Public     | Không cần token                 |
| Protected  | `Authorization: Bearer <token>` |
| Admin only | Token có role `admin`           |

### Rate Limiting (sliding window qua Redis)

Tracking:

- **Authenticated users** — Per user ID
- **Public requests** — Per IP address

| Endpoint                     | Giới hạn   |
| ---------------------------- | ---------- |
| `POST /api/v1/urls` (public) | 5 req/60s  |
| `POST /api/v1/urls/auth`     | 30 req/60s |

**Response headers:**

- `X-RateLimit-Limit` — Giới hạn requests
- `X-RateLimit-Remaining` — Requests còn lại
- `X-RateLimit-Reset` — Thời gian reset

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api/v1`

---

### 🔐 Auth

#### Đăng ký

```
POST /auth/register
```

```json
{ "email": "user@example.com", "password": "secret123" }
```

`201 Created`

```json
{
	"success": true,
	"message": "User registered successfully",
	"data": { "user": { "id": 1, "email": "user@example.com", "role": "user" } }
}
```

#### Đăng nhập

```
POST /auth/login
```

```json
{ "email": "user@example.com", "password": "secret123" }
```

`200 OK`

```json
{
	"success": true,
	"data": {
		"accessToken": "eyJ...",
		"refreshToken": "eyJ...",
		"tokenType": "Bearer",
		"expiresIn": "7d"
	}
}
```

#### Refresh Token

```
POST /auth/refresh
```

```json
{ "refreshToken": "<REFRESH_TOKEN>" }
```

Trả về `accessToken` và `refreshToken` mới (token cũ bị revoke ngay).

#### Lấy Profile

```
GET /auth/profile
Authorization: Bearer <ACCESS_TOKEN>
```

#### Đổi mật khẩu

```
PATCH /auth/password
Authorization: Bearer <ACCESS_TOKEN>
```

```json
{ "currentPassword": "secret123", "newPassword": "newpass456" }
```

Sau khi đổi mật khẩu, tất cả refresh token của user bị revoke.

#### Logout

```
POST /auth/logout
Authorization: Bearer <ACCESS_TOKEN>
```

```json
{ "refreshToken": "<REFRESH_TOKEN>" }
```

---

### 🔗 URL

#### Tạo URL — Public

```
POST /urls
```

```json
{
	"originalUrl": "https://github.com",
	"customAlias": "gh",
	"expiresAt": "2026-12-31T23:59:59Z"
}
```

`201 Created`

```json
{
	"success": true,
	"data": {
		"id": 5,
		"code": "gh",
		"shortUrl": "http://localhost:3000/gh",
		"originalUrl": "https://github.com/",
		"customAlias": "gh",
		"expiresAt": "2026-12-31T23:59:59Z"
	}
}
```

#### Tạo URL — Authenticated

```
POST /urls/auth
Authorization: Bearer <ACCESS_TOKEN>
```

Body giống endpoint public. URL được gắn với user hiện tại. Rate limit cao hơn (30/60s vs 10/60s).

#### Danh sách URL

```
GET /urls
Authorization: Bearer <ACCESS_TOKEN>
```

**Query params:** `page`, `limit`, `search`, `sortBy` (`created_at`|`expires_at`|`code`|`original`), `order` (`asc`|`desc`), `expired` (`true`|`false`)

Admin thấy tất cả URL, user chỉ thấy URL của mình.

#### Chi tiết URL

```
GET /urls/:id
Authorization: Bearer <ACCESS_TOKEN>
```

#### Cập nhật URL

```
PATCH /urls/:id
Authorization: Bearer <ACCESS_TOKEN>
```

```json
{ "originalUrl": "https://google.com", "expiresAt": "2026-12-31T23:59:59Z" }
```

> `customAlias` không thể thay đổi sau khi tạo.

#### Xóa URL

```
DELETE /urls/:id
Authorization: Bearer <ACCESS_TOKEN>
```

#### Thống kê Click

```
GET /urls/:id/stats
Authorization: Bearer <ACCESS_TOKEN>
```

```json
{
	"success": true,
	"data": {
		"url": { "id": 5, "code": "gh", "original": "https://github.com/" },
		"totalClicks": 42,
		"cacheClicks": 10,
		"recentClicks": [
			{
				"ip": "1.2.3.4",
				"userAgent": "...",
				"referer": "twitter.com",
				"clickedAt": "..."
			}
		]
	}
}
```

#### Redirect (Public)

```
GET /:code
```

`302 Redirect` → Original URL. Ưu tiên Redis cache, fallback MySQL. Ghi analytics bất đồng bộ.

---

### 📊 Analytics

#### Danh sách Analytics (Admin only)

```
GET /analytic/
Authorization: Bearer <ACCESS_TOKEN>
```

**Query params:** `page`, `limit`, `search`, `sortBy` (`clicked_at`|`ip`|`url_id`), `order` (`asc`|`desc`), `urlId` (lọc theo URL)

```json
{
	"success": true,
	"data": [
		{
			"id": 1,
			"urlId": 5,
			"code": "gh",
			"originalUrl": "https://github.com",
			"ip": "1.2.3.4",
			"userAgent": "Mozilla/5.0...",
			"referer": "twitter.com",
			"clickedAt": "2026-06-08T10:30:00Z"
		}
	],
	"meta": {
		"page": 1,
		"limit": 20,
		"total": 100,
		"totalPages": 5
	}
}
```

---

## 💡 Ví dụ sử dụng

```bash
# 1. Đăng nhập và lấy token
TOKEN=$(curl -sX POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}' \
  | jq -r '.data.accessToken')

# 2. Tạo URL rút gọn
curl -X POST http://localhost:3000/api/v1/urls/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"originalUrl":"https://github.com","customAlias":"gh"}'

# 3. Redirect
curl -I http://localhost:3000/gh
# HTTP/1.1 302 Found
# Location: https://github.com/

# 4. Xem thống kê
curl http://localhost:3000/api/v1/urls/1/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

**Container không start**

```bash
docker compose logs app
docker compose up --build
```

**Database connection error**

```bash
docker compose ps                                                    # kiểm tra health
docker compose exec mysql mysql -u root -psecret urlshortener -e "SELECT 1"
```

**Redis error**

```bash
docker compose exec redis redis-cli ping
```

**Login không work**

```bash
docker compose exec mysql mysql -u root -psecret urlshortener -e "SELECT email FROM users"
docker compose exec app npm run seed   # re-seed nếu cần
```

---

## 📦 Commands

### Docker

```bash
docker compose up --build          # Build và khởi chạy
docker compose up                  # Khởi chạy (không rebuild)
docker compose down                # Dừng
docker compose down -v             # Dừng và xóa volumes
docker compose down -v --remove-orphans  # Xóa sạch hoàn toàn
```

### Logs & Debug

```bash
docker compose logs -f app
docker compose logs -f mysql
docker compose logs -f redis

docker compose exec mysql mysql -u root -psecret urlshortener
docker compose exec redis redis-cli
```

### NPM

```bash
# Trong container
docker compose exec app npm run dev    # Watch mode
docker compose exec app npm run seed   # Seed dữ liệu

# Local (Node 20+)
npm run dev    # nodemon watch
npm run seed   # seed dữ liệu
npm start      # production
```

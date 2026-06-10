# 🔗 URL Shortener

Full-stack URL shortening application với xác thực JWT, phân quyền, Redis caching và analytics.

**Tech Stack:**
- **Backend:** Node.js 20 · Express.js · MySQL 8 · Redis 7
- **Frontend:** Vue 3 · Vite · Vue Router · Pinia
- **Deployment:** Docker & Docker Compose

---

## ⭐ Tính năng

- **URL rút gọn** — Hỗ trợ public (temporary) và authenticated (persistent) URLs
- **Custom Alias** — Người dùng có thể đặt alias tùy chỉnh cho URL rút gọn
- **Expiration** — Hỗ trợ đặt thời gian hết hạn cho URLs
- **Authentication** — Đăng ký, đăng nhập, refresh token, logout, đổi mật khẩu
- **JWT + Token Rotation** — Access & refresh token với one-time use pattern
- **Phân quyền (RBAC)** — Admin thấy tất cả URL, user chỉ thấy URL của mình
- **Analytics** — Theo dõi clicks, IP, user agent, referer cho mỗi URL
- **Redis Cache** — Cache URL redirect, click counter, rate limiting
- **Rate Limiting** — Sliding window, khác nhau cho public vs authenticated
- **Frontend** — Vue 3 dashboard cho user management và URL tracking

---

## 📋 Yêu cầu

- **Docker & Docker Compose** _(khuyến nghị)_
- **Node.js 20+** _(nếu chạy local)_

---

## ⚡ Quick Start

### Với Docker (Recommended)

```bash
# 1. Clone repository
git clone <repo-url>
cd url-shortener

# 2. Khởi chạy services
docker compose up --build

# 3. Truy cập ứng dụng
# Backend API: http://localhost:3000/api/v1
# Frontend: http://localhost:5173
```

### Local Development (Node 20+)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Backend: http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

### Default Credentials

Khi khởi động, database tự động seed 2 tài khoản:

| Email               | Mật khẩu    | Role  |
| ------------------- | ----------- | ----- |
| `admin@example.com` | `secret123` | admin |
| `user@example.com`  | `secret123` | user  |

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
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── url.controller.js
│   │   ├── database/
│   │   │   ├── init.js
│   │   │   └── schema.sql
│   │   ├── middleware/
│   │   ├── repositories/
│   │   │   ├── analytics.repository.js
│   │   │   ├── user.repository.js
│   │   │   └── url.repository.js
│   │   ├── routes/
│   │   │   ├── analytics.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── url.routes.js
│   │   ├── services/
│   │   │   ├── analytics.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── cache.service.js
│   │   │   └── url.service.js
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Vue 3 + Vite
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── style.css
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Footer.vue
│   │   │   ├── Header.vue
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── store/
│   │   │   ├── auth.js
│   │   │   ├── url.js
│   │   │   └── user.js
│   │   └── views/
│   │       └── Home.vue
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
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

##  Bảo mật

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
| `POST /urls` (public)        | 5 req/60s  |
| `POST /urls/auth`            | 30 req/60s |

**Response headers:**

- `X-RateLimit-Limit` — Giới hạn requests
- `X-RateLimit-Remaining` — Requests còn lại
- `X-RateLimit-Reset` — Thời gian reset

---

## 🖥️ Frontend (Vue 3 + Vite)

### Tính năng

- **Home Page** — Tạo short URLs (public hoặc authenticated)
- **Guest Mode** — Lưu URLs vào localStorage (không cần login)
- **Authentication** — Đăng ký, đăng nhập, logout
- **Dashboard** — Quản lý URLs: view, edit, delete
- **State Management** — Pinia stores: auth, url, user
- **Responsive UI** — Tương thích desktop & mobile

### Flows

**Guest User:**
1. Tạo URL public (không lưu DB)
2. URLs lưu vào localStorage
3. Có thể copy short link hoặc xóa

**Authenticated User:**
1. Login với email & password
2. Tạo URL (lưu vào database)
3. Hỗ trợ custom alias & expiration
4. View all URLs + stats
5. Edit/delete URLs
6. Logout

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

`200 OK`

```json
{
	"success": true,
	"message": "Profile retrieved successfully",
	"data": {
		"user": {
			"id": 3,
			"email": "user@example.com",
			"role": "user",
			"createdAt": "2026-06-09T14:44:19.000Z",
			"urls": [
				{
					"id": 1,
					"userId": 3,
					"original": "https://github.com",
					"code": "gh2k3j",
					"customAlias": null,
					"expiresAt": null,
					"createdAt": "2026-06-09T14:45:00.000Z"
				}
			]
		}
	}
}
```

Profile bao gồm danh sách tất cả URLs của user (tối đa 100, sắp xếp theo ngày tạo).

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

#### So sánh Public vs Authenticated URLs

| Tính năng | Public (Guest) | Authenticated |
|----------|----------------|---|
| Tạo URL | ✅ | ✅ |
| Lưu DB | ❌ (Redis cache) | ✅ |
| Custom alias | ❌ | ✅ |
| Expiration | ❌ | ✅ |
| Persistent | ❌ (24h cache) | ✅ |
| View list | ❌ | ✅ |
| Edit/Delete | ❌ | ✅ |
| Analytics | ❌ | ✅ |
| Rate limit | 5/60s | 30/60s |
| Frontend storage | localStorage | Server + Pinia |

#### Tạo URL — Public (Guest)

```
POST /urls
Content-Type: application/json
```

```json
{
	"originalUrl": "https://github.com"
}
```

`201 Created`

```json
{
	"success": true,
	"message": "URL created successfully (temporary, not saved)",
	"data": {
		"id": null,
		"userId": null,
		"code": "a1b2c3d",
		"shortUrl": "http://localhost:3000/a1b2c3d",
		"original": "https://github.com/",
		"customAlias": null,
		"expiresAt": null,
		"createdAt": "2026-06-10T10:00:00.000Z"
	}
}
```

**Lưu ý:**
- URL không được lưu vào database
- Cache trong Redis với TTL 24 giờ
- Frontend tự động lưu vào localStorage cho guest users
- Không hỗ trợ custom alias hoặc expiration date

#### Tạo URL — Authenticated

```
POST /urls/auth
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
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
	"message": "URL created successfully",
	"data": {
		"id": 5,
		"userId": 3,
		"code": "gh",
		"shortUrl": "http://localhost:3000/gh",
		"original": "https://github.com/",
		"customAlias": "gh",
		"expiresAt": "2026-12-31T23:59:59Z",
		"createdAt": "2026-06-10T10:00:00.000Z"
	}
}
```

**Lưu ý:**
- URL được lưu vĩnh viễn vào database
- Gắn với user hiện tại
- Hỗ trợ custom alias (nếu chưa được dùng) và expiration date
- Rate limit cao hơn: 30 req/60s (vs 5 req/60s cho public)

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

#### Thống kê Click của một URL

```
GET /urls/:id/stats
Authorization: Bearer <ACCESS_TOKEN>
```

`200 OK`

```json
{
	"success": true,
	"message": "Stats retrieved successfully",
	"data": {
		"url": {
			"id": 5,
			"code": "gh",
			"original": "https://github.com/",
			"shortUrl": "http://localhost:3000/gh"
		},
		"totalClicks": 42,
		"cacheClicks": 10,
		"recentClicks": [
			{
				"id": 1,
				"urlId": 5,
				"ip": "1.2.3.4",
				"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
				"referer": "twitter.com",
				"clickedAt": "2026-06-10T10:30:00.000Z"
			}
		]
	}
}
```

#### Redirect (Public)

```
GET /:code
```

`302 Found` → Original URL

**Cơ chế:**
1. Kiểm tra cache Redis trước (nhanh)
2. Nếu miss, query MySQL (fallback)
3. Ghi nhận click bất đồng bộ (không chặn response)
4. Tracking: IP, User-Agent, Referer

---

### 📊 Analytics

#### Danh sách Analytics (Admin only)

```
GET /analytics
Authorization: Bearer <ACCESS_TOKEN>
```

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` — Tìm trong IP, user agent, referer
- `sortBy` — `clicked_at`, `ip`
- `order` — `asc`, `desc`
- `urlId` — Lọc theo URL ID

`200 OK`

```json
{
	"success": true,
	"message": "Analytics retrieved successfully",
	"data": [
		{
			"id": 1,
			"urlId": 5,
			"code": "gh",
			"original": "https://github.com",
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

### Backend API

```bash
# 1. Đăng nhập và lấy token
TOKEN=$(curl -sX POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}' \
  | jq -r '.data.accessToken')

# 2. Tạo URL rút gọn (authenticated)
curl -X POST http://localhost:3000/api/v1/urls/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "originalUrl":"https://github.com",
    "customAlias":"gh",
    "expiresAt":"2026-12-31T23:59:59Z"
  }'

# 3. Danh sách URLs của user
curl http://localhost:3000/api/v1/urls \
  -H "Authorization: Bearer $TOKEN"

# 4. Xem stats của một URL
curl http://localhost:3000/api/v1/urls/5/stats \
  -H "Authorization: Bearer $TOKEN"

# 5. Redirect (public - không cần token)
curl -I http://localhost:3000/gh
# HTTP/1.1 302 Found
# Location: https://github.com/
```

### Frontend

1. **Truy cập:** `http://localhost:5173`
2. **Trang chủ:**
   - Guest users: Tạo public URLs (lưu vào localStorage)
   - Authenticated users: Tạo persistent URLs + quản lý danh sách
3. **Login/Register:** Đăng ký tài khoản hoặc đăng nhập
4. **Dashboard:** Xem danh sách URLs, stats, xóa, cập nhật

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
```

---

## 📦 Commands

### Docker (Recommended)

```bash
# Build và khởi chạy tất cả services
docker compose up --build

# Khởi chạy (không rebuild)
docker compose up

# Dừng services
docker compose down

# Xóa volumes (reset database)
docker compose down -v

# Xóa sạch hoàn toàn
docker compose down -v --remove-orphans

# View logs
docker compose logs -f app        # Backend
docker compose logs -f web        # Frontend
docker compose logs -f mysql
docker compose logs -f redis
```

### Local Development (Node 20+)

**Backend:**
```bash
cd backend
npm install
npm run dev    # Watch mode (nodemon)
# Server runs on http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev    # Vite dev server
# Frontend runs on http://localhost:5173
```

### Database Management

```bash
# Access MySQL
docker compose exec mysql mysql -u root -psecret urlshortener

# Access Redis CLI
docker compose exec redis redis-cli

# Check Redis connection
docker compose exec redis redis-cli ping

# View users
docker compose exec mysql mysql -u root -psecret urlshortener -e "SELECT id, email, role FROM users"

# View URLs
docker compose exec mysql mysql -u root -psecret urlshortener -e "SELECT id, user_id, code, custom_alias FROM urls LIMIT 10"
```

### NPM Scripts

**Backend:**
```bash
npm run dev       # Development (watch mode)
npm start         # Production
npm test          # Run tests (if available)
```

**Frontend:**
```bash
npm run dev       # Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Troubleshooting

**Port already in use:**
```bash
# Backend (3000) - Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Frontend (5173) - Kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

**Database connection error:**
```bash
# Check if MySQL is running
docker compose ps
docker compose up -d mysql

# Reset database
docker compose down -v
docker compose up --build
```

**Redis error:**
```bash
# Check Redis connection
docker compose exec redis redis-cli ping

# Restart Redis
docker compose restart redis
```

**Fix Windows Hyper-V networking (if needed):**
```bash
net stop winnat
net start winnat
```

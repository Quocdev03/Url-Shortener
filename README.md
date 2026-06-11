# 🔗 URL Shortener

Full-stack URL shortening application với xác thực JWT, phân quyền, Redis limit api và analytics.

**Tech Stack:**

- **Backend:** Node.js 20 · Express.js · MySQL 8 · Redis 7
- **Frontend:** Vue 3 · Vite · Vue Router · Pinia
- **Deployment:** Docker & Docker Compose

---

## ⭐ Tính năng

- **URL rút gọn** — Hỗ trợ public (temporary) và authenticated (persistent) URLs
- **Custom Alias** — Người dùng có thể đặt alias tùy chỉnh cho URL rút gọn
- **Expiration** — Hỗ trợ đặt thời gian hết hạn cho URLs (bắt buộc khi bật tùy chọn nâng cao)
- **Authentication** — Đăng ký, đăng nhập, refresh token, logout, đổi mật khẩu
- **JWT + Token Rotation** — Access & refresh token với one-time use pattern
- **Phân quyền (RBAC)** — Admin thấy toàn bộ URLs và analytics, user chỉ thấy dữ liệu của mình
- **Analytics Dashboard** — Theo dõi clicks, thiết bị, trình duyệt, OS và referer cho từng URL
- **Xoá URL** — Người dùng có thể xoá link của mình; analytics liên quan được cascade xoá
- **Redis** — rate limiting, quản lý refresh token
- **Rate Limiting** — Sliding window, khác nhau cho public vs authenticated (sử dụng Redis)

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
# Backend API: http://localhost:3001/api/v1
# Frontend:    http://localhost:5174
```

### Local Development (Node 20+)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Backend: http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5174
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
[MySQL]
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
│   │   │   └── index.js        # Axios instance + interceptors
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Expired.vue
│   │   │   ├── Footer.vue
│   │   │   └── Header.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── store/
│   │   │   ├── analytics.js    # Pinia: click logs + filters
│   │   │   ├── auth.js         # Pinia: user session, profile
│   │   │   ├── url.js          # Pinia: URL creation
│   │   │   └── user.js
│   │   ├── utils/
│   │   │   └── uaParser.js     # Client-side UA parser
│   │   └── views/
│   │       ├── Analytics.vue   # Dashboard thống kê
│   │       ├── Home.vue
│   │       ├── Login.vue
│   │       ├── Profile.vue     # Kho link + đổi mật khẩu
│   │       └── Register.vue
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🔧 Cấu hình môi trường

Tạo file `.env` từ `.env.example` và điều chỉnh các cấu hình. `docker-compose.yml` sẽ tự động nạp cấu hình từ file `.env` này.

```env
# Server
NODE_ENV=development
PORT=3001
BASE_URL=http://localhost:3001

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

> **Production:** `JWT_SECRET` và `PASSWORD_PEPPER` phải là các chuỗi ngẫu nhiên có độ dài tối thiểu 32 ký tự. Không commit file `.env` lên Git.

---

## 🔒 Bảo mật

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

| Endpoint              | Giới hạn   | Tracking    |
| --------------------- | ---------- | ----------- |
| `POST /urls` (public) | 5 req/60s  | Per IP      |
| `POST /urls/auth`     | 30 req/60s | Per user ID |

**Response headers:** `X-RateLimit-Limit` · `X-RateLimit-Remaining` · `X-RateLimit-Reset`

---

## 🖥️ Frontend (Vue 3 + Vite)

### Trang & tính năng

| Trang         | Mô tả                                                                 |
| ------------- | --------------------------------------------------------------------- |
| **Home**      | Tạo short URLs; public hoặc authenticated (custom alias + expiration) |
| **Login**     | Đăng nhập bằng email & password                                       |
| **Register**  | Tạo tài khoản mới                                                     |
| **Profile**   | Xem kho link, copy, xoá, xem thống kê, đổi mật khẩu                   |
| **Analytics** | Dashboard thống kê: KPI cards, biểu đồ thiết bị/OS/browser, log       |
| **Expired**   | Trang thông báo khi truy cập link đã hết hạn                          |

### Luồng hoạt động

**Guest User:**

1. Tạo URL public (không lưu DB, cache local)
2. Copy short link ngay sau khi tạo

**Authenticated User:**

1. Login với email & password
2. Tạo URL persistent (lưu database) với custom alias và/hoặc expiration
3. Xem & quản lý kho link tại trang Profile (copy, xoá)
4. Xem dashboard Analytics: tổng click, phân bố thiết bị, lịch sử truy cập
5. Đổi mật khẩu tại trang Profile

---

## 📡 API Reference

**Base URL:** `http://localhost:3001/api/v1`

---

### 🔐 Auth

| Method  | Endpoint         | Auth     | Mô tả                      |
| ------- | ---------------- | -------- | -------------------------- |
| `POST`  | `/auth/register` | —        | Đăng ký tài khoản          |
| `POST`  | `/auth/login`    | —        | Đăng nhập, nhận JWT tokens |
| `POST`  | `/auth/refresh`  | —        | Làm mới access token       |
| `GET`   | `/auth/profile`  | Required | Lấy thông tin user + URLs  |
| `PATCH` | `/auth/password` | Required | Đổi mật khẩu               |
| `POST`  | `/auth/logout`   | Required | Huỷ refresh token          |

#### Đăng nhập — Response

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

#### Profile — Response

Bao gồm danh sách URLs của user kèm `clicks` và `isExpired`:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": 3,
			"email": "user@example.com",
			"role": "user",
			"createdAt": "2026-06-09T14:44:19.000Z",
			"urls": [
				{
					"id": 5,
					"code": "gh",
					"shortUrl": "http://localhost:3001/gh",
					"originalUrl": "https://github.com",
					"customAlias": "gh",
					"expiresAt": "2026-12-31T23:59:59.000Z",
					"createdAt": "2026-06-10T10:00:00.000Z",
					"clicks": 42,
					"isExpired": false
				}
			]
		}
	}
}
```

---

### 🔗 URL

| Method   | Endpoint          | Auth     | Mô tả                        |
| -------- | ----------------- | -------- | ---------------------------- |
| `POST`   | `/urls`           | —        | Tạo URL public (tạm thời)    |
| `POST`   | `/urls/auth`      | Required | Tạo URL persistent           |
| `GET`    | `/urls`           | Required | Danh sách URLs (RBAC)        |
| `GET`    | `/urls/:id`       | Required | Chi tiết URL                 |
| `PATCH`  | `/urls/:id`       | Required | Cập nhật originalUrl/expires |
| `DELETE` | `/urls/:id`       | Required | Xoá URL + cascade analytics  |
| `GET`    | `/urls/:id/stats` | Required | Thống kê click của URL       |

#### So sánh Public vs Authenticated

| Tính năng    | Public (Guest) | Authenticated |
| ------------ | -------------- | ------------- |
| Tạo URL      | ✅             | ✅            |
| Custom alias | ❌             | ✅            |
| Expiration   | ❌             | ✅            |
| Xoá URL      | ❌             | ✅            |
| Analytics    | ❌             | ✅            |
| Rate limit   | 5 req/60s      | 30 req/60s    |

#### Tạo URL Authenticated

```bash
POST /urls/auth
Authorization: Bearer <ACCESS_TOKEN>
```

```json
{
	"originalUrl": "https://github.com",
	"customAlias": "gh",
	"expiresAt": "2026-12-31T23:59:59Z"
}
```

> `customAlias` không thể thay đổi sau khi tạo.

#### Redirect (Public)

```
GET /:code  →  302 Found  →  Original URL
```

**Cơ chế:**

1. Truy vấn MySQL để tìm original URL ứng với code
2. Ghi nhận click bất đồng bộ (không chặn response)
3. Tracking: IP, User-Agent, Referer

---

### 📊 Analytics

```
GET /analytics
Authorization: Bearer <ACCESS_TOKEN>
```

- **User thường** — Chỉ xem analytics của các URL do mình tạo
- **Admin** — Xem toàn bộ analytics hệ thống

**Query params:** `page`, `limit`, `search`, `sortBy` (`clicked_at`|`ip`), `order` (`asc`|`desc`), `urlId`

```json
{
	"success": true,
	"data": [
		{
			"id": 1,
			"urlId": 5,
			"code": "gh",
			"original": "https://github.com",
			"userEmail": "user@example.com",
			"ip": "1.2.3.4",
			"userAgent": "Mozilla/5.0...",
			"referer": "twitter.com",
			"clickedAt": "2026-06-10T10:30:00.000Z"
		}
	],
	"meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

## 💡 Ví dụ sử dụng (curl)

```bash
# 1. Đăng nhập và lấy token
TOKEN=$(curl -sX POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}' \
  | jq -r '.data.accessToken')

# 2. Tạo URL rút gọn (authenticated)
curl -X POST http://localhost:3001/api/v1/urls/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"originalUrl":"https://github.com","customAlias":"gh","expiresAt":"2026-12-31T23:59:59Z"}'

# 3. Danh sách URLs của user
curl http://localhost:3001/api/v1/urls \
  -H "Authorization: Bearer $TOKEN"

# 4. Xem analytics
curl http://localhost:3001/api/v1/analytics \
  -H "Authorization: Bearer $TOKEN"

# 5. Xoá URL
curl -X DELETE http://localhost:3001/api/v1/urls/5 \
  -H "Authorization: Bearer $TOKEN"

# 6. Redirect (không cần token)
curl -I http://localhost:3001/gh
# HTTP/1.1 302 Found
# Location: https://github.com/
```

---

## 📦 Commands

### Docker

```bash
docker compose up --build          # Build và khởi chạy
docker compose up                  # Khởi chạy (không rebuild)
docker compose down                # Dừng services
docker compose down -v             # Dừng + xoá volumes (reset database)
docker compose logs -f app         # Backend logs
docker compose logs -f web         # Frontend logs
```

### Local Development

```bash
# Backend
cd backend && npm install && npm run dev    # http://localhost:3001

# Frontend
cd frontend && npm install && npm run dev  # http://localhost:5174
cd frontend && npm run build               # Production build
```

### Database

```bash
# Access MySQL shell
docker compose exec mysql mysql -u root -psecret urlshortener

# Xem users
docker compose exec mysql mysql -u root -psecret urlshortener \
  -e "SELECT id, email, role FROM users"

# Access Redis CLI
docker compose exec redis redis-cli
docker compose exec redis redis-cli ping
```

---

## 🐛 Troubleshooting

**Container không start:**

```bash
docker compose logs app
docker compose up --build
```

**Database connection error:**

```bash
docker compose ps
docker compose exec mysql mysql -u root -psecret urlshortener -e "SELECT 1"
```

**Redis error:**

```bash
docker compose exec redis redis-cli ping
docker compose restart redis
```

**Login không work:**

```bash
docker compose exec mysql mysql -u root -psecret urlshortener -e "SELECT email FROM users"
```

**Port đang bị chiếm (Linux/macOS):**

```bash
lsof -ti:3001 | xargs kill -9   # Kill port 3001
lsof -ti:5174 | xargs kill -9   # Kill port 5174
```

**Windows Hyper-V networking:**

```bash
net stop winnat && net start winnat
```

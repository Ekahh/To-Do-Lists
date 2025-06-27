# Todo List Application

Aplikasi Todo List yang dikembangkan dengan arsitektur microservice menggunakan React, Node.js, MySQL, Docker, dan RabbitMQ.

# Anggota Kelompok

1. Redrian Alfa Maulana (2210511133)
2. Muhammad Ardy Cahya (2210511145)
3. Muhammmad Haykal Islam Baskoro (2210511149)
4. Noer Fauzan Detya Gulfiar (2210511151)

## Fitur Utama

- ✅ **Autentikasi JWT** dengan Google OAuth
- ✅ **Manajemen Todo** dengan deadline dan prioritas
- ✅ **Kategorisasi Status** (Pending, In Progress, Completed)
- ✅ **Rate Limiting** untuk keamanan API
- ✅ **Message Brokering** dengan RabbitMQ
- ✅ **Docker Support** untuk deployment mudah
- ✅ **Postman Integration** untuk testing API

## Teknologi yang Digunakan

### Backend

- Node.js dengan Express
- MySQL Database
- RabbitMQ Message Broker
- JWT Authentication
- Rate Limiting
- Helmet Security

### Frontend

- React 18
- Material-UI
- Axios untuk HTTP requests
- Date-fns untuk date handling

## Struktur Project

```
To-Do-Lists/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React Components
│   │   └── context/        # React Context
│   └── .env
│   └── Dockerfile
│   └── nginx.conf
│   └── package-lock.json
│   └── package.json
├── server/                 # Node.js Backend
│   ├── config/             # Database & Passport config
│   ├── controllers/        # Route controllers
│   ├── database/           # Konfigurasi database & init.sql
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # External services (RabbitMQ)
│   └── .env
│   └── Dockerfile
│   └── package-lock.json
│   └── package.json
│   └── server.js
├── docker-compose.yml      # Docker configuration
└── README.md
```

## Instalasi dan Setup

### Prasyarat

- Docker Desktop
- Node.js 18+
- MySQL 8.0+
- RabbitMQ 3.8+

### Cara 1: Menggunakan Docker (Rekomendasi)

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd To-Do-Lists
   ```

2. **Buat file environment variable untuk backend**

   Buat file `.env` di folder `server/` dengan contoh isi:

   ```env
   DB_HOST=db
   DB_USER=appuser
   DB_PASSWORD=appuser
   DB_NAME=todo_app
   RABBITMQ_URL=amqp://rabbitmq
   JWT_SECRET=todo_app_secret_key_2024
   CLIENT_URL=http://localhost:3000
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
   GOOGLE_CLIENT_ID=isi_dengan_client_id_google
   GOOGLE_CLIENT_SECRET=isi_dengan_client_secret_google
   NODE_ENV=development
   DB_CONNECTION_LIMIT=10
   DB_ACQUIRE_TIMEOUT=60000
   DB_TIMEOUT=60000
   ```

   > **Catatan:** Untuk development, Anda bisa menggunakan credential Google OAuth dummy jika hanya ingin testing lokal.

3. **Jalankan dengan Docker Compose**

   ```bash
   docker-compose up --build
   ```

4. **Akses aplikasi**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

### Cara 2: Jalankan Secara Lokal (Development)

1. **Setup Database**

   ```bash
   # Install MySQL dan buat database serta tabel
   mysql -u root -p < server/database/init.sql
   ```

2. **Setup RabbitMQ**

   - Install RabbitMQ (default credentials: guest/guest)

3. **Setup Backend**

   ```bash
   cd server
   npm install
   # Buat file .env seperti contoh di atas
   node server.js
   ```

4. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm start
   ```
   > **Catatan:** Jika ingin mengubah URL backend, buat file `.env` di folder `client/` dan tambahkan:
   >
   > ```env
   > REACT_APP_API_URL=http://localhost:5000
   > ```

## API Endpoints

### Authentication

- `POST /auth/token` - Get JWT token for Postman
- `GET /auth/me` - Get current user info
- `GET /auth/google` - Google OAuth login
- `GET /auth/logout` - Logout

### Todos

- `GET /todos` - Get all todos (with optional status filter)
- `GET /todos/:id` - Get specific todo
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `PATCH /todos/:id/status` - Update todo status
- `DELETE /todos/:id` - Delete todo
- `GET /todos/stats/summary` - Get todo statistics

## Testing dengan Postman

### 1. Mendapatkan JWT Token

**Request:**

```
POST http://localhost:5000/auth/token
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Response:**

```json
{
  "message": "Token generated successfully",
  "token": "<jwt_token>",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### 2. Menggunakan Token di Request

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 3. Contoh Request Todo

**Create Todo:**

```
POST http://localhost:5000/todos
{
  "title": "Complete project",
  "description": "Finish the todo application",
  "deadline": "2024-01-15T10:00:00.000Z",
  "priority": "high"
}
```

**Update Todo:**

```
PUT http://localhost:5000/todos/1
{
  "title": "Updated title",
  "description": "Updated description",
  "deadline": "2024-01-20T10:00:00.000Z",
  "priority": "medium",
  "status": "in_progress"
}
```

**Update Status:**

```
PATCH http://localhost:5000/todos/1/status
{
  "status": "completed"
}
```

## Database Schema

Lihat file `server/database/init.sql` untuk skema lengkap. Tabel utama:

- `users`
- `todos`
- (opsional) `categories`, `todo_categories`

## RabbitMQ Queues

Aplikasi menggunakan RabbitMQ untuk message brokering dengan queues berikut:

- `todo.created` - Ketika todo baru dibuat
- `todo.updated` - Ketika todo diupdate
- `todo.deleted` - Ketika todo dihapus
- `todo.completed` - Ketika todo diselesaikan

## Rate Limiting

- **Auth Routes**: 5 requests per 15 menit
- **API Routes**: 10 requests per 15 menit
- **Create Todo**: 10 requests per menit

## Security Features

- JWT Authentication dengan expiry 24 jam
- Rate limiting untuk mencegah abuse
- Helmet.js untuk security headers
- CORS configuration
- Input validation dan sanitization
- SQL injection protection dengan parameterized queries

## Development

### Scripts

**Backend:**

```bash
node server.js
```

**Frontend:**

```bash
npm start        # Development server
```

### Environment Variables

**Backend:** Lihat contoh pada bagian setup di atas.

**Frontend:** (opsional, jika ingin override API URL)

```env
DB_HOST=db
DB_USER=appuser
DB_PASSWORD=appuser
DB_NAME=todo_app
RABBITMQ_URL=amqp://rabbitmq
JWT_SECRET=todo_app_secret_key_2024
CLIENT_URL=http://localhost:3000
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
GOOGLE_CLIENT_ID=69608340603-r5o6p7jvuq39i0ng1kj1g9sltfr1h043.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NODE_ENV=development
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
REACT_APP_API_URL=http://localhost:5000
```

## Troubleshooting

### Common Issues

#### 1. "Error creating todo" Error

**Kemungkinan Penyebab:**

- Database tidak terhubung
- Tabel tidak ada
- User tidak terautentikasi
- Environment variables tidak diset

**Solusi:**

```bash
# 1. Periksa database connection
# 2. Setup database jika belum
mysql -u root -p < server/database/init.sql
# 3. Periksa .env file di folder server
cat server/.env
# 4. Restart server
cd server
npm run dev
```

#### 2. Database Connection Error

- Pastikan MySQL berjalan
- Periksa credentials di .env file
- Pastikan database `todo_app` sudah dibuat

#### 3. RabbitMQ Connection Error

- Pastikan RabbitMQ berjalan
- Periksa credentials (default: guest/guest)
- Periksa port 5672 tidak terblokir

#### 4. JWT Token Error

- Pastikan JWT_SECRET sudah diset
- Periksa token tidak expired
- Pastikan format Authorization header benar

#### 5. CORS Error

- Periksa CLIENT_URL di .env
- Pastikan frontend dan backend port sesuai

### Step-by-Step Debugging

1. **Periksa Environment Variables**

   ```bash
   cd server
   cat .env
   ```

2. **Test Database Connection**

   ```bash
   # Jalankan backend dan cek log koneksi database
   node debug-server.js
   ```

3. **Periksa Server Logs**

   ```bash
   cd server
   npm run dev
   # Lihat error di terminal
   ```

4. **Test API dengan Postman**

   ```bash
   # 1. Get token
   POST http://localhost:5000/auth/token
   {
     "email": "test@example.com"
   }

   # 2. Create todo
   POST http://localhost:5000/todos
   Authorization: Bearer <token>
   {
     "title": "Test Todo"
   }
   ```

### Logs

**Docker:**

```bash
docker-compose logs -f server
docker-compose logs -f client
```

**Local:**

```bash
# Backend logs akan muncul di terminal
# Frontend logs akan muncul di browser console
```

## Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## License

This project is licensed under the MIT License.

## Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

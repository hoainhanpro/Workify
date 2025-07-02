# 🚀 Workify - Ứng dụng Quản lý Công việc

Workify là một ứng dụng quản lý công việc hiện đại được xây dựng với Spring Boot backend và React frontend. Ứng dụng cung cấp các tính năng quản lý note, chia sẻ note và tích hợp AI để nâng cao hiệu suất làm việc.

## ✨ Tính năng

- **📝 Quản lý Note**: Tạo, chỉnh sửa, xóa và tổ chức ghi chú cá nhân
- **🔗 Chia sẻ Note**: Chia sẻ ghi chú với đồng nghiệp và cộng tác viên
- **🤖 Tích hợp AI**: Hỗ trợ AI để tạo nội dung và gợi ý thông minh
- **👤 Quản lý User**: Đăng ký, đăng nhập và quản lý tài khoản người dùng
- **🔐 Bảo mật**: Xác thực JWT và phân quyền người dùng
- **📱 Responsive Design**: Giao diện thân thiện trên mọi thiết bị

## 🛠️ Công nghệ sử dụng

### Backend
- **Java 17** - Ngôn ngữ lập trình chính
- **Spring Boot 3.x** - Framework backend
- **Spring Security** - Bảo mật và xác thực
- **Spring Data MongoDB** - Kết nối cơ sở dữ liệu
- **MongoDB** - Cơ sở dữ liệu NoSQL
- **Maven** - Quản lý dependencies và build tool

### Frontend
- **React 18** - Thư viện JavaScript UI
- **Vite** - Build tool và dev server
- **Bootstrap 5** - CSS framework
- **React Router** - Client-side routing
- **Fetch API** - HTTP client

## Yêu cầu hệ thống

- **Java**: JDK 17 hoặc cao hơn
- **Node.js**: Version 16 hoặc cao hơn
- **npm**: Package manager cho Node.js
- **MongoDB**: Cơ sở dữ liệu (local hoặc cloud)
- **Maven**: Build tool cho Java

## Hướng dẫn cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd Workify
```

### 2. Cấu hình Backend

#### Cài đặt dependencies
```bash
cd backend
mvn clean install
```

#### Cấu hình database
Cập nhật file `backend/src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/workify
# Hoặc sử dụng MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/workify

# JWT Configuration
app.jwt.secret=your-secret-key
app.jwt.expiration=86400
```

#### Chạy Backend
```bash
cd backend
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

### 3. Cấu hình Frontend

#### Cài đặt dependencies
```bash
cd frontend
npm install
```

#### Chạy Frontend
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3002** (hoặc port khác tùy Vite)

## API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Đăng ký tài khoản mới
- `POST /api/users/login` - Đăng nhập (sẽ được implement)

### User Management
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/{id}` - Lấy thông tin user theo ID
- `GET /api/users/username/{username}` - Lấy user theo username
- `PUT /api/users/{id}/status` - Cập nhật trạng thái user
- `DELETE /api/users/{id}` - Xóa user

### Note Management (Coming Soon)
- `GET /api/notes` - Lấy danh sách notes
- `POST /api/notes` - Tạo note mới
- `PUT /api/notes/{id}` - Cập nhật note
- `DELETE /api/notes/{id}` - Xóa note
- `POST /api/notes/{id}/share` - Chia sẻ note

## Cấu trúc dự án

```
Workify/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/workify/backend/
│   │       ├── config/      # Configuration classes
│   │       ├── controller/  # REST Controllers
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── model/       # Entity models
│   │       ├── repository/  # Data repositories
│   │       └── service/     # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml             # Maven dependencies
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React contexts
│   ├── package.json
│   └── vite.config.js
├── README.md
└── start-dev.ps1          # Development startup script
```

## Scripts hữu ích

### Backend
```bash
# Chạy tests
mvn test

# Build project
mvn clean package

# Chạy với profile khác
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend
```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Biến môi trường

Tạo file `.env` trong thư mục backend để cấu hình:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/workify

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400

# Server
SERVER_PORT=8080
```

## Roadmap

- [ ] **Authentication & Authorization**: JWT login/logout hoàn chỉnh
- [ ] **Note Management**: CRUD operations cho notes
- [ ] **Note Sharing**: Chia sẻ và cộng tác trên notes
- [ ] **AI Integration**: Tích hợp AI để hỗ trợ viết nội dung
- [ ] **Real-time Collaboration**: WebSocket cho collaboration
- [ ] **File Upload**: Upload và quản lý file đính kèm
- [ ] **Search & Filter**: Tìm kiếm và lọc notes
- [ ] **Mobile App**: Ứng dụng mobile React Native

## Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- **Developer**: Phan Hoài Nhân
- **Email**: hoainhannro@gmail.com
- **Project Link**: [Workify Repository](https://github.com/hoainhannro/workify)

---

**Nếu dự án hữu ích, hãy cho chúng tôi một star!**

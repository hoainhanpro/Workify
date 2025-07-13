# 🚀 Workify - Ứng dụng Quản lý Công việc

Workify là một ứng dụng quản lý công việc hiện đại được xây dựng với Spring Boot backend và React frontend. Ứng dụng cung cấp các tính năng quản lý task, note và tích hợp AI để nâng cao hiệu suất làm việc.

## ✨ Tính năng

- **✅ Quản lý Task**: Tạo, chỉnh sửa, xóa và tổ chức công việc theo trạng thái, độ ưu tiên
- **📝 Quản lý Note**: Tạo, chỉnh sửa, xóa và tổ chức ghi chú cá nhân với rich text editor
  - ✅ Định dạng văn bản (bold, italic, underline, header, color)
  - ✅ Checklist tương tác với checkbox
  - ✅ Bảng (table) với đầy đủ tính năng chỉnh sửa
- **� Tìm kiếm nâng cao**: Tìm kiếm task theo title, description, tag, status, priority
- **📊 Thống kê Task**: Xem thống kê task theo trạng thái hoàn thành
- **🏷️ Tag System**: Gán nhãn cho task để dễ dàng phân loại
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
- **React Quill** - Rich text editor cho ghi chú
- **Quill Better Table** - Module table cho rich text editor
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

Giai đoạn 1: Cơ bản & Hoạt động cá nhân
[✔️] Authentication & Authorization - 
→ Đăng nhập bằng JWT + OAuth2 Google

[❌] Note Management (CRUD) - 
    ✔️ Tạo / sửa / xóa ghi chú
	✔️ Rich text editor (In đậm, nghiêng, gạch chân, heading (dùng Tiptap/Quill))
    ✔️ Checklist: Checkbox trong note
    ❌ Table trong nội dung của note 
    ❌ Tải lên file (local): Upload file, preview, tải xuống
    ❌ Gắn tag, pin note: Thêm trường tags, isPinned
    ❌ Tìm kiếm, filter note: Tìm theo keyword, tag
    ❌ Cho lưu cả ảnh vào dưới dạng base64 
    ❌ Export note (PDF, HTML): Export nội dung ghi chú
    ❌ Lưu lịch sử chỉnh sửa: Versioning hoặc undo/redo
    

[✔️] Task Management (CRUD + Subtasks) 
→ Tạo task chính + subtasks, phân loại mức độ ưu tiên

[✔️] Search & Filter
→ Tìm kiếm task theo từ khoá, mức độ, thời gian

⚙️ Giai đoạn 2: Mở rộng không gian làm việc (Workspace)
[❌] Workspace Creation 
→ Tạo workspace để làm việc nhóm

[❌] Member Management & Role-Based Access
→ Mời thành viên, gán quyền (quản lý / thành viên / xem-only)

[❌] Shared Task/Note in Workspace -
→ Phân công task & note cho các thành viên

[❌] Note Management Advance 1 - 
    ❌ Uploadfile: Tích hợp Drive API cho lưu trữ file lớn khi người dùng cấp quyền
    ❌ Chia sẻ note (workspace): Chia sẻ quyền xem/sửa note

🤖 Giai đoạn 3: AI & Tích hợp thông minh
[❌] AI Task Planner (API tích hợp)
→ Gợi ý nội dung & timeline cho task bằng AI như Gemini, GPT

[❌] AI Summary for Meeting Recordings
→ Ghi âm + tóm tắt nội dung bằng AI bên thứ ba

[❌] Note Assistant (AI)
    ❌ Tích hợp AI tóm tắt: Gửi nội dung note đến AI, nhận tóm tắt

🔔 Giai đoạn 4: Notification & Lịch
[❌] Notification System -  
→ Gửi thông báo qua email, Telegram, hoặc Zalo (tùy cấu hình)

[❌] Push Notification in Web UI -  
→ Hiện cảnh báo gần deadline, được giao task mới

[❌]Calendar Integration
→ Tích hợp lịch (FullCalendar UI) để theo dõi task

[❌]Google Calendar Sync (optional)
→ Đồng bộ task deadline với lịch Google của người dùng

📊 Giai đoạn 5: Theo dõi hiệu suất & báo cáo
[❌] Progress Chart & Ranking
→ Biểu đồ mức độ hoàn thành task cá nhân & nhóm

[❌] Activity Log & Audit Trail
→ Lưu lịch sử thao tác của người dùng

[❌] Dashboard Tổng quan dự án / cá nhân
→ Xem nhanh trạng thái các workspace/task đang theo dõi



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

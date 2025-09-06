# 01Blog

A **social blogging platform** where students can share their learning journey, follow each other, and interact with posts.

This project is a **fullstack application** built with:
- **Backend**: Java Spring Boot  
- **Frontend**: Angular  
- **Database**: PostgreSQL

---

## 🚀 Features

### User Features
- Register, login, and manage profile
- Create, edit, and delete posts (with media support)
- Like and comment on posts
- Subscribe to other users' profiles
- Get notifications when subscribed users post

### Admin Features
- Manage users and posts
- View and handle reports
- Ban or delete inappropriate content

### General Features
- Role-based authentication (JWT + Spring Security)
- Responsive frontend (Angular Material)
- Relational database (PostgreSQL)

---

## 🛠️ Project Structure

```
01-blog/
├── 01blog-backend/     # Spring Boot backend
├── 01blog-frontend/    # Angular frontend
└── run.sh             # Script to run both servers
```

---

## ⚡ Requirements

- **Java 17+**
- **Maven** (or Maven Wrapper `./mvnw`)
- **Node.js 20+ & npm**
- **Angular CLI** (`npm install -g @angular/cli`)
- **PostgreSQL**

---

## ▶️ Running the Project

### 1. Backend (Spring Boot)

```bash
cd 01blog-backend
./mvnw spring-boot:run
```

Backend will start at: http://localhost:8080

### 2. Frontend (Angular)

```bash
cd 01blog-frontend
ng serve --open
```

Frontend will start at: http://localhost:4200

### 3. Run Both with Script

From the project root:

```bash
./run.sh
```

This will open two terminals:
- Backend at port 8080
- Frontend at port 4200

---

## ⚙️ Database Setup (PostgreSQL)

1. Start PostgreSQL and create a database:

```sql
CREATE DATABASE blogdb;
```

2. Update `01blog-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/blogdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

---

## 📚 Tech Stack

- **Backend**: Spring Boot, Spring Security, JPA, PostgreSQL
- **Frontend**: Angular, Angular Material
- **Authentication**: JWT
- **Build Tools**: Maven, npm
- **Deployment Ready**: Can be deployed on AWS / Docker

---

## 🧑‍💻 Development Notes

- Backend APIs are exposed at `/api/**`
- Angular services consume those APIs
- Use `ng generate component` and `ng generate service` to scaffold frontend code
- Use layered architecture on backend (controller → service → repository)

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `POST /api/users/{id}/subscribe` - Subscribe to user
- `DELETE /api/users/{id}/subscribe` - Unsubscribe from user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/{id}` - Get specific post
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Like/unlike post
- `POST /api/posts/{id}/comments` - Add comment
- `DELETE /api/comments/{id}` - Delete comment

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/{id}` - Ban user
- `GET /api/admin/reports` - Get all reports
- `POST /api/admin/reports/{id}/resolve` - Resolve report

---

## ✅ Evaluation Criteria

- **Functionality** (all features working)
- **Security** (proper role-based access)
- **UI/UX** (clean & responsive)
- **Documentation** (this README)

---

## 🔮 Bonus Features (Optional)

- Real-time notifications (WebSockets)
- Infinite scrolling on feeds
- Dark mode toggle
- Basic analytics for admins

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

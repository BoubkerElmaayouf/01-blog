# 01-Blog

A full-stack social blogging platform built with **Spring Boot**, **Angular**, and **PostgreSQL**, designed for students and developers to share posts, interact, and follow each other.

---

## 📌 Project Overview

**01-Blog** is a modern full-stack web application using a **layered backend architecture** (Controller → Service → Repository) and a **feature-based Angular frontend architecture**.  

The project supports authentication with JWT, role-based access (USER / ADMIN), post interactions, notifications, reporting, and admin moderation.

The database is managed using **PostgreSQL**, with **Docker** used to easily provision and run the database locally.

---

## 🧠 Architecture

### Backend Architecture (Spring Boot)

- **Controller Layer** – REST APIs
- **Service Layer** – Business logic
- **Repository Layer** – Data access (JPA/Hibernate)
- **DTO Layer** – Request/Response abstraction
- **Security Layer** – JWT + Spring Security
- **Exception Handling** – Global exception handler

```
Controller → Service → Repository → Database
```

### Frontend Architecture (Angular)

- Feature-based modules
- Services for API communication
- Route guards for authentication
- Angular Material UI components

---

## 🧱 Project Structure

```
01-blog/
├── 01blog-backend/       # Spring Boot backend
├── 01blog-frontend/      # Angular frontend
├── dockerrun.sh          # PostgreSQL Docker setup
├── run.sh                # Run backend & frontend
└── README.md
```

---

## 🚀 Features

### 👤 User Features
- Register & login (JWT authentication)
- Create, edit, delete blog posts
- Like and comment on posts
- Follow / unfollow users
- Receive notifications
- Upload images (Cloudinary)

### 🛠️ Admin Features
- User management
- Post moderation
- Report handling
- Ban users

---

## ⚙️ Technologies & Tools Used

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- Maven

### Frontend
- Angular
- Angular Material
- TypeScript
- RxJS

### Database
- PostgreSQL 15 (Dockerized)

### DevOps / Tools
- Docker
- Bash scripts
- Git
- Cloudinary (image hosting)

---

## 📋 Requirements

Make sure you have the following installed:

### Required
- **Java 17+**
- **Node.js 18+** (20 recommended)
- **npm**
- **Angular CLI**
- **Docker**
- **Git**
- **Linux** (or compatible terminal for scripts)

Install Angular CLI:
```bash
npm install -g @angular/cli
```

---

## 🐳 Database Setup (Docker)

The project uses PostgreSQL inside Docker.

Run the database using:

```bash
./dockerrun.sh
```

This script will:
- Check if Docker is installed
- Pull `postgres:15` image (if not exists)
- Remove any existing Postgres containers
- Start a new container with:
  - **Database:** `01blog`
  - **User:** `01blog`
  - **Password:** `blog123`
  - **Port:** `5432`

Postgres will be available at:
```
localhost:5432
```

---

## ▶️ Running the Project

### Option 1️⃣: Run Everything Automatically

From the project root:

```bash
./run.sh
```

This will:
- Open backend in a new terminal
- Compile and start Spring Boot
- Open frontend in another terminal
- Start Angular dev server

### Option 2️⃣: Run Manually

#### Backend
```bash
cd 01blog-backend
./mvnw clean compile
./mvnw spring-boot:run
```

Backend runs on:
```
http://localhost:8080
```

#### Frontend
```bash
cd 01blog-frontend
npm install
ng serve --open
```

Frontend runs on:
```
http://localhost:4200
```

---

## 🔐 Authentication

- JWT-based authentication
- Secured endpoints with Spring Security
- Role-based access control (USER / ADMIN)

### Main endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`

---

## 📡 Main API Endpoints

### Users
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `POST /api/users/{id}/subscribe`
- `DELETE /api/users/{id}/subscribe`

### Posts
- `GET /api/posts`
- `GET /api/posts/{id}`
- `POST /api/posts`
- `PUT /api/posts/{id}`
- `DELETE /api/posts/{id}`
- `POST /api/posts/{id}/like`
- `POST /api/posts/{id}/comments`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/posts`
- `GET /api/admin/reports`

---

## ☁️ File Uploads

- Image uploads are handled using **Cloudinary**
- Configured via `CloudinaryConfig`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request


## 👨‍💻 Author

**Bboubaker Elmaayouf**  
Full-Stack Developer

Portfolio: [https://boubkerelmaayouf.click/](https://boubkerelmaayouf.click/)

GitHub: [https://github.com/BoubkerElmaayouf](https://github.com/BoubkerElmaayouf)
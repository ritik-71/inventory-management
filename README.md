# Enterprise Inventory Management Platform

A full-stack, production-grade inventory management system built with **Next.js 16**, **Spring Boot 3**, and **PostgreSQL**. Features real-time notifications, role-based access control, server-side pagination, and enterprise-grade security.

[![CI/CD Pipeline](https://github.com/ritik-71/inventory-management/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ritik-71/inventory-management/actions)

---

## Features

**Core**
- 📦 Full CRUD inventory management with search, sort, and pagination
- 📊 Real-time analytics dashboard with category distribution charts
- 🔔 Server-Sent Events (SSE) for live notification delivery
- 🔐 JWT authentication with HttpOnly cookie security
- 🔄 Automatic refresh token rotation with revocation tracking

**Enterprise**
- 👤 Role-based access control (Admin / User)
- 📱 Responsive design with mobile sidebar drawer
- 🌗 Dark/Light theme toggle
- ⚡ Server-side pagination for scalable datasets
- 🛡️ Rate limiting with IP-based brute-force protection
- 📈 Prometheus metrics endpoint for Grafana monitoring
- 🐳 Docker containerization with health checks

**Developer Experience**
- 🧪 GitHub Actions CI/CD (backend + frontend + Docker validation)
- 🗃️ Flyway database migrations
- 🔍 Structured logging with correlation ID tracing
- 📝 Comprehensive deployment documentation

---

## Tech Stack

| | Technology | Purpose |
|-|-----------|---------|
| 🎨 | Next.js 16 + React 19 | Frontend framework |
| ⚙️ | Spring Boot 3 + Java 17 | Backend API |
| 🗄️ | PostgreSQL | Production database |
| 🔑 | Spring Security + JWT | Authentication |
| 📡 | SSE (SseEmitter) | Real-time notifications |
| 🐳 | Docker | Containerization |
| 🚀 | Vercel + Render | Cloud deployment |

---

## Quick Start

```bash
# Backend
cd inventory-backend
./mvnw spring-boot:run

# Frontend (new terminal)
cd inventory-frontend
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  
Login: `admin1@gmail.com` / `admin@123`

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions for Vercel, Render, and Docker.

---

## Architecture

```
Vercel (Next.js)  ←→  Render (Spring Boot)  ←→  PostgreSQL
     ↕ SSE                  ↕ JWT Cookies            ↕ Flyway
  Dashboard              REST API              Migrations
```

---

## License

MIT

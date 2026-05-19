# Deployment Guide

Enterprise Inventory Management Platform — Full-Stack Deployment Reference

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Spring Boot 3, Java 17, Spring Security |
| Database | PostgreSQL (Render) / H2 (Local) |
| Auth | JWT + HttpOnly Cookies, Refresh Token Rotation |
| Notifications | Server-Sent Events (SSE) |
| CI/CD | GitHub Actions |
| Hosting | Vercel (Frontend) + Render (Backend) |

---

## Local Development

### Prerequisites
- Node.js 18+
- Java 17+
- Maven (or use included `mvnw` wrapper)

### Backend
```bash
cd inventory-backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080` with H2 in-memory database.  
Default admin: `admin1@gmail.com` / `admin@123`

### Frontend
```bash
cd inventory-frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### Environment Variables (Frontend)
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Vercel Deployment (Frontend)

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Set **Root Directory** to `inventory-frontend`
4. Add environment variable:
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |
5. Deploy

---

## Render Deployment (Backend)

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | Root Directory | `inventory-backend` |
   | Build Command | `./mvnw clean package -DskipTests` |
   | Start Command | `java -jar target/inventory_management-0.0.1-SNAPSHOT.jar` |
   | Environment | `Docker` or `Java 17` |

4. Add environment variables:
   | Variable | Value |
   |----------|-------|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `JWT_SECRET` | (min 32 chars, random secure string) |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://host:5432/dbname` |
   | `SPRING_DATASOURCE_USERNAME` | (from Render PostgreSQL) |
   | `SPRING_DATASOURCE_PASSWORD` | (from Render PostgreSQL) |
   | `SPRING_JPA_DATABASE_PLATFORM` | `org.hibernate.dialect.PostgreSQLDialect` |

### PostgreSQL Setup
1. Create a **PostgreSQL** instance on Render
2. Copy the **Internal Database URL** for `SPRING_DATASOURCE_URL`
3. Flyway migrations run automatically on startup

---

## Docker Deployment

```bash
cd inventory-backend
docker build -t inventory-backend .
docker run -p 8080:8080 \
  -e JWT_SECRET=your-secret-here \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db \
  inventory-backend
```

Health check: `GET /actuator/health`

---

## Architecture Overview

```
┌─────────────┐     HTTPS      ┌──────────────┐     JDBC      ┌────────────┐
│   Vercel     │ ──────────────▶│    Render     │ ────────────▶│ PostgreSQL │
│  (Next.js)   │   REST + SSE   │ (Spring Boot) │              │  (Render)  │
│              │◀──────────────│              │◀────────────│            │
└─────────────┘   JSON + Cookies└──────────────┘              └────────────┘
```

**Authentication Flow:**
1. Login → Backend sets `access_token` + `refresh_token` as HttpOnly cookies
2. All API calls include cookies via `credentials: include`
3. On 401 → Frontend silently refreshes using refresh token cookie
4. Refresh tokens are rotated and revoked tokens are tracked in DB

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS errors | Ensure backend CORS config includes your Vercel domain |
| Cookies not sent | Verify `SameSite=None`, `Secure=true`, and HTTPS on both ends |
| 502 on Render | Free-tier cold starts take ~30s. Frontend retries automatically |
| Build fails on Vercel | Check `NEXT_PUBLIC_API_URL` is set in Vercel env vars |
| DB connection errors | Verify PostgreSQL credentials and that the DB instance is running |
| JWT errors | Ensure `JWT_SECRET` is at least 32 characters |

---

## Monitoring

- **Health:** `GET /actuator/health`
- **Metrics:** `GET /actuator/prometheus` (Grafana-compatible)
- **Logs:** Available in Render dashboard

---

## Project Structure

```
inventory-management/
├── inventory-backend/          # Spring Boot API
│   ├── src/main/java/          # Controllers, Services, Entities
│   ├── src/main/resources/     # Config, Flyway migrations
│   └── Dockerfile
├── inventory-frontend/         # Next.js Frontend
│   ├── src/app/                # App Router pages
│   ├── src/context/            # React contexts
│   ├── src/features/           # Feature components
│   └── src/utils/              # API client, utilities
├── .github/workflows/          # CI/CD pipeline
└── render.yaml                 # Render deployment config
```

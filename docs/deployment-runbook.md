# 🚀 Qader Academy - Production Deployment Runbook

**Document Owner:** Fisal (DevOps & Platform Engineering)  
**Version:** 1.0.0 (Production Release)  
**Target Environment:** Production (`production`)  
**Deployment Platform:** Render.com (Docker Web Services) + MongoDB Atlas  
**Tech Stack:** React 18 + Vite (SPA) | Node.js 20 + Express | MongoDB Atlas | Docker & Nginx  

---

## 📋 Table of Contents
1. [Architecture & Deployment Topology](#1-architecture--deployment-topology)
2. [Platform Note: Docker & Render.com](#2-platform-note-docker--rendercom)
3. [Prerequisites & Account Setup](#3-prerequisites--account-setup)
4. [Stage 1: Production Database Provisioning (MongoDB Atlas)](#4-stage-1-production-database-provisioning-mongodb-atlas)
5. [Stage 2: Production Environment Variables & Secrets](#5-stage-2-production-environment-variables--secrets)
6. [Stage 3: Backend Container Deployment on Render](#6-stage-3-backend-container-deployment-on-render)
7. [Stage 4: Frontend Container Deployment on Render](#7-stage-4-frontend-container-deployment-on-render)
8. [Stage 5: Production Smoke Tests & Verification Checklist](#8-stage-5-production-smoke-tests--verification-checklist)
9. [Stage 6: Docker Compose Production Orchestration (Self-Hosted Alternative)](#9-stage-6-docker-compose-production-orchestration-self-hosted-alternative)
10. [Stage 7: Monitoring, Day-2 Operations & Incident Playbook](#10-stage-7-monitoring-day-2-operations--incident-playbook)

---

## 1. Architecture & Deployment Topology

### Component Breakdown:
- **Frontend Container (`qader-academy-frontend-docker`)**:
  - Serves the compiled React 18 SPA.
  - Consumes `VITE_API_BASE_URL` to route API requests directly to the production backend.
  - Configured with `server.allowedHosts: true` in Vite to support cloud domain routing.
- **Backend Container (`qader-academy-backend-docker`)**:
  - Stateless Express REST API mounted under `/api/v1`.
  - Enforces CORS whitelisting via `FRONTEND_URL`.
  - Includes Puppeteer and Chromium system libraries for PDF certificate generation.
- **Database (MongoDB Atlas)**:
  - Multi-node replica set with automated snapshots and IP access control.

---

## 2. Platform Note: Docker & Render.com

> [!NOTE]
> The initial SRS recommended deploying the frontend on Vercel or Netlify. However, because Vercel and Netlify do not support custom Docker containers and multi-stage Nginx builds, the frontend and backend are unified under Docker Web Services on **Render.com**.

---

## 3. Prerequisites & Account Setup

1. **GitHub Repository Access**:
   - Repository: `https://github.com/internKaram/qader-academy`
   - Active Production Branch: `main`
2. **Render.com Account**:
   - Connect GitHub account with read/write access to repository branches.
3. **MongoDB Atlas Account**:
   - Access to database cluster administration and user role provisioning.

---

## 4. Stage 1: Production Database Provisioning (MongoDB Atlas)

### 4.1 Cluster Provisioning
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create or select your project: `Qader-Academy-Production`.
3. Create a cluster (e.g. M0 Free Tier for staging or M10+ dedicated for high-availability production).
4. Select the target cloud provider and region (e.g., AWS / `eu-central-1` or `me-central-1`).

### 4.2 Network Security & Access List
1. In the Atlas dashboard, navigate to **Security** > **Network Access** > **IP Access List**.
2. **Development / Team Access Note**: `0.0.0.0/0` (Allow Access from Anywhere) was temporarily used during development so team members could connect across varied local networks.

> [!CAUTION]
> **Production Security Mandate:** Leaving `0.0.0.0/0` open in production is a severe security exposure. For true production environments, remove `0.0.0.0/0` and restrict access strictly to the dedicated static outbound IP(s) of your backend cluster or configure VPC Peering / AWS PrivateLink.

### 4.3 Database User & Least-Privilege RBAC
1. Navigate to **Security** > **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set username (e.g., `Fisal`) and generate a secure password.
5. Set Database User Privileges: `readWriteAnyDatabase` or `readWrite@qader_academy`.
6. Click **Add User**.

### 4.4 Connection String Composition
Obtain the SRV connection URI from **Clusters** > **Connect** > **Drivers** (Node.js):
```text
mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER-HOST>/qader_academy?retryWrites=true&w=majority
```
*(Note: If the password contains special characters like `@`, `%`, or `#`, URL-encode them appropriately).*

---

## 5. Stage 2: Production Environment Variables & Secrets

### 5.1 Backend Environment Variables

Configure these variables in **Render > Backend Service > Environment**:

| Variable Key | Type | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | String | `production` | Enables production optimizations and disables debug traces. |
| `PORT` | Number | `5000` | Port on which the Express server listens inside the container. |
| `MONGO_URI` | Secret | `mongodb+srv://...` | MongoDB Atlas authenticated connection string. |
| `JWT_SECRET` | Secret | `909bdbf1e6a9181ab7f...` | 64+ char random string (generate via: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`). |
| `FRONTEND_URL` | String | `https://qader-academy-frontend-docker.onrender.com` | Whitelisted origin for CORS. |

### 5.2 Frontend Environment Variables

Configure these variables in **Render > Frontend Service > Environment**:

| Variable Key | Type | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | String | `https://qader-academy-backend-docker.onrender.com/api/v1` | Production backend base URL for all client Axios calls. |

---

## 6. Stage 3: Backend Container Deployment on Render

### 6.1 Service Creation on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your repository: `internKaram/qader-academy`.
4. Configure service settings:
   - **Name**: `qader-academy-backend-docker`
   - **Region**: Choose closest region (e.g., Frankfurt / Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: Free or Starter

### 6.2 Backend Dockerfile Architecture
The backend `Dockerfile` is optimized for production security with Alpine, Chromium for Puppeteer PDF certificate generation, and runs as an unprivileged user (`qaderuser`):
```dockerfile
FROM node:20-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

RUN addgroup -S qadergroup && adduser -S qaderuser -G qadergroup \
    && chown -R qaderuser:qadergroup /app
USER qaderuser

EXPOSE 5000
CMD ["node", "server.js"]
```

### 6.3 Deploying and Verifying Backend
1. Click **Create Web Service**.
2. Monitor logs in the Render console:
   ```text
   ==> Building image with Dockerfile ./Dockerfile
   ==> Uploading build...
   ==> Starting service with 'node server.js'
   Connected to MongoDB Atlas successfully
   Server running in production mode on port 5000
   ```
3. Test healthcheck in browser: `https://qader-academy-backend-docker.onrender.com/`  
   Expected Output: `API is running...`

---

## 7. Stage 4: Frontend Container Deployment on Render

### 7.1 Service Creation on Render
1. In Render Dashboard, click **New +** > **Web Service**.
2. Select repository: `internKaram/qader-academy`.
3. Configure service settings:
   - **Name**: `Qader Academy-frontend-docker`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: Free or Starter

### 7.2 Multi-Stage Production Dockerfile (`frontend/Dockerfile` + Nginx)
The industry standard single multi-stage build compiles the SPA in Stage 1 and serves it with ultra-lean Nginx in Stage 2:
```dockerfile
# Stage 1: Build Environment
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Production Web Server (Nginx)
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 8. Stage 5: Production Smoke Tests & Verification Checklist

> [!NOTE]
> **Pre-Test Seeding Requirement:** On a fresh production database, no user accounts exist by default. To populate accounts before executing authentication smoke tests, refer to the seeder documentation in [`docs/seed-users.md`](file:///c:/Users/faisa/Desktop/QaderTech/Code/docs/seed-users.md) (or execute `node seeders/seed-users.js` with your production `MONGO_URI`).

Perform these checks immediately following deployment:

| # | Test Scenario | Execution Step | Expected Result | Pass/Fail |
| :-: | :--- | :--- | :--- | :-: |
| 1 | **Frontend Availability** | Open `https://qader-academy-frontend-docker.onrender.com` | Landing page loads with CSS/JS assets, hero images, and navbar. | [ ] |
| 2 | **Backend Health** | Open `https://qader-academy-backend-docker.onrender.com/` | Returns HTTP 200 with text `API is running...` | [ ] |
| 3 | **CORS Handshake** | Inspect browser console on login page | Zero CORS policy errors or blocked origins. | [ ] |
| 4 | **Student Authentication** | Log in with seeded student (`fisal@qader.com` / `Student@123`) | Successfully redirects to `/dashboard` with JWT in `localStorage`. | [ ] |
| 5 | **Admin Authentication** | Log in with seeded admin (`salem@qader.com` / `Admin@123`) | Successfully redirects to `/admin` with full stats rendered. | [ ] |
| 6 | **Course Catalog Retrieval** | Navigate to `/courses` | Live courses retrieved from MongoDB and displayed. | [ ] |
| 7 | **Protected Routes** | Attempt accessing `/dashboard` without token | Automatically redirected to `/login`. | [ ] |
| 8 | **Certificate Verification** | Visit `/verify` with sample certificate number | Verification status and metadata render properly. | [ ] |

---

## 9. Stage 6: Docker Compose Production Orchestration (Self-Hosted Alternative)

For deploying on a self-hosted Linux VPS (e.g. AWS EC2, DigitalOcean, Hetzner), use the root [`docker-compose.prod.yaml`](file:///c:/Users/faisa/Desktop/QaderTech/Code/docker-compose.prod.yaml):

```bash
# 1. Clone repository on host
git clone -b main https://github.com/internKaram/qader-academy.git /opt/qader-academy
cd /opt/qader-academy

# 2. Configure environment variables in .env
cat << 'EOF' > .env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://yourdomain.com/api/v1
EOF

# 3. Build and launch containers
docker compose -f docker-compose.prod.yaml up -d --build

# 4. Verify container statuses
docker compose -f docker-compose.prod.yaml ps
```

---

## 10. Stage 7: Monitoring, Day-2 Operations & Incident Playbook

### 10.1 Issue: Render Free Tier Cold Starts
- **Symptom**: First login request after 15 minutes of inactivity takes 30–50 seconds to respond.
- **Cause**: Render spins down inactive free instances.
- **Resolution**: Upgrade backend service to a persistent Starter tier ($7/mo) for zero cold starts, or configure an external uptime monitor (e.g. UptimeRobot / BetterStack) pinging `GET /` every 10 minutes.

### 10.2 Issue: CORS Origin Mismatch (`Access-Control-Allow-Origin: undefined`)
- **Symptom**: Browser DevTools displays `blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`.
- **Cause**: `FRONTEND_URL` on Render's backend is missing or contains leading/trailing spaces or the key name in the value field.
- **Resolution**: Ensure `FRONTEND_URL` in Render Backend Environment is set to exactly `https://qader-academy-frontend-docker.onrender.com` without trailing slashes.

### 10.3 Issue: Vite `Blocked request: host not allowed`
- **Symptom**: Browser displays 403 Forbidden or host blocked error when loading frontend.
- **Cause**: Vite 6+ requires explicit host whitelisting when running containerized dev/preview servers.
- **Resolution**: Ensure `server: { allowedHosts: true }` is present in `frontend/vite.config.ts`.

### 10.4 Zero-Downtime Rollback Procedure
If a production deployment introduces a regression:
1. In Render Dashboard, navigate to the affected service (`qader-academy-backend-docker` or `Qader Academy-frontend-docker`).
2. Click **Events** or **Deploys**.
3. Locate the previous stable deployment entry.
4. Click the three dots `...` > **Rollback to this deploy**.
5. Service will instantly revert to the previous working container image.

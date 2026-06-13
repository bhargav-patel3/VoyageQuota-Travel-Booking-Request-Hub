# VoyageQuota | Travel Booking Request Hub  --   ON GOING

VoyageQuota is a modern, premium multi-tier web application built using **React (Vite)**, **Node.js (Express)**, and **MySQL**. It is designed specifically as a realistic project for DevOps engineers to practice Dockerization, continuous integration (CI), continuous delivery (CD), and Kubernetes (K8s) orchestration.

---

## 🏗️ Architecture Overview

The application follows a standard three-tier architecture:

```
[ Web Browser ]
      │
      ▼ (HTTP / Port 5173 or 80)
┌─────────────────────────────────┐
│       Frontend (React)          │
└─────────────────────────────────┘
      │
      ▼ (REST API / Port 5000 /health & /api/bookings)
┌─────────────────────────────────┐
│     Backend API (Node.js)       │
└─────────────────────────────────┘
      │
      ▼ (MySQL Driver / Port 3306)
┌─────────────────────────────────┐
│        Database (MySQL)         │
└─────────────────────────────────┘
```

1. **Frontend (Client)**: A single-page application built with React, Vite, and Vanilla CSS. It features a modern glassmorphism design with midnight/purple/pink colors and custom animations.
2. **Backend (API)**: A Node.js Express server. It handles CORS, implements routing, manages connection pooling to MySQL, and exposes a `/health` endpoint for environment liveness and readiness checks.
3. **Database (State)**: A MySQL schema containing travel request metadata, pre-seeded with sample records for validation.

---

## 🗄️ Database Schema Setup

The database initialization script is located at:
📁 `database/init.sql`

This script:
1. Creates the database `voyage_db` (if it does not exist).
2. Creates the table `booking_requests` with fields:
   * `id`: Auto-incrementing primary key.
   * `passenger_names`: Text list of passengers.
   * `from_location`: Departure airport/city.
   * `to_location`: Destination airport/city.
   * `travel_date`: Date.
   * `special_notes`: Text block for extra requirements.
   * `created_at`: Timestamp.
3. Inserts mock passenger requests for testing visualization.

---

## ⚙️ Environment Configurations

Both tiers are fully configurable via environment variables, satisfying standard 12-factor app design patterns.

### 1. Backend Service Configuration (`backend/.env`)

Create a `.env` file inside the `backend/` directory (refer to `.env.example`):

| Variable | Description | Default Value | Notes |
| :--- | :--- | :--- | :--- |
| `PORT` | Port Express server listens on | `5000` | Expose this port in Docker |
| `DB_HOST` | Hostname of the MySQL database | `localhost` | Update to MySQL container/service host |
| `DB_PORT` | Port of the MySQL database | `3306` | |
| `DB_USER` | MySQL database username | `root` | Ensure user has schema creation privileges |
| `DB_PASSWORD`| MySQL database password | `""` (empty) | Keep secure in production/K8s Secrets |
| `DB_NAME` | MySQL database name | `voyage_db` | |

### 2. Frontend Configuration (`frontend/.env`)

Vite requires build-time environment variables to bundle variables into static client scripts.

| Variable | Description | Default Value | Notes |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the Backend service | `http://localhost:5000` | Injected during `npm run build` |

---

## 🩺 DevOps Probes (Health Checks)

The backend provides a dedicated endpoint for orchestrating container lifecycles in Kubernetes or AWS ECS:

* **Endpoint**: `GET http://localhost:5000/health`
* **Behavior**:
  * **Success (`HTTP 200 OK`)**: Server is running and can successfully ping the MySQL Database.
  * **Failure (`HTTP 503 Service Unavailable`)**: Server is running, but the database connection is broken or unreachable.
* **Sample Success JSON**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-06-13T08:19:40.254Z",
    "services": {
      "server": "OK",
      "database": "CONNECTED"
    }
  }
  ```
* **Sample Failure JSON**:
  ```json
  {
    "status": "DOWN",
    "timestamp": "2026-06-13T08:19:51.693Z",
    "services": {
      "server": "OK",
      "database": "DISCONNECTED"
    },
    "error": "ECONNREFUSED"
  }
  ```

---

## 🚀 Running Locally for Verification

Follow these steps to spin up the services without containerization:

### 1. Database Setup
Ensure you have MySQL running. Connect to your database server and execute the SQL file:
```bash
mysql -u root -p < database/init.sql
```

### 2. Run Backend API
Navigate to the backend, install dependencies, copy environment variables, and run:
```bash
cd backend
npm install
cp .env.example .env
# Start in production mode:
npm start
# OR start in development auto-reload mode:
npm run dev
```

### 3. Run Frontend App
Navigate to the frontend, install dependencies, and run:
```bash
cd frontend
npm install
# Start Vite development server:
npm run dev
```
Open `http://localhost:5173` in your browser. The connection badge in the header will glow green if the backend and database are fully operational!

---

## 🐳 Dockerization Blueprint Guidelines

Since you are writing the Dockerfiles yourself, here are standard professional patterns to follow:

### 🛠️ Frontend Dockerfile Recommendation (Multi-Stage Build)
1. **Stage 1 (Build)**:
   * Base image: `node:20-alpine`
   * Copy `package.json`, run `npm install`.
   * Set the environment variable `VITE_API_URL` to point to your backend service (e.g., `http://localhost:5000` or the ingress route).
   * Run `npm run build` to generate the static files in `dist/`.
2. **Stage 2 (Production Server)**:
   * Base image: `nginx:stable-alpine`
   * Copy the output of Stage 1 (`/app/dist`) into Nginx's HTML directory `/usr/share/nginx/html`.
   * Copy a custom `nginx.conf` that supports SPA routing (fallback to `index.html` on 404).
   * Expose port `80`.

### ⚡ Backend Dockerfile Recommendation
1. Base image: `node:20-alpine`
2. Set `NODE_ENV=production`.
3. Copy `package.json`, run `npm ci --only=production`.
4. Copy application source files.
5. Expose port `5000`.
6. Run as a non-root user (e.g. `USER node`) to align with container security best practices.

---

## ☸️ Kubernetes (K8s) Deployment Recommendations

When writing your Kubernetes manifests, organize them as follows:

1. **MySQL Database**:
   * Deploy as a **StatefulSet** or a single **Deployment** with a **PersistentVolumeClaim** (PVC) to retain database records.
   * Expose via a **ClusterIP Service** named `mysql-service` on port `3306`.
   * Use Kubernetes Secrets to manage `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD`.
   * Mount `database/init.sql` to `/docker-entrypoint-initdb.d/` inside the MySQL container to auto-run migrations on startup.

2. **Backend API**:
   * Deploy as a **Deployment** (replica count: 2+).
   * Use environment variables mapped to ConfigMaps and Secrets:
     - `DB_HOST` -> `"mysql-service"`
     - `DB_USER` -> ConfigMap value
     - `DB_PASSWORD` -> Secret value
   * Configure a **Liveness Probe** and a **Readiness Probe**:
     - `httpGet`: path: `/health`, port: `5000`
     - Set `initialDelaySeconds: 15` and `periodSeconds: 10`
   * Expose via a **ClusterIP Service** named `backend-service` on port `5000`.

3. **Frontend SPA**:
   * Deploy as a **Deployment** (replica count: 2+).
   * Inject `VITE_API_URL` during the Docker build stage.
   * Expose via a **ClusterIP Service** named `frontend-service` on port `80`.

4. **Ingress Controller (Nginx Ingress)**:
   * Route external traffic:
     * `/api/*` and `/health` redirects to `backend-service:5000`.
     * `/*` (everything else) redirects to `frontend-service:80`.

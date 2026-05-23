# BiteRush Plus - DevOps Food Order Website

BiteRush Plus is a full-stack food ordering website built with HTML, CSS, JavaScript, and a Node.js backend API. The project is designed for DevOps practice with source control, code quality checks, security scanning, Docker artifacts, and GitHub Actions workflows.

This README describes the local Node.js setup. The application runs directly from the Node.js server during development.

## Project Goal

The goal of this project is to demonstrate a practical DevOps workflow around a real web application:

- Build a food ordering frontend
- Serve frontend files and API routes from Node.js
- Store orders locally during development
- Validate code quality with Biome
- Run security and dependency scans
- Maintain Docker and CI/CD workflow files for DevOps practice

## Application Features

- Login-first user experience
- Browse food items
- Search and filter menu categories
- Add items to cart
- Place cart orders
- Buy Now checkout flow
- Save user profile details
- Upload profile photo
- View account-specific orders
- View all placed orders

## Local Architecture

```text
Browser
  |
  v
Node.js Server :3000
  |
  |-- Serves frontend files
  |-- Handles /api/menu
  |-- Handles /api/orders
  |
  v
Local JSON order storage
mongodb/seed/orders.json
```

MongoDB support is available in the backend for container-based practice, but local development works without MongoDB.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js HTTP server |
| Local storage | JSON file |
| Optional database | MongoDB |
| Code quality | Biome |
| Security scanning | Semgrep, Gitleaks, OWASP Dependency-Check, Trivy |
| DevOps tooling | Docker, Docker Compose, GitHub Actions |

## Repository Structure

```text
Food-Order-Website/
  backend/
    server.js
    package.json
    Dockerfile
  frontend/
    index.html
    styles.css
    app.js
    Dockerfile
  mongodb/
    seed/
      orders.json
  .github/
    workflows/
      code-security.yml
      dependency-scan.yml
      secrets-scan.yml
      docker-lint.yml
      build-push.yml
      image-scan.yml
      dev-sec-ops.yml
  docker-compose.yml
  package.json
  README.md
```

## Run Locally

Install dependencies:

```powershell
npm install
```

Start the application:

```powershell
npm start
```

Open the website:

```text
http://localhost:3000
```

Stop the local server:

```powershell
Get-Process node | Stop-Process
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/menu` | Get food menu items |
| GET | `/api/orders` | Get saved orders |
| POST | `/api/orders` | Place a new order |

Example order request:

```json
{
  "customer": {
    "name": "Praveen",
    "phone": "9876543210",
    "address": "Mathura, Uttar Pradesh"
  },
  "items": [
    {
      "id": 1,
      "qty": 2
    }
  ]
}
```

## DevOps Pipeline

The main DevSecOps workflow is:

```text
.github/workflows/dev-sec-ops.yml
```

Pipeline checks include:

| Stage | Workflow | Tool |
| --- | --- | --- |
| Code quality | `code-security.yml` | Biome |
| Static code security | `code-security.yml` | Semgrep |
| Secret scanning | `secrets-scan.yml` | Gitleaks |
| Dependency scanning | `dependency-scan.yml` | OWASP Dependency-Check |
| Dockerfile linting | `docker-lint.yml` | Hadolint |
| Image build | `build-push.yml` | Docker |
| Image scanning | `image-scan.yml` | Trivy |

## Required GitHub Configuration

For Docker image build and push workflows, configure:

Repository variable:

```text
DOCKERHUB_USERNAME
```

Repository secret:

```text
DOCKERHUB_TOKEN
```

## Useful Commands

Run Biome checks:

```powershell
npx @biomejs/biome check .
```

Run Biome with fixes:

```powershell
npx @biomejs/biome check . --write
```

Start server in the background on Windows:

```powershell
Start-Process -FilePath node -ArgumentList "backend/server.js" -WindowStyle Hidden
```

Check Docker containers:

```powershell
docker ps
```

## Notes

- The app runs locally on Node.js at port `3000`.
- No separate web server setup is required for local development.
- Local testing is done directly at `http://localhost:3000`.
- Orders are stored in `mongodb/seed/orders.json` when MongoDB is not running.
- User profile data is stored in browser `localStorage`.

## Author

DevOps Engineer: Praveen Singh Tomar

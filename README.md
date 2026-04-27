*This project has been created as part of the 42 curriculum by noben-ai, ner-roui, adbouras, abmahfou, amezioun.*

# LeetConnect

## Description

LeetConnect is a freelancing platform developed in the 42 curriculum. The project is built with a microservices architecture and supports three user roles: client, freelancer, and mods.


### Project Overview

Users can register and authenticate, browse or post jobs, communicate in real time, and use role-based dashboards.
The backend is split into independent services behind an Nginx gateway, with PostgreSQL and Redis as core infrastructure.

### Key Features

- Role-based platform (client / freelancer / admin)
- Authentication, OAuth, and 2FA
- Marketplace workflows (jobs, proposals, contracts)
- Real-time chat and notifications
- Analytics and admin APIs
- Monitoring with Prometheus + Grafana + cAdvisor

## Instructions

### Required configuration (`.env`)

At minimum, configure:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `AUTH_DB_*`, `MARKET_DB_*`, `CHAT_DB_*`, `ANALYTICS_DB_*`
- `JWT_SECRET`
- `REDIS_URL`
- `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD`
- OAuth variables if OAuth login is tested locally (`GOOGLE_*`, `GITHUB_*`)

### Run the project (step-by-step)

1. Clone the repository.
2. Create/update the root `.env` file.
3. Start the stack:

```bash
make
```

4. Other useful commands:

- `make health` — check service health endpoints.
- `make ps` — show running containers.
- `make logs` — follow combined logs.
- `make down` — stop the stack.
- `make clean` — remove containers, volumes, and generated certs.

5. Open the main entrypoints:

- `https://localhost` (frontend)
- `http://localhost:9090` (Prometheus)
- `http://localhost:3000` (Grafana)
- `http://localhost:8080` (cAdvisor)


## Team Information

| Login | Assigned Role(s) | Responsibilities |
|------|-------------------|------------------|
| `noben-ai` | Project Manager & Dev (Auth) | Auth service, login/register, OAuth/2FA integration |
| `ner-roui` | Dev (Marketplace) | Marketplace service, jobs/proposals/contracts workflows |
| `adbouras` | Dev (Chat) | Chat service, notifications, Profile  |
| `abmahfou` | Product Owner & Dev (Analytics/Admin) | Analytics and admin service |
| `amezioun` | Tech Lead / Infra Dev | Docker Compose, Nginx, monitoring stack, environment orchestration |

## Project Management

### Work organization

- Vertical-slice ownership by service.
- Shared integration through gateway + service APIs + common infrastructure.
- Infra changes validated end-to-end with Docker Compose.

### Communication

- Team communication channel: Discord.
- Weakly Meetings.

## Technical Stack

### Frontend

- React

### Backend

- Node.js
- Express.js

### Database and cache

- PostgreSQL (single instance with logical DB separation)
- Redis (pub/sub and shared event communication)


## Infrastructure & Monitoring: `amezioun`

### What this work includes

- Docker Compose orchestration for the services you actually run.
- Nginx reverse proxy and HTTPS routing.
- PostgreSQL and Redis containers.
- Prometheus, Grafana, and cAdvisor monitoring.
- Health checks and operational Makefile commands.

#### Goal

- Provide a reproducible local environment.
- Route frontend and backend traffic through one gateway.
- Keep the services networked correctly.
- Expose metrics for observability.
- Make the stack easy to run and debug.



### Infra Tech Stack

#### Used techs

- Docker and Docker Compose
- Nginx
- PostgreSQL
- Redis
- Prometheus
- Grafana
- cAdvisor

#### Why these tools

- **Docker Compose** keeps the stack reproducible and easy to start.
- **Nginx** is the single HTTPS reverse proxy for the project.
- **PostgreSQL** stores the service databases.
- **Redis** is used for pub/sub and shared event communication.
- **Prometheus** collects metrics from services and containers.
- **Grafana** visualizes the collected metrics.
- **cAdvisor** provides container CPU and memory metrics.

### Infra Layout

#### Services map


| Service | Port | Responsibility | Main Dependencies |
|---------|------|----------------|-------------------|
| `nginx` | `80/443` | Reverse proxy, HTTPS termination, request routing | `frontend`, `auth`, `marketplace`, `chat`, `analytics`, `admin` |
| `frontend` | `5173` | Public React application entrypoint | `nginx` |
| `auth` | `3001` | Authentication, OAuth, 2FA, profiles, auth health/metrics | `postgres`, `redis` |
| `marketplace` | `3002` | Jobs, proposals, contracts, marketplace health/metrics | `postgres`, `redis`, `auth` |
| `chat` | `3003` | Real-time messaging, conversations, notifications, Socket.IO | `postgres`, `redis`, `auth` |
| `analytics` | `3004` | Analytics/event APIs and reporting | `postgres`, `redis`, `auth` |
| `admin` | `3005` | Admin API layer over core services | `auth`, `marketplace`, `analytics` |
| `postgres` | `5432` | Shared PostgreSQL instance with logical databases | `auth`, `marketplace`, `chat`, `analytics` |
| `redis` | `6379` | Event bus and pub/sub | `auth`, `marketplace`, `chat`, `analytics` |
| `prometheus` | `9090` | Metrics collection and alert rule evaluation | `auth`, `marketplace`, `chat`, `analytics`, `admin`, `cadvisor` |
| `grafana` | `3000` | Metrics dashboards and visualization | `prometheus` |
| `cadvisor` | `8080` | Container resource monitoring | 

#### Network flow

- Internet traffic reaches **Nginx** first.
- Nginx routes traffic to the frontend or the backend services.
- Backend services communicate with PostgreSQL and Redis over the Docker network.
- Prometheus scrapes metrics from the services and cAdvisor.
- Grafana reads data from Prometheus.


#### Data boundaries

- PostgreSQL is one container, but each service uses its own logical database and credentials.
- Services do not directly read each other’s tables.
- Cross-service data needs are handled through service APIs and event communication.

#### Event communication

- Redis is used as the event bus/pub-sub channel between services.
- This supports decoupled updates (for example, profile/user state and chat-related synchronization).

#### Health and observability per service

- Each backend service exposes a health endpoint behind Nginx.
- Each backend service exposes `/metrics` for Prometheus scraping.
- Prometheus target jobs are configured for `auth`, `marketplace`, `chat`, `analytics`, and `admin`.

### Monitoring

#### What is monitored

- service availability
- request rate
- request latency
- container CPU usage
- container memory usage
- cAdvisor availability

#### Alert rules

The Prometheus rule file currently covers:

- backend services going down
- cAdvisor going down

#### Grafana

Grafana is configured with Prometheus as its datasource.


## Authentication: `noben-ai`
### What this work includes

- ...
- ...
- ..

- Friends system — noben-ai and adbouras

## Marketplace: `ner-roui`
### What this work includes

- ...
- ...

## Chat: `adbouras`
### What this work includes

- ...
- ...

## Analytics and admin: `abmahfou`
### What this work includes

- ...
- ...
- ...



## Modules

### Major modules
- ...
### Minor modules
- ...

## Resources

### infra References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/latest/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [cAdvisor GitHub Repository](https://github.com/google/cadvisor)

### Auth References
- ...
### Marketplace References
- ...
### Chat References
- ...
### Analytics References
- ...

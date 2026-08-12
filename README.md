# Mini Fleet Booking and Tracking Platform

Small full-stack assignment project for booking, accepting, tracking, and monitoring fleet rides.

## Problem Overview

The platform supports three roles:

- Customers can log in, create ride requests, view their bookings, track status/history, and cancel before the ride starts.
- Drivers can log in, view available rides, accept one ride, view assigned rides, and move the ride through the supported lifecycle.
- Administrators can view all rides, filter bookings, and monitor operational metrics.

## Technology Stack

- Frontend: React, Vite, React Router, Axios, CSS
- Backend: Node.js, Express, Mongoose, Zod, JWT, bcrypt
- Database: MongoDB
- Tests: Jest

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Express API
- `docs/` - API documentation, architecture notes, assumptions, limitations, and presentation notes

## Setup

Install dependencies:

```bash
npm install --prefix client
npm install --prefix server
```

Create environment files:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Start MongoDB locally and set `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mini-fleet-platform
JWT_SECRET=replace-with-a-long-random-development-secret
JWT_EXPIRES_IN=1d
PORT=5001
HOST=127.0.0.1
```

Set the frontend API URL in `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

## Run The App

Seed development users:

```bash
npm run seed --prefix server
```

Run the backend:

```bash
npm run dev:server
```

Run the frontend:

```bash
npm run dev:client
```

The frontend runs on the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Test Users

Seed data creates these local users:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `Customer@123` |
| Driver | `driver1@example.com` | `Driver@123` |
| Driver | `driver2@example.com` | `Driver@123` |
| Administrator | `admin@example.com` | `Admin@123` |

These are local development credentials only.

## Run Tests

```bash
npm run test:server
```

The backend test suite covers booking creation, validation failures, role authorization, duplicate ride acceptance, invalid status transitions, ownership checks, token failures, and completed-ride revenue.

## API Documentation

Required APIs are implemented:

- `POST /api/auth/login`
- `POST /api/rides`
- `GET /api/rides`
- `GET /api/rides/:id`
- `POST /api/rides/:id/accept`
- `PATCH /api/rides/:id/status`
- `POST /api/rides/:id/cancel`
- `GET /api/admin/metrics`

Additional supporting APIs:

- `GET /api/rides/available`
- `GET /api/rides/assigned`
- `GET /api/rides/:id/history`
- `GET /api/admin/users`
- `GET /api/health`

Full request/response details are in [docs/API.md](docs/API.md).

## Architecture

```text
Frontend
   |
   v
REST API Layer
   |
   v
Business Logic / Services
   |
   v
MongoDB
```

More detail, including indexes and lifecycle rules, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Core Business Rules

Primary ride lifecycle:

```text
REQUESTED -> ACCEPTED -> DRIVER_ARRIVING -> STARTED -> COMPLETED
```

Cancellation is allowed from:

```text
REQUESTED, ACCEPTED, DRIVER_ARRIVING
```

Cancellation is rejected from:

```text
STARTED, COMPLETED, CANCELLED
```

The backend prevents invalid transitions, duplicate ride acceptance, unauthorized status updates, unauthorized ride access, and repeated customer booking creation when the same idempotency key is reused.

## Assumptions And Known Limitations

Assumptions, known limitations, optional features not completed, and the AI tool usage note are documented in [docs/ASSUMPTIONS_AND_LIMITATIONS.md](docs/ASSUMPTIONS_AND_LIMITATIONS.md).

## Demo And Presentation

This repository is ready for a local live demo after setup and seeding. A suggested 15-20 minute presentation flow is available in [docs/PRESENTATION_NOTES.md](docs/PRESENTATION_NOTES.md).

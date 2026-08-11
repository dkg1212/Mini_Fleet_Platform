# Mini Fleet Booking and Tracking Platform

Take-home assignment project for a small fleet booking and tracking platform.

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Node.js + Express backend
- `docs/` - Project documentation

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

## Scripts

Run the frontend:

```bash
npm run dev:client
```

Run the backend:

```bash
npm run dev:server
```

Run backend tests:

```bash
npm run test:server
```

Seed development users:

```bash
npm run seed --prefix server
```

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Fleet API is running"
}
```

## Ride Business Rules

Ride cancellation assumption: a ride is considered started only when its status is `STARTED`.
Customers may cancel rides in `REQUESTED`, `ACCEPTED`, or `DRIVER_ARRIVING`.
Rides cannot be cancelled from `STARTED`, `COMPLETED`, or `CANCELLED`.

## Customer Ride APIs

All ride endpoints require:

```http
Authorization: Bearer <jwt>
```

Create a ride:

```http
POST /api/rides
Idempotency-Key: unique-value
Content-Type: application/json
```

```json
{
  "pickup": "Tezpur University",
  "destination": "Tezpur Airport",
  "estimatedDistance": 12,
  "requestedTime": "2026-08-12T10:30:00.000Z",
  "notes": "Please call when arriving"
}
```

Response:

```json
{
  "success": true,
  "message": "Ride created successfully",
  "data": {
    "ride": {
      "bookingId": "FLT-20260812-ABCD",
      "customerId": "authenticated-customer-id",
      "driverId": null,
      "pickup": "Tezpur University",
      "destination": "Tezpur Airport",
      "estimatedDistance": 12,
      "estimatedFare": 280,
      "status": "REQUESTED",
      "requestedTime": "2026-08-12T10:30:00.000Z"
    }
  }
}
```

List current user's rides:

```http
GET /api/rides
```

Response:

```json
{
  "success": true,
  "message": "Rides retrieved successfully",
  "data": {
    "rides": []
  }
}
```

Get one ride:

```http
GET /api/rides/:id
```

Response:

```json
{
  "success": true,
  "message": "Ride retrieved successfully",
  "data": {
    "ride": {
      "id": "ride-id",
      "bookingId": "FLT-20260812-ABCD",
      "status": "REQUESTED"
    }
  }
}
```

Cancel a ride:

```http
POST /api/rides/:id/cancel
```

Response:

```json
{
  "success": true,
  "message": "Ride cancelled successfully",
  "data": {
    "ride": {
      "status": "CANCELLED"
    }
  }
}
```

Repeated create request with the same `Idempotency-Key` returns the existing ride with `200 OK`:

```json
{
  "success": true,
  "message": "Ride already exists for this idempotency key",
  "data": {
    "ride": {
      "bookingId": "FLT-20260812-ABCD",
      "status": "REQUESTED"
    }
  }
}
```

## Driver Ride APIs

List assigned rides through the required endpoint:

```http
GET /api/rides
Authorization: Bearer <driver-jwt>
```

List available requested rides:

```http
GET /api/rides/available
Authorization: Bearer <driver-jwt>
```

Response:

```json
{
  "success": true,
  "message": "Available rides retrieved successfully",
  "data": {
    "rides": [
      {
        "bookingId": "FLT-20260812-ABCD",
        "pickup": "Tezpur University",
        "destination": "Tezpur Airport",
        "requestedTime": "2026-08-12T10:30:00.000Z",
        "estimatedFare": 280,
        "customerId": {
          "name": "Customer User"
        }
      }
    ]
  }
}
```

Accept a ride:

```http
POST /api/rides/:id/accept
Authorization: Bearer <driver-jwt>
```

Response:

```json
{
  "success": true,
  "message": "Ride accepted successfully",
  "data": {
    "ride": {
      "driverId": "authenticated-driver-id",
      "status": "ACCEPTED"
    }
  }
}
```

If another driver already accepted it:

```json
{
  "success": false,
  "message": "Ride is no longer available."
}
```

Update assigned ride status:

```http
PATCH /api/rides/:id/status
Authorization: Bearer <driver-jwt>
Content-Type: application/json
```

```json
{
  "status": "DRIVER_ARRIVING"
}
```

## Admin APIs

Admin metrics:

```http
GET /api/admin/metrics
Authorization: Bearer <admin-jwt>
```

Response:

```json
{
  "success": true,
  "data": {
    "totalRides": 0,
    "requestedRides": 0,
    "activeRides": 0,
    "completedRides": 0,
    "cancelledRides": 0,
    "completedRevenue": 0
  }
}
```

Admin ride list with filters:

```http
GET /api/rides?status=COMPLETED
GET /api/rides?driver=DRIVER_ID
GET /api/rides?customer=CUSTOMER_ID
GET /api/rides?dateFrom=2026-08-01&dateTo=2026-08-12
Authorization: Bearer <admin-jwt>
```

Response:

```json
{
  "success": true,
  "message": "Rides retrieved successfully",
  "data": {
    "rides": [
      {
        "bookingId": "FLT-20260812-ABCD",
        "customerId": {
          "name": "Customer User",
          "email": "customer@example.com",
          "role": "CUSTOMER"
        },
        "driverId": {
          "name": "Driver One",
          "email": "driver1@example.com",
          "role": "DRIVER"
        },
        "pickup": "Tezpur University",
        "destination": "Tezpur Airport",
        "requestedTime": "2026-08-12T10:30:00.000Z",
        "estimatedFare": 280,
        "status": "COMPLETED"
      }
    ]
  }
}
```

Response:

```json
{
  "success": true,
  "message": "Ride status updated successfully",
  "data": {
    "ride": {
      "status": "DRIVER_ARRIVING"
    }
  }
}
```

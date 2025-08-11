# SSELFIE Studio API Documentation

## Authentication Endpoints
### POST /api/auth/login
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

### POST /api/auth/register
Creates a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

## Image Generation Endpoints
### POST /api/images/generate
Generates a new image based on user parameters.

**Request Body:**
```json
{
  "prompt": "string",
  "style": "string",
  "size": "string"
}
```

## Payment Endpoints
### POST /api/payments/create-subscription
Creates a new subscription for the user.

**Request Body:**
```json
{
  "priceId": "string",
  "customerId": "string"
}
```

## Admin Endpoints
### GET /api/admin/users
Returns a list of all users (requires admin privileges).

### GET /api/admin/metrics
Returns system-wide metrics and analytics.
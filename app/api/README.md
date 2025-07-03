# Yathrananda API Documentation

## Authentication

All API endpoints require Bearer token authentication. Include the following header in all requests:

```
Authorization: Bearer your-api-token
```

## Endpoints

### Hero Section

#### GET /api/hero
Returns active hero media for the carousel.

Response:
```json
{
  "media": [
    {
      "id": "string",
      "url": "string",
      "type": "image" | "video",
      "carousel_order": number
    }
  ]
}
```

### Packages

#### GET /api/packages
Returns list of all travel packages with basic information.

Response:
```json
{
  "packages": [
    {
      "id": "string",
      "title": "string",
      "subtitle": "string",
      "description": "string",
      "overview": "string",
      "price": number,
      "duration": "string",
      "location": "string",
      "image_url": "string",
      "hero_image_url": "string",
      "hero_image_alt": "string",
      "group_size": "string",
      "advance_payment": "string",
      "balance_payment": "string"
    }
  ]
}
```

#### GET /api/packages/[id]
Returns detailed information about a specific package.

Response:
```json
{
  "package": {
    // Basic package info +
    "itinerary": [
      {
        "day": number,
        "title": "string",
        "route": "string",
        "meal_plan": "string",
        "notes": "string",
        "activities": ["string"],
        "images": [
          {
            "url": "string",
            "alt": "string"
          }
        ]
      }
    ],
    "gallery": [
      {
        "url": "string",
        "alt": "string",
        "caption": "string"
      }
    ],
    "bookingInfo": {
      "advancePayment": "string",
      "balancePayment": "string",
      "bookingRules": ["string"]
    },
    "cancellationPolicy": {
      "rules": ["string"]
    }
  }
}
```

### FAQs

#### GET /api/faqs
Returns list of all FAQs.

Response:
```json
{
  "faqs": [
    {
      "id": "string",
      "question": "string",
      "answer": "string"
    }
  ]
}
```

### Testimonials

#### GET /api/testimonials
Returns list of all testimonials.

Response:
```json
{
  "testimonials": [
    {
      "id": "string",
      "client_name": "string",
      "message": "string",
      "image_url": "string"
    }
  ]
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 401: Unauthorized (invalid or missing token)
- 404: Resource not found
- 500: Server error

## Caching

The API implements caching with the following TTLs:
- Hero: 60 seconds, stale for 5 minutes
- Packages: 5 minutes, stale for 10 minutes
- Package Details: 5 minutes, stale for 10 minutes
- FAQs: 1 hour, stale for 2 hours
- Testimonials: 5 minutes, stale for 10 minutes 
# Complete API Endpoint Reference

**Base URL:** `/api`  
**Production URL:** `https://toyxona-backend-1.onrender.com/api`  
**Health Check:** `GET /health` (no prefix)

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Authentication & Authorization

### Required Headers

| Header | When Required | Value |
|--------|---------------|-------|
| `Content-Type` | JSON requests | `application/json` |
| `Authorization` | Protected routes | `Bearer <accessToken>` |
| `Content-Type` | File uploads | `multipart/form-data` (auto-set by browser) |

### User Roles

- `admin` - Full system access
- `owner` - Venue management
- `customer` - Booking and payments

---

## Complete Endpoint Table

### Health Check

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/health` | No | — | API health check |

---

### Authentication Module (`/api/auth`)

| Method | Path | Auth | Roles | Request Body | Response |
|--------|------|------|-------|--------------|----------|
| POST | `/register/customer` | No | — | RegisterRequestBody | RegisterSuccessPayload |
| POST | `/register/owner` | No | — | RegisterRequestBody | RegisterSuccessPayload |
| POST | `/verify-otp` | No | — | VerifyOtpRequestBody | AuthSuccessPayload |
| POST | `/resend-otp` | No | — | ResendOtpRequestBody | { otpCode: string } |
| POST | `/login` | No | — | LoginRequestBody | AuthSuccessPayload |
| POST | `/logout` | Yes | Any | — | { message: string } |
| POST | `/forgot-password` | No | — | ForgotPasswordRequestBody | { message: string, resetToken: string } |
| POST | `/reset-password` | No | — | ResetPasswordRequestBody | { message: string } |

---

### Users Module (`/api/users`)

| Method | Path | Auth | Roles | Request Body | Response |
|--------|------|------|-------|--------------|----------|
| GET | `/me` | Yes | Any | — | SafeUser |
| GET | `/` | Yes | Admin | — | PaginatedResponse<SafeUser> |
| PATCH | `/` | Yes | Any | UpdateSelfRequestBody | SafeUser |
| DELETE | `/` | Yes | Any | — | { message: string } |
| POST | `/change-password` | Yes | Any | ChangePasswordRequestBody | { message: string } |
| PATCH | `/:id` | Yes | Admin | UpdateUserByAdminRequestBody | SafeUser |
| DELETE | `/:id` | Yes | Admin | — | { message: string } |

---

### Venues Module (`/api/venues`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| GET | `/` | No | — | — | district, capacity, minPrice, maxPrice, search, page, limit | PaginatedVenuesResponse |
| GET | `/:id` | No | — | — | — | SafeVenue |
| POST | `/` | Yes | Owner, Admin | CreateVenueRequestBody | — | SafeVenue |
| PATCH | `/:id` | Yes | Owner, Admin | UpdateVenueRequestBody | — | SafeVenue |
| DELETE | `/:id` | Yes | Owner, Admin | — | — | { message: string } |
| PATCH | `/:id/status` | Yes | Admin | UpdateVenueStatusRequestBody | — | SafeVenue |

---

### Venue Images Module (`/api/venues`)

| Method | Path | Auth | Roles | Request Body | Content-Type | Response |
|--------|------|------|-------|--------------|--------------|----------|
| GET | `/:venueId/images` | No | — | — | — | VenueImage[] |
| POST | `/:venueId/images` | Yes | Owner, Admin | FormData (field: image) | multipart/form-data | VenueImage |
| DELETE | `/images/:imageId` | Yes | Owner, Admin | — | — | { message: string } |

---

### Menu Items Module (`/api/menu-items`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| GET | `/` | No | — | — | venueId | SafeMenuItem[] |
| GET | `/:id` | No | — | — | — | SafeMenuItem |
| POST | `/` | Yes | Owner, Admin | CreateMenuItemRequestBody | — | SafeMenuItem |
| PATCH | `/:id` | Yes | Owner, Admin | UpdateMenuItemRequestBody | — | SafeMenuItem |
| DELETE | `/:id` | Yes | Owner, Admin | — | — | { message: string } |

---

### Singers Module (`/api/singers`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| GET | `/` | No | — | — | venueId | SafeSinger[] |
| GET | `/:id` | No | — | — | — | SafeSinger |
| POST | `/` | Yes | Owner, Admin | CreateSingerRequestBody | — | SafeSinger |
| PATCH | `/:id` | Yes | Owner, Admin | UpdateSingerRequestBody | — | SafeSinger |
| DELETE | `/:id` | Yes | Owner, Admin | — | — | { message: string } |

---

### Cars Module (`/api/cars`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| GET | `/` | No | — | — | venueId | SafeCar[] |
| GET | `/:id` | No | — | — | — | SafeCar |
| POST | `/` | Yes | Owner, Admin | CreateCarRequestBody | — | SafeCar |
| PATCH | `/:id` | Yes | Owner, Admin | UpdateCarRequestBody | — | SafeCar |
| DELETE | `/:id` | Yes | Owner, Admin | — | — | { message: string } |

---

### Karnay Surnay Module (`/api/karnay-surnay`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| GET | `/` | No | — | — | venueId | SafeKarnaySurnay[] |
| GET | `/:id` | No | — | — | — | SafeKarnaySurnay |
| POST | `/` | Yes | Owner, Admin | CreateKarnaySurnayRequestBody | — | SafeKarnaySurnay |
| PATCH | `/:id` | Yes | Owner, Admin | UpdateKarnaySurnayRequestBody | — | SafeKarnaySurnay |
| DELETE | `/:id` | Yes | Owner, Admin | — | — | { message: string } |

---

### Bookings Module (`/api/bookings`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| POST | `/` | Yes | Customer | CreateBookingRequestBody | — | BookingTotals |
| GET | `/` | Yes | Any | — | search, status, page, limit, sortBy, sortOrder | PaginatedResponse<BookingListItem> |
| PATCH | `/` | Yes | Any | UpdateBookingRequestBody | — | BookingListItem |
| DELETE | `/` | Yes | Admin | DeleteBookingRequestBody | — | { message: string } |

---

### Payments Module (`/api/payments`)

| Method | Path | Auth | Roles | Request Body | Query Params | Response |
|--------|------|------|-------|--------------|-------------|----------|
| POST | `/` | Yes | Customer | CreatePaymentRequestBody | — | { transactionId, amount, success } |
| GET | `/` | Yes | Any | — | search, page, limit, sortBy, sortOrder | PaginatedResponse<PaymentListItem> |

---

### Reviews Module (`/api/reviews`)

| Method | Path | Auth | Roles | Request Body | Response |
|--------|------|------|-------|--------------|----------|
| GET | `/venues/:venueId` | No | — | — | Review[] |
| POST | `/` | Yes | Any | CreateReviewRequestBody | Review |
| GET | `/my-reviews` | Yes | Any | — | Review[] |
| PATCH | `/:id` | Yes | Any | UpdateReviewRequestBody | Review |
| DELETE | `/:id` | Yes | Any | — | { message: string } |

---

### Favorites Module (`/api/favorites`)

| Method | Path | Auth | Roles | Request Body | Response |
|--------|------|------|-------|--------------|----------|
| GET | `/` | Yes | Customer | — | FavoriteVenue[] |
| POST | `/venues/:venueId` | Yes | Customer | — | { message: string } |
| DELETE | `/venues/:venueId` | Yes | Customer | — | { message: string } |

---

### Admin Module (`/api/admin`)

| Method | Path | Auth | Roles | Query Params | Response |
|--------|------|------|-------|-------------|----------|
| GET | `/dashboard` | Yes | Admin | — | DashboardSummary |
| GET | `/users` | Yes | Admin | search, page, limit, sortBy, sortOrder | PaginatedResponse<SafeUser> |
| GET | `/owners` | Yes | Admin | search, page, limit, sortBy, sortOrder | PaginatedResponse<SafeUser> |
| GET | `/venues` | Yes | Admin | search, page, limit, sortBy, sortOrder, status | PaginatedResponse<SafeVenue> |
| GET | `/bookings` | Yes | Admin | search, page, limit, sortBy, sortOrder, status | PaginatedResponse<BookingListItem> |

---

## Pagination & Filtering

### Standard Pagination Query Params

All list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Text search across relevant fields
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc` (default: `asc`)

### Paginated Response Format

```json
{
  "success": true,
  "message": "Items fetched successfully",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## File Uploads

### Venue Image Upload

**Endpoint:** `POST /api/venues/:venueId/images`

**Requirements:**
- Authentication required
- Role: Owner or Admin
- Content-Type: `multipart/form-data`
- Form field name: `image`

**Example:**
```typescript
const formData = new FormData()
formData.append('image', file)

await fetch(`${API_URL}/venues/${venueId}/images`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})
```

---

## Validation Coverage

### Input Validation

All endpoints use middleware validation:
- ID parameters validated via `validateIdParam()`
- Request bodies validated against TypeScript interfaces
- Required fields checked
- Type validation enforced
- Business logic validation in services

### Common Validation Rules

- **Email:** Valid email format
- **Phone:** Valid phone number format
- **Password:** Minimum 6 characters
- **IDs:** Must be positive integers
- **Dates:** Valid date strings (YYYY-MM-DD)
- **Status:** Must match enum values

---

## Error Handling

### Standard Error Responses

All errors return consistent format:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Common Error Messages

- `"Unauthorized"` - Missing or invalid token
- `"Forbidden"` - Insufficient permissions
- `"Invalid credentials"` - Wrong username/password
- `"User not found"` - Resource doesn't exist
- `"Email already exists"` - Duplicate email
- `"Username already exists"` - Duplicate username
- `"Invalid or expired token"` - JWT validation failed
- `"All fields are required"` - Missing required fields
- `"Password must be at least 6 characters"` - Password too short
- `"Invalid or expired OTP"` - OTP validation failed
- `"User is not verified"` - Account not verified
- `"Only customers can create bookings"` - Role restriction
- `"Duplicate booking date"` - Venue already booked
- `"Venue not found"` - Venue doesn't exist
- `"Route not found"` - Invalid endpoint

---

## Data Types Reference

### User Types

```typescript
type UserRole = 'admin' | 'owner' | 'customer'

interface SafeUser {
  id: number | string
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  role: UserRole
  isVerified: boolean
  createdAt: string
}
```

### Venue Types

```typescript
type VenueStatus = 'pending' | 'approved' | 'rejected'

interface SafeVenue {
  id: number | string
  ownerId: number | string
  name: string
  district: string
  address: string
  capacity: number
  pricePerSeat: number | string
  phone: string
  status: VenueStatus
  createdAt: string
}
```

### Booking Types

```typescript
type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

interface BookingListItem {
  id: number | string
  venueId: number | string
  venueName: string
  customerId: number | string
  customerName: string
  bookingDate: string
  guestCount: number
  totalPrice: number | string
  advanceAmount: number | string
  status: BookingStatus
  createdAt: string
}
```

### Payment Types

```typescript
type PaymentType = 'advance' | 'full'
type PaymentStatus = 'pending' | 'paid' | 'failed'

interface PaymentListItem {
  id: number | string
  bookingId: number | string
  transactionId: string
  amount: number | string
  paymentType: PaymentType
  paymentStatus: PaymentStatus
  paidAt: string | null
  createdAt: string
  bookingDate: string
  venueName: string
  customerName: string
}
```

---

*Last updated: 2026-06-03*

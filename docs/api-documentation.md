# Wedding Hall Booking System API Documentation

## Common

- Base URL: `/api`
- Health check: `GET /health` → `{ "success": true, "message": "API is running" }`
- Auth header: `Authorization: Bearer <token>`
- Standard success response: `{ success: true, message: string, data?: object }`
- Standard error response: `{ success: false, message: string }`

## Auth Module

### POST `/api/auth/register/customer`

- Authentication Required: No
- Role Required: None
- Request Body:
  ```json
  {
  	"firstName": "John",
  	"lastName": "Doe",
  	"username": "johndoe",
  	"email": "john@example.com",
  	"phone": "+998901234567",
  	"password": "Secret123!"
  }
  ```
- Response Example:
  ```json
  {
  	"success": true,
  	"message": "Customer registered successfully",
  	"data": { "user": {}, "otpCode": "123456" }
  }
  ```
- Possible Errors: 400, 409, 500

### POST `/api/auth/register/owner`

- Authentication Required: No
- Role Required: None
- Request Body: same as customer register
- Response Example: same shape as customer register
- Possible Errors: 400, 409, 500

### POST `/api/auth/verify-otp`

- Authentication Required: No
- Role Required: None
- Request Body: `{ "email": "john@example.com", "otpCode": "123456" }`
- Response Example: `{ "success": true, "message": "OTP verified successfully", "data": { "accessToken": "...", "user": {} } }`
- Possible Errors: 400, 404, 500

### POST `/api/auth/resend-otp`

- Authentication Required: No
- Role Required: None
- Request Body: `{ "email": "john@example.com" }`
- Response Example: `{ "success": true, "message": "OTP resent successfully", "data": { "otpCode": "123456" } }`
- Possible Errors: 400, 404, 500

### POST `/api/auth/login`

- Authentication Required: No
- Role Required: None
- Request Body: `{ "identifier": "johndoe", "password": "Secret123!" }`
- Response Example: `{ "success": true, "message": "Login successful", "data": { "accessToken": "...", "user": {} } }`
- Possible Errors: 400, 401, 403, 500

### POST `/api/auth/logout`

- Authentication Required: Yes
- Role Required: Any authenticated user
- Request Body: None
- Response Example: `{ "success": true, "message": "Logout successful" }`
- Possible Errors: 401, 500

## Users Module

### GET `/api/users/me`

- Authentication Required: Yes
- Role Required: admin | owner | customer
- Request Body: None
- Response Example: `{ "success": true, "message": "User profile fetched", "data": {} }`
- Possible Errors: 401, 404

### GET `/api/users`

- Authentication Required: Yes
- Role Required: admin
- Request Body: None
- Response Example: `{ "success": true, "message": "Users fetched", "data": { "items": [], "total": 0 } }`
- Possible Errors: 401, 403

### GET `/api/users/`

- Same as `GET /api/users`

### PATCH `/api/users/`

- Authentication Required: Yes
- Role Required: admin | owner | customer
- Request Body:
  ```json
  { "firstName": "John", "lastName": "Doe", "phone": "+998901234567" }
  ```
- Response Example: `{ "success": true, "message": "User updated", "data": {} }`
- Possible Errors: 401, 404, 400

### DELETE `/api/users/`

- Authentication Required: Yes
- Role Required: admin | owner | customer
- Request Body: None
- Response Example: `{ "success": true, "message": "User deleted" }`
- Possible Errors: 401, 404

### PATCH `/api/users/:id`

- Authentication Required: Yes
- Role Required: admin
- Request Body: `{ "role": "owner", "isVerified": true }`
- Possible Errors: 401, 403, 404

### DELETE `/api/users/:id`

- Authentication Required: Yes
- Role Required: admin
- Request Body: None
- Possible Errors: 401, 403, 404

## Venues Module

### POST `/api/venues`

- Authentication Required: Yes
- Role Required: owner | admin
- Request Body:
  ```json
  {
  	"name": "Grand Hall",
  	"district": "Yunusobod",
  	"address": "Street 1",
  	"capacity": 300,
  	"pricePerSeat": 100000,
  	"phone": "+998901234567"
  }
  ```
- Possible Errors: 401, 403, 400

### GET `/api/venues`

- Authentication Required: No
- Role Required: None
- Query Params: `district`, `capacity`, `minPrice`, `maxPrice`, `search`, `page`, `limit`
- Response Example: `{ "success": true, "message": "Venues fetched successfully", "data": { "items": [], "total": 0, "page": 1, "limit": 10, "totalPages": 1 } }`

### GET `/api/venues/`

- Same as `GET /api/venues`

### PATCH `/api/venues/:id`

- Authentication Required: Yes
- Role Required: owner | admin
- Request Body: partial venue fields

### DELETE `/api/venues/:id`

- Authentication Required: Yes
- Role Required: owner | admin

### PATCH `/api/venues/:id/status`

- Authentication Required: Yes
- Role Required: admin
- Request Body: `{ "status": "approved" }` or `{ "status": "rejected" }`

## Venue Images Module

### POST `/api/venues/:venueId/images`

- Authentication Required: Yes
- Role Required: owner | admin
- Content Type: `multipart/form-data`
- Field: `image`

### GET `/api/venues/:venueId/images`

- Authentication Required: No

### DELETE `/api/venues/images/:imageId`

- Authentication Required: Yes
- Role Required: owner | admin

## Menu Items Module

### POST `/api/menu-items`

- Authentication Required: Yes
- Role Required: owner | admin

### GET `/api/menu-items`

- Authentication Required: No

### GET `/api/menu-items/:id`

- Authentication Required: No

### PATCH `/api/menu-items/:id`

- Authentication Required: Yes
- Role Required: owner | admin

### DELETE `/api/menu-items/:id`

- Authentication Required: Yes
- Role Required: owner | admin

## Singers Module

### POST `/api/singers`

- Authentication Required: Yes
- Role Required: owner | admin

### GET `/api/singers`

- Authentication Required: No

### GET `/api/singers/:id`

- Authentication Required: No

### PATCH `/api/singers/:id`

- Authentication Required: Yes
- Role Required: owner | admin

### DELETE `/api/singers/:id`

- Authentication Required: Yes
- Role Required: owner | admin

## Cars Module

### POST `/api/cars`

- Authentication Required: Yes
- Role Required: owner | admin

### GET `/api/cars`

- Authentication Required: No

### GET `/api/cars/:id`

- Authentication Required: No

### PATCH `/api/cars/:id`

- Authentication Required: Yes
- Role Required: owner | admin

### DELETE `/api/cars/:id`

- Authentication Required: Yes
- Role Required: owner | admin

## Karnay Surnay Module

### POST `/api/karnay-surnay`

- Authentication Required: Yes
- Role Required: owner | admin

### GET `/api/karnay-surnay`

- Authentication Required: No

### GET `/api/karnay-surnay/:id`

- Authentication Required: No

### PATCH `/api/karnay-surnay/:id`

- Authentication Required: Yes
- Role Required: owner | admin

### DELETE `/api/karnay-surnay/:id`

- Authentication Required: Yes
- Role Required: owner | admin

## Bookings Module

### POST `/api/bookings`

- Authentication Required: Yes
- Role Required: customer
- Request Body:
  ```json
  {
  	"venueId": 1,
  	"bookingDate": "2026-08-20",
  	"guestCount": 300,
  	"singerIds": [1, 2],
  	"carIds": [1],
  	"karnaySurnayIds": [1]
  }
  ```
- Possible Errors: 400, 403, 404, 409

### GET `/api/bookings`

- Authentication Required: Yes
- Role Required: admin | owner | customer

### GET `/api/bookings/`

- Same as `GET /api/bookings`

### PATCH `/api/bookings/`

- Authentication Required: Yes
- Role Required: admin | owner | customer
- Request Body: `{ "bookingId": 1, "status": "cancelled" }`

### DELETE `/api/bookings/`

- Authentication Required: Yes
- Role Required: admin
- Request Body: `{ "bookingId": 1 }`

## Payments Module

### POST `/api/payments`

- Authentication Required: Yes
- Role Required: customer
- Request Body: `{ "bookingId": 1, "paymentType": "advance" }`
- Response Example:
  ```json
  {
  	"success": true,
  	"message": "Payment successful",
  	"data": {
  		"transactionId": "TXN-20260701-123456",
  		"amount": 5000000,
  		"success": true
  	}
  }
  ```

### GET `/api/payments`

- Authentication Required: Yes
- Role Required: admin | owner | customer

### GET `/api/payments/`

- Same as `GET /api/payments`

## Admin Module

### GET `/api/admin/dashboard`

- Authentication Required: Yes
- Role Required: admin
- Returns: `totalUsers`, `totalOwners`, `totalCustomers`, `totalVenues`, `approvedVenues`, `pendingVenues`, `totalBookings`, `completedBookings`, `upcomingBookings`, `cancelledBookings`, `totalRevenue`

### GET `/api/admin/bookings`

- Authentication Required: Yes
- Role Required: admin
- Supports: `search`, `page`, `limit`, `sortBy`, `sortOrder`, `status`

### GET `/api/admin/users`

- Authentication Required: Yes
- Role Required: admin
- Supports: `search`, `page`, `limit`, `sortBy`, `sortOrder`

### GET `/api/admin/owners`

- Authentication Required: Yes
- Role Required: admin
- Supports: `search`, `page`, `limit`, `sortBy`, `sortOrder`

### GET `/api/admin/venues`

- Authentication Required: Yes
- Role Required: admin
- Supports: `search`, `page`, `limit`, `sortBy`, `sortOrder`, `status`

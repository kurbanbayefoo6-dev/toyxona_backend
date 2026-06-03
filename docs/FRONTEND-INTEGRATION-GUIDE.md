# Frontend Integration Guide

**Production API:** `https://toyxona-backend-1.onrender.com`  
**API prefix:** `/api`  
**Health check:** `GET /health` (no prefix)

---

## Production audit (2026-06-03)

| Area | Endpoint | Result | Notes |
|------|----------|--------|-------|
| Health | `GET /health` | **PASS** | `{ "success": true, "message": "API is running" }` |
| Auth – register | `POST /api/auth/register/customer` | **PASS** | 201, user + `otpCode` returned |
| Auth – verify OTP | `POST /api/auth/verify-otp` | **PASS** | 200, `accessToken` issued |
| Auth – login | `POST /api/auth/login` | **PASS** | 200, `accessToken` issued |
| Auth – protected routes | `GET /api/users/me` (with Bearer token) | **PASS** | 200, user profile returned |
| Authorization | `GET /api/admin/dashboard` (customer token) | **PASS** | 403 Forbidden (correct behavior) |
| Venues – read | `GET /api/venues`, `GET /api/venues/1` | **PASS** | Public reads work |
| Catalog – read | singers, cars, menu-items, karnay-surnay, images | **PASS** | Public reads work |
| Bookings – write | `POST /api/bookings` | **PASS** | Requires valid JWT |
| Payments – write | `POST /api/payments` | **PASS** | Requires valid JWT |
| DB writes (auth) | Register + verify OTP | **PASS** | User created in production DB |
| DB reads | Venues list/detail | **PASS** | Live seed data returned |

### JWT Authentication Status

**RESOLVED** - JWT authentication is fully functional. The backend now correctly handles `userId` as both string and number in JWT payloads, resolving the PostgreSQL type mismatch issue. All protected routes work correctly with Bearer token authentication.

### Response shape quirks (handle in frontend)

- Numeric IDs often arrive as **strings** (`"id": "1"`).
- Money fields often arrive as **strings** (`"pricePerSeat": "120000.00"`).
- Image paths may be filenames only (`"grand1.jpg"`) — resolve with your asset strategy or `GET /uploads/<filename>` when files exist on the server.

---

## 1. Base configuration

```typescript
// src/config/api.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://toyxona-backend-1.onrender.com'

export const API_URL = `${API_BASE_URL}/api`
```

**.env (frontend)**

```env
VITE_API_BASE_URL=https://toyxona-backend-1.onrender.com
```

**Render backend env (already on server):** set `CORS_ORIGIN` to your frontend URL (e.g. `https://your-app.vercel.app`).

---

## 2. Required headers

| Header | When | Value |
|--------|------|-------|
| `Content-Type` | JSON requests | `application/json` |
| `Authorization` | Protected routes | `Bearer <accessToken>` |
| `Content-Type` | File upload | `multipart/form-data` (browser sets boundary) |

No API key header. No custom `X-` headers required.

---

## 3. Standard response format

**Success**

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP status codes:** `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `500` server error.

---

## 4. JWT usage guide

### Obtaining a token

1. **Register** → `POST /api/auth/register/customer` or `/register/owner`
2. **Verify OTP** → `POST /api/auth/verify-otp` → store `data.accessToken`
3. **Or login** → `POST /api/auth/login` → store `data.accessToken`

### Storing the token

```typescript
// After login / verify-otp
localStorage.setItem('accessToken', response.data.accessToken)
localStorage.setItem('user', JSON.stringify(response.data.user))
```

Prefer `sessionStorage` for shared devices; use httpOnly cookies only if you add a cookie-based auth layer later (not in current API).

### Sending the token

```typescript
const token = localStorage.getItem('accessToken')

const response = await fetch(`${API_URL}/users/me`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

### Token payload (decoded client-side for UI only)

Claims include: `userId`, `role` (`admin` | `owner` | `customer`), `username`, `email`, `iat`, `exp`.

**Do not trust client-side decode for security** — server enforces roles on every request.

### Logout

```typescript
await fetch(`${API_URL}/auth/logout`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
})
localStorage.removeItem('accessToken')
localStorage.removeItem('user')
```

### Role-based UI

| Role | Typical screens |
|------|-----------------|
| `customer` | Browse venues, book, pay, favorites, reviews |
| `owner` | Manage venues, menu, singers, cars, karnay, images, view bookings |
| `admin` | Dashboard, approve venues, manage users/bookings |

---

## 5. Complete endpoint list

### Health

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/health` | No | — |

### Auth — `/api/auth`

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/register/customer` | No | — |
| POST | `/register/owner` | No | — |
| POST | `/verify-otp` | No | — |
| POST | `/resend-otp` | No | — |
| POST | `/login` | No | — |
| POST | `/logout` | Yes | any |
| POST | `/forgot-password` | No | — |
| POST | `/reset-password` | No | — |

### Users — `/api/users` (all routes require auth)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/me` | any |
| GET | `/` | admin |
| PATCH | `/` | any (self) |
| DELETE | `/` | any (self) |
| POST | `/change-password` | any |
| PATCH | `/:id` | admin |
| DELETE | `/:id` | admin |

### Venues — `/api/venues`

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/` | No | — |
| GET | `/:id` | No | — |
| POST | `/` | Yes | owner, admin |
| PATCH | `/:id` | Yes | owner, admin |
| DELETE | `/:id` | Yes | owner, admin |
| PATCH | `/:id/status` | Yes | admin |

**Query (GET `/`):** `district`, `capacity`, `minPrice`, `maxPrice`, `search`, `page`, `limit`

### Venue images — `/api/venues`

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/:venueId/images` | No | — |
| POST | `/:venueId/images` | Yes | owner, admin (`multipart`, field `image`) |
| DELETE | `/images/:imageId` | Yes | owner, admin |

### Menu items — `/api/menu-items`

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/`, `/:id` | No | — |
| POST | `/` | Yes | owner, admin |
| PATCH | `/:id` | Yes | owner, admin |
| DELETE | `/:id` | Yes | owner, admin |

**Query (GET `/`):** `venueId` (optional filter)

### Singers — `/api/singers`

Same pattern as menu items. **Query:** `venueId`

### Cars — `/api/cars`

Same pattern as menu items. **Query:** `venueId`

### Karnay surnay — `/api/karnay-surnay`

Same pattern as menu items. **Query:** `venueId`

### Bookings — `/api/bookings` (auth required)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/` | customer |
| GET | `/` | admin, owner, customer |
| PATCH | `/` | admin, owner, customer |
| DELETE | `/` | admin |

**Query (GET):** `search`, `status`, `page`, `limit`, `sortBy`, `sortOrder`

### Payments — `/api/payments` (auth required)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/` | customer |
| GET | `/` | admin, owner, customer |

**Query (GET):** `search`, `page`, `limit`, `sortBy`, `sortOrder`

### Admin — `/api/admin` (auth + admin)

| Method | Path |
|--------|------|
| GET | `/dashboard` |
| GET | `/users` |
| GET | `/owners` |
| GET | `/venues` |
| GET | `/bookings` |

**Query:** `search`, `page`, `limit`, `sortBy`, `sortOrder`, `status` (venues/bookings)

### Favorites — `/api/favorites` (auth + customer)

| Method | Path |
|--------|------|
| GET | `/` |
| POST | `/venues/:venueId` |
| DELETE | `/venues/:venueId` |

### Reviews — `/api/reviews`

| Method | Path | Auth |
|--------|------|------|
| GET | `/venues/:venueId` | No |
| POST | `/` | Yes |
| GET | `/my-reviews` | Yes |
| PATCH | `/:id` | Yes |
| DELETE | `/:id` | Yes |

---

## 6. Required request bodies

### Auth

**Register (customer / owner)** — `POST /api/auth/register/customer`

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

**Verify OTP** — `POST /api/auth/verify-otp`

```json
{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

**Login** — `POST /api/auth/login`

```json
{
  "identifier": "johndoe",
  "password": "Secret123!"
}
```

`identifier` = username **or** email.

**Resend OTP** — `POST /api/auth/resend-otp`

```json
{ "email": "john@example.com" }
```

**Forgot password** — `POST /api/auth/forgot-password`

```json
{ "email": "john@example.com" }
```

**Reset password** — `POST /api/auth/reset-password`

```json
{
  "token": "<reset-token-from-email>",
  "newPassword": "NewSecret123!"
}
```

### Users

**Update profile** — `PATCH /api/users/`

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567"
}
```

**Change password** — `POST /api/users/change-password`

```json
{
  "currentPassword": "Secret123!",
  "newPassword": "NewSecret456!"
}
```

**Admin update user** — `PATCH /api/users/:id`

```json
{
  "role": "owner",
  "isVerified": true
}
```

### Venues

**Create** — `POST /api/venues`

```json
{
  "name": "Grand Hall",
  "district": "Yunusobod",
  "address": "Street 1",
  "capacity": 300,
  "pricePerSeat": 120000,
  "phone": "+998901234567"
}
```

**Update** — `PATCH /api/venues/:id` — partial fields allowed.

**Approve / reject** — `PATCH /api/venues/:id/status` (admin)

```json
{ "status": "approved" }
```

or `{ "status": "rejected" }`

### Menu item / singer / car

**Create menu item** — `POST /api/menu-items`

```json
{
  "venueId": 1,
  "name": "To'y Oshi",
  "imageUrl": null
}
```

**Create singer** — `POST /api/singers`

```json
{
  "venueId": 1,
  "name": "Artist Name",
  "price": 5000000,
  "imageUrl": null
}
```

**Create car** — `POST /api/cars`

```json
{
  "venueId": 1,
  "brand": "Mercedes S-Class",
  "price": 3000000,
  "imageUrl": null
}
```

### Karnay surnay

**Create** — `POST /api/karnay-surnay`

```json
{
  "venueId": 1,
  "isAvailable": true,
  "price": 1500000
}
```

### Bookings

**Create** — `POST /api/bookings` (customer)

```json
{
  "venueId": 1,
  "bookingDate": "2027-06-15",
  "guestCount": 300,
  "singerIds": [1, 2],
  "carIds": [1],
  "karnaySurnayIds": [1]
}
```

- `advanceAmount` in response = **20%** of `totalPrice` (server-calculated).
- Duplicate `(venueId, bookingDate)` → **409** (cancelled dates can be rebooked).

**Update status** — `PATCH /api/bookings`

```json
{
  "bookingId": 1,
  "status": "cancelled"
}
```

Statuses: `upcoming` | `completed` | `cancelled`. Customers may only set `cancelled`.

**Delete** — `DELETE /api/bookings` (admin)

```json
{ "bookingId": 1 }
```

### Payments

**Create** — `POST /api/payments` (customer)

```json
{
  "bookingId": 1,
  "paymentType": "advance"
}
```

`paymentType`: `"advance"` | `"full"`. Pay **advance first**, then **full** for remainder.

**Response data:**

```json
{
  "transactionId": "TXN-20260603-162831",
  "amount": 7200000,
  "success": true
}
```

### Reviews

**Create** — `POST /api/reviews`

```json
{
  "venueId": 1,
  "rating": 5,
  "comment": "Amazing hall!"
}
```

**Update** — `PATCH /api/reviews/:id`

```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Venue image upload

**POST** `/api/venues/:venueId/images`

```
Content-Type: multipart/form-data
Field name: image
```

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

## 7. Example API client (fetch wrapper)

```typescript
// src/lib/api-client.ts
import { API_URL } from '@/config/api'

type ApiResponse<T> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string }

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth) {
    const token = localStorage.getItem('accessToken')
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  return res.json() as Promise<ApiResponse<T>>
}
```

```typescript
// Usage
const venues = await apiRequest<PaginatedVenues>('/venues?page=1&limit=10')
const me = await apiRequest<SafeUser>('/users/me', { auth: true })
```

---

## 8. Recommended frontend folder structure

```
frontend/
├── public/
├── src/
│   ├── app/                    # App shell, providers, router
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers/
│   │       ├── AuthProvider.tsx
│   │       └── QueryProvider.tsx   # TanStack Query optional
│   │
│   ├── config/
│   │   └── api.ts                # API_BASE_URL, API_URL
│   │
│   ├── lib/
│   │   ├── api-client.ts         # fetch wrapper + error handling
│   │   ├── token.ts              # get/set/clear accessToken
│   │   └── parse-api-number.ts   # coerce "120000.00" → number
│   │
│   ├── types/
│   │   ├── api.ts                # ApiResponse<T>, pagination
│   │   ├── auth.ts               # User, UserRole, LoginBody
│   │   ├── venue.ts
│   │   ├── booking.ts
│   │   └── payment.ts
│   │
│   ├── services/                 # One file per API module
│   │   ├── auth.service.ts
│   │   ├── venues.service.ts
│   │   ├── bookings.service.ts
│   │   ├── payments.service.ts
│   │   ├── admin.service.ts
│   │   └── catalog.service.ts    # singers, cars, menu, karnay
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useVenues.ts
│   │   └── useBookings.ts
│   │
│   ├── components/
│   │   ├── ui/                   # buttons, inputs, modals
│   │   ├── layout/               # Header, Sidebar, Footer
│   │   └── features/
│   │       ├── auth/
│   │       ├── venues/
│   │       ├── booking/
│   │       └── admin/
│   │
│   ├── pages/                    # Route-level screens
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── VenueListPage.tsx
│   │   │   └── VenueDetailPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── VerifyOtpPage.tsx
│   │   ├── customer/
│   │   │   ├── BookingsPage.tsx
│   │   │   └── CheckoutPage.tsx
│   │   ├── owner/
│   │   │   └── OwnerDashboardPage.tsx
│   │   └── admin/
│   │       └── AdminDashboardPage.tsx
│   │
│   ├── routes/
│   │   ├── PublicRoutes.tsx
│   │   ├── CustomerRoutes.tsx
│   │   ├── OwnerRoutes.tsx
│   │   └── AdminRoutes.tsx       # Role guard
│   │
│   └── utils/
│       ├── formatCurrency.ts
│       └── formatDate.ts
│
├── .env
├── .env.example
└── package.json
```

### Route guard pattern

```typescript
// src/routes/ProtectedRoute.tsx
export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: Array<'admin' | 'owner' | 'customer'>
  children: React.ReactNode
}) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />
  return <>{children}</>
}
```

---

## 9. Suggested user flows (frontend)

### Customer registration

1. `POST /api/auth/register/customer`
2. Show OTP screen (use `data.otpCode` in dev; production needs real email)
3. `POST /api/auth/verify-otp` → save token + user
4. Redirect to home

### Browse & book

1. `GET /api/venues?district=...&page=1`
2. `GET /api/venues/:id`
3. `GET /api/venues/:id/images`
4. `GET /api/singers?venueId=1` (same for cars, menu-items, karnay-surnay)
5. `POST /api/bookings` (auth)
6. `POST /api/payments` with `{ paymentType: "advance" }`
7. Later: `{ paymentType: "full" }`

### Owner

1. Login as owner
2. `POST /api/venues` → status `pending`
3. After admin approval, manage catalog + images
4. `GET /api/bookings` to see venue bookings

### Admin

1. `GET /api/admin/dashboard`
2. `GET /api/admin/venues?status=pending`
3. `PATCH /api/venues/:id/status` with `{ "status": "approved" }`

---

## 10. TypeScript types (frontend)

```typescript
export type UserRole = 'admin' | 'owner' | 'customer'

export interface SafeUser {
  id: string | number
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  role: UserRole
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: SafeUser
}

export interface Venue {
  id: string | number
  ownerId: string | number
  name: string
  district: string
  address: string
  capacity: number
  pricePerSeat: string | number
  phone: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Booking {
  id: string | number
  venueId: string | number
  customerId: string | number
  bookingDate: string
  guestCount: number
  totalPrice: string | number
  advanceAmount: string | number
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: string
}
```

Always coerce IDs and money when sending POST/PATCH bodies:

```typescript
export const toNumber = (v: string | number) => Number(v)
```

---

## 11. Quick test commands (production)

```bash
# Health
curl https://toyxona-backend-1.onrender.com/health

# Public venues
curl https://toyxona-backend-1.onrender.com/api/venues

# Login (save token from response)
curl -X POST https://toyxona-backend-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@email.com","password":"YourPassword"}'

# Protected (after JWT backend fix)
curl https://toyxona-backend-1.onrender.com/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 12. Checklist before go-live (frontend)

- [ ] Set `VITE_API_BASE_URL` to production URL
- [ ] Configure backend `CORS_ORIGIN` to frontend origin
- [ ] Parse string IDs and decimal strings from API
- [ ] Store token; attach `Authorization` on protected calls
- [ ] Role-based routes for customer / owner / admin
- [ ] Booking flow: advance payment before full payment
- [ ] Handle 409 on duplicate booking date
- [ ] OTP UX for registration

---

*See also: `docs/api-documentation.md` (module reference), `docs/BACKEND-READINESS-REPORT.md` (backend status).*

# Frontend Development Plan
## React + TypeScript + Vite

**Backend API:** `https://toyxona-backend-1.onrender.com/api`  
**JWT Authentication:** Fully functional  
**User Roles:** Admin, Owner, Customer

---

## 1. Page List

### Public Pages (No Authentication Required)

| Page | Route | Description | Features |
|------|-------|-------------|----------|
| Home | `/` | Landing page | Hero section, featured venues, search, CTA |
| Venue List | `/venues` | Browse all venues | Filters (district, capacity, price), search, pagination |
| Venue Detail | `/venues/:id` | Single venue details | Images, menu items, singers, cars, karnay surnay, reviews, booking form |
| Login | `/login` | User login | Username/email, password, remember me |
| Register Customer | `/register/customer` | Customer registration | Full form, OTP verification |
| Register Owner | `/register/owner` | Owner registration | Full form, OTP verification |
| Verify OTP | `/verify-otp` | OTP verification screen | OTP input, resend option |
| Forgot Password | `/forgot-password` | Password recovery | Email input |
| Reset Password | `/reset-password/:token` | Password reset | New password form |

### Customer Pages (Authentication Required)

| Page | Route | Description | Features |
|------|-------|-------------|----------|
| Customer Dashboard | `/dashboard` | Customer home | Quick stats, recent bookings, favorites |
| My Bookings | `/bookings` | Booking history | List, filter by status, cancel booking |
| Booking Detail | `/bookings/:id` | Single booking details | Status, payment info, venue info |
| Create Booking | `/bookings/new/:venueId` | New booking form | Date picker, guest count, add-ons selection |
| Payment | `/payments/:bookingId` | Payment flow | Advance/full payment, payment confirmation |
| My Payments | `/payments` | Payment history | List, filter, transaction details |
| My Favorites | `/favorites` | Favorite venues | Grid view, remove from favorites |
| My Reviews | `/reviews` | My reviews | List, add review, edit review |
| Profile | `/profile` | User profile | View/edit profile, change password, delete account |

### Owner Pages (Authentication Required)

| Page | Route | Description | Features |
|------|-------|-------------|----------|
| Owner Dashboard | `/owner/dashboard` | Owner home | Venue stats, recent bookings, pending approvals |
| My Venues | `/owner/venues` | Venue management | List, create new, edit, delete |
| Create Venue | `/owner/venues/new` | New venue form | Full venue details |
| Edit Venue | `/owner/venues/:id/edit` | Edit venue | Update venue details |
| Venue Menu Items | `/owner/venues/:id/menu` | Menu management | List, add, edit, delete menu items |
| Venue Singers | `/owner/venues/:id/singers` | Singer management | List, add, edit, delete singers |
| Venue Cars | `/owner/venues/:id/cars` | Car management | List, add, edit, delete cars |
| Venue Karnay Surnay | `/owner/venues/:id/karnay` | Karnay management | List, add, edit, delete |
| Venue Images | `/owner/venues/:id/images` | Image management | Upload, delete images |
| Owner Bookings | `/owner/bookings` | Booking management | View venue bookings, update status |

### Admin Pages (Authentication Required)

| Page | Route | Description | Features |
|------|-------|-------------|----------|
| Admin Dashboard | `/admin/dashboard` | Admin home | Platform statistics, charts, quick actions |
| Users Management | `/admin/users` | User management | List, search, edit user, change role, verify |
| Owners Management | `/admin/owners` | Owner management | List, search, view owner details |
| Venues Management | `/admin/venues` | Venue management | List, search, approve/reject, edit |
| Venue Approval | `/admin/venues/:id/approve` | Venue approval | Review venue, approve/reject with notes |
| Bookings Management | `/admin/bookings` | Booking management | List, search, view details, delete |
| Payments Management | `/admin/payments` | Payment management | List, search, view transaction details |
| Platform Settings | `/admin/settings` | System settings | Configuration options |

---

## 2. Route Structure

### Route Hierarchy

```
/ (Public)
├── / (Home)
├── /venues
│   ├── / (Venue List)
│   └── /:id (Venue Detail)
├── /login
├── /register
│   ├── /customer
│   └── /owner
├── /verify-otp
├── /forgot-password
└── /reset-password/:token

/Customer (Protected - Customer Role)
├── /dashboard
├── /bookings
│   ├── / (My Bookings)
│   ├── /new/:venueId (Create Booking)
│   └── /:id (Booking Detail)
├── /payments
│   ├── / (My Payments)
│   └── /:bookingId (Payment Flow)
├── /favorites
├── /reviews
└── /profile

/Owner (Protected - Owner Role)
├── /owner/dashboard
├── /owner/venues
│   ├── / (My Venues)
│   ├── /new (Create Venue)
│   ├── /:id/edit (Edit Venue)
│   ├── /:id/menu (Menu Items)
│   ├── /:id/singers (Singers)
│   ├── /:id/cars (Cars)
│   ├── /:id/karnay (Karnay Surnay)
│   └── /:id/images (Images)
└── /owner/bookings

/Admin (Protected - Admin Role)
├── /admin/dashboard
├── /admin/users
├── /admin/owners
├── /admin/venues
│   ├── / (All Venues)
│   └── /:id/approve (Approval)
├── /admin/bookings
├── /admin/payments
└── /admin/settings
```

### Route Guards Implementation

```typescript
// Public Routes - No authentication
<Route path="/" element={<PublicLayout />}>
  <Route index element={<HomePage />} />
  <Route path="venues" element={<VenueListPage />} />
  <Route path="venues/:id" element={<VenueDetailPage />} />
  <Route path="login" element={<LoginPage />} />
  <Route path="register/customer" element={<RegisterCustomerPage />} />
  <Route path="register/owner" element={<RegisterOwnerPage />} />
  <Route path="verify-otp" element={<VerifyOtpPage />} />
  <Route path="forgot-password" element={<ForgotPasswordPage />} />
  <Route path="reset-password/:token" element={<ResetPasswordPage />} />
</Route>

// Customer Routes - Customer role only
<Route path="/dashboard" element={
  <ProtectedRoute roles={['customer']}>
    <CustomerLayout />
  </ProtectedRoute>
}>
  <Route index element={<CustomerDashboard />} />
  <Route path="bookings" element={<BookingsPage />} />
  <Route path="bookings/new/:venueId" element={<CreateBookingPage />} />
  <Route path="bookings/:id" element={<BookingDetailPage />} />
  <Route path="payments" element={<PaymentsPage />} />
  <Route path="payments/:bookingId" element={<PaymentPage />} />
  <Route path="favorites" element={<FavoritesPage />} />
  <Route path="reviews" element={<ReviewsPage />} />
  <Route path="profile" element={<ProfilePage />} />
</Route>

// Owner Routes - Owner role (Admin also has access)
<Route path="/owner" element={
  <ProtectedRoute roles={['owner', 'admin']}>
    <OwnerLayout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<OwnerDashboard />} />
  <Route path="venues" element={<OwnerVenuesPage />} />
  <Route path="venues/new" element={<CreateVenuePage />} />
  <Route path="venues/:id/edit" element={<EditVenuePage />} />
  <Route path="venues/:id/menu" element={<VenueMenuPage />} />
  <Route path="venues/:id/singers" element={<VenueSingersPage />} />
  <Route path="venues/:id/cars" element={<VenueCarsPage />} />
  <Route path="venues/:id/karnay" element={<VenueKarnayPage />} />
  <Route path="venues/:id/images" element={<VenueImagesPage />} />
  <Route path="bookings" element={<OwnerBookingsPage />} />
</Route>

// Admin Routes - Admin role only
<Route path="/admin" element={
  <ProtectedRoute roles={['admin']}>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsersPage />} />
  <Route path="owners" element={<AdminOwnersPage />} />
  <Route path="venues" element={<AdminVenuesPage />} />
  <Route path="venues/:id/approve" element={<VenueApprovalPage />} />
  <Route path="bookings" element={<AdminBookingsPage />} />
  <Route path="payments" element={<AdminPaymentsPage />} />
  <Route path="settings" element={<AdminSettingsPage />} />
</Route>

// Fallback
<Route path="*" element={<NotFoundPage />} />
```

---

## 3. Component Structure

### Layout Components

```
components/
├── layout/
│   ├── PublicLayout.tsx          # Header, Footer for public pages
│   ├── CustomerLayout.tsx        # Customer sidebar navigation
│   ├── OwnerLayout.tsx           # Owner sidebar navigation
│   ├── AdminLayout.tsx           # Admin sidebar navigation
│   ├── Header.tsx                # Main header with navigation
│   ├── Sidebar.tsx               # Sidebar component
│   ├── Footer.tsx                # Footer component
│   └── MobileNav.tsx             # Mobile navigation
```

### UI Components (Reusable)

```
components/
├── ui/
│   ├── Button.tsx                # Primary, secondary, danger buttons
│   ├── Input.tsx                 # Text, email, password inputs
│   ├── Select.tsx                # Dropdown select
│   ├── TextArea.tsx              # Text area
│   ├── Checkbox.tsx              # Checkbox
│   ├── Radio.tsx                 # Radio buttons
│   ├── DatePicker.tsx            # Date picker
│   ├── FileUpload.tsx            # File upload component
│   ├── Modal.tsx                 # Modal dialog
│   ├── Dialog.tsx                # Confirmation dialog
│   ├── Toast.tsx                 # Toast notifications
│   ├── Loading.tsx               # Loading spinner
│   ├── Card.tsx                  # Card container
│   ├── Badge.tsx                 # Status badges
│   ├── Tabs.tsx                  # Tab navigation
│   ├── Pagination.tsx            # Pagination controls
│   ├── SearchBar.tsx             # Search input with filters
│   ├── FilterPanel.tsx           # Filter sidebar
│   ├── ImageGallery.tsx          # Image gallery
│   ├── Rating.tsx                # Star rating
│   ├── Avatar.tsx                # User avatar
│   └── Table.tsx                 # Data table
```

### Feature Components

```
components/
├── features/
│   ├── auth/
│   │   ├── RegisterForm.tsx      # Registration form
│   │   ├── LoginForm.tsx         # Login form
│   │   ├── OtpInput.tsx          # OTP input component
│   │   ├── ForgotPasswordForm.tsx
│   │   └── ResetPasswordForm.tsx
│   ├── venues/
│   │   ├── VenueCard.tsx         # Venue card in list
│   │   ├── VenueDetail.tsx       # Full venue details
│   │   ├── VenueFilters.tsx      # Filter panel
│   │   ├── VenueImageGallery.tsx
│   │   ├── MenuItemCard.tsx
│   │   ├── SingerCard.tsx
│   │   ├── CarCard.tsx
│   │   └── KarnayCard.tsx
│   ├── bookings/
│   │   ├── BookingCard.tsx       # Booking card
│   │   ├── BookingForm.tsx       # Create booking form
│   │   ├── BookingSummary.tsx    # Booking summary
│   │   ├── AddonSelector.tsx     # Select singers, cars, karnay
│   │   └── BookingTimeline.tsx    # Booking status timeline
│   ├── payments/
│   │   ├── PaymentForm.tsx       # Payment form
│   │   ├── PaymentSummary.tsx    # Payment summary
│   │   ├── PaymentSuccess.tsx    # Success screen
│   │   └── PaymentHistory.tsx    # Payment history list
│   ├── reviews/
│   │   ├── ReviewCard.tsx        # Review card
│   │   ├── ReviewForm.tsx        # Write review form
│   │   ├── ReviewList.tsx        # List of reviews
│   │   └── RatingStars.tsx       # Star rating display
│   ├── favorites/
│   │   ├── FavoriteCard.tsx       # Favorite venue card
│   │   └── FavoriteButton.tsx     # Add to favorite button
│   ├── admin/
│   │   ├── StatCard.tsx          # Dashboard stat card
│   │   ├── UserTable.tsx         # User management table
│   │   ├── VenueTable.tsx        # Venue management table
│   │   ├── BookingTable.tsx      # Booking management table
│   │   ├── ApprovalCard.tsx      # Venue approval card
│   │   └── QuickActions.tsx      # Quick action buttons
│   └── owner/
│       ├── VenueForm.tsx         # Create/edit venue form
│       ├── CatalogForm.tsx       # Menu/singer/car/karnay form
│       ├── ImageUploader.tsx      # Image upload component
│       └── BookingStatusBadge.tsx
```

---

## 4. API Integration Strategy

### API Client Architecture

**Centralized API Client:**
- Single `apiClient` function for all HTTP requests
- Automatic token attachment
- Error handling and retry logic
- Request/response interceptors
- Type-safe responses

### Service Layer Pattern

**One service file per API module:**

```
services/
├── auth.service.ts          # Authentication endpoints
├── users.service.ts         # User management
├── venues.service.ts        # Venue CRUD
├── bookings.service.ts      # Booking operations
├── payments.service.ts      # Payment operations
├── reviews.service.ts       # Review operations
├── favorites.service.ts     # Favorites operations
├── admin.service.ts         # Admin endpoints
├── menu-items.service.ts    # Menu items
├── singers.service.ts       # Singers
├── cars.service.ts          # Cars
├── karnay.service.ts        # Karnay Surnay
└── images.service.ts        # Image uploads
```

### API Client Implementation Strategy

**Base Configuration:**
```typescript
// config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://toyxona-backend-1.onrender.com'
export const API_URL = `${API_BASE_URL}/api`
```

**API Client Function:**
```typescript
// lib/api-client.ts
- Accepts path, options, auth flag
- Automatically adds Content-Type header
- Automatically adds Authorization header if auth=true
- Handles FormData for file uploads
- Returns typed ApiResponse<T>
- Centralized error handling
- Token refresh logic (future)
```

**Service Pattern:**
```typescript
// services/venues.service.ts
export const venuesService = {
  getAll: (params) => apiClient<PaginatedVenues>('/venues', { auth: false, params }),
  getById: (id) => apiClient<SafeVenue>(`/venues/${id}`, { auth: false }),
  create: (data) => apiClient<SafeVenue>('/venues', { auth: true, method: 'POST', body: data }),
  update: (id, data) => apiClient<SafeVenue>(`/venues/${id}`, { auth: true, method: 'PATCH', body: data }),
  delete: (id) => apiClient<{ message: string }>(`/venues/${id}`, { auth: true, method: 'DELETE' }),
}
```

### Data Transformation Layer

**Type Coercion Utilities:**
```typescript
// lib/parse-api-number.ts
- toNumber(value: string | number): number
- toString(value: string | number): string
- parseCurrency(value: string | number): number
- formatCurrency(value: number): string
```

**Response Normalization:**
- Convert string IDs to numbers when needed
- Parse decimal strings to numbers
- Normalize date formats
- Handle null/undefined values

### Error Handling Strategy

**Global Error Handler:**
- 401: Redirect to login, clear token
- 403: Show permission denied toast
- 404: Show not found page
- 409: Show conflict message (duplicate booking)
- 500: Show server error toast
- Network errors: Show offline message

**Local Error Handling:**
- Form validation errors
- Business logic errors
- User-friendly error messages

---

## 5. State Management Strategy

### State Management Approach

**Recommended: React Context + Hooks**
- Simple, built-in solution
- No external dependencies
- Sufficient for this application size

**Alternative: Zustand or Redux Toolkit**
- If state complexity grows
- Better for large-scale applications

### Context Structure

```
contexts/
├── AuthContext.tsx            # Authentication state
├── UserContext.tsx            # Current user data
├── VenuesContext.tsx          # Venues cache
├── BookingsContext.tsx        # Bookings state
└── NotificationContext.tsx    # Toast notifications
```

### AuthContext

**State:**
```typescript
{
  token: string | null
  user: SafeUser | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**Methods:**
```typescript
{
  login: (identifier: string, password: string) => Promise<void>
  registerCustomer: (data: RegisterRequestBody) => Promise<void>
  registerOwner: (data: RegisterRequestBody) => Promise<void>
  verifyOtp: (email: string, otpCode: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateUser: (data: UpdateSelfRequestBody) => Promise<void>
}
```

### VenuesContext

**State:**
```typescript
{
  venues: SafeVenue[]
  selectedVenue: SafeVenue | null
  filters: VenueFilters
  pagination: { page: number, limit: number, total: number }
  isLoading: boolean
}
```

**Methods:**
```typescript
{
  fetchVenues: (filters?: VenueFilters) => Promise<void>
  fetchVenueById: (id: number) => Promise<void>
  setFilters: (filters: Partial<VenueFilters>) => void
  clearFilters: () => void
}
```

### BookingsContext

**State:**
```typescript
{
  bookings: BookingListItem[]
  currentBooking: BookingTotals | null
  filters: BookingFilters
  isLoading: boolean
}
```

**Methods:**
```typescript
{
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  createBooking: (data: CreateBookingRequestBody) => Promise<void>
  updateBooking: (data: UpdateBookingRequestBody) => Promise<void>
  cancelBooking: (id: number) => Promise<void>
}
```

### Local State vs Global State

**Use Local State For:**
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary selections
- Component-specific data

**Use Global State For:**
- Authentication (token, user)
- User profile data
- Frequently accessed data (venues)
- Cross-component data sharing
- Application-wide settings

### Data Fetching Strategy

**Option 1: React Query (TanStack Query) - Recommended**
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states built-in
- Pagination support

**Option 2: Custom Hooks with Context**
- More control
- Lighter weight
- Simpler for small apps

**Recommended: React Query for production**
- Better developer experience
- Handles edge cases
- Reduces boilerplate
- Better performance

---

## 6. Authentication Flow

### Registration Flow

```
1. User fills registration form
   → POST /api/auth/register/customer or /register/owner
   → Response: { user, otpCode }

2. Show OTP verification screen
   → Display OTP code (dev) or wait for email (prod)

3. User enters OTP
   → POST /api/auth/verify-otp
   → Response: { accessToken, user }

4. Store credentials
   → localStorage.setItem('accessToken', token)
   → localStorage.setItem('user', JSON.stringify(user))

5. Update AuthContext
   → setToken(token)
   → setUser(user)

6. Redirect to dashboard
   → Based on user role
```

### Login Flow

```
1. User fills login form
   → POST /api/auth/login
   → Response: { accessToken, user }

2. Store credentials
   → localStorage.setItem('accessToken', token)
   → localStorage.setItem('user', JSON.stringify(user))

3. Update AuthContext
   → setToken(token)
   → setUser(user)

4. Redirect to appropriate dashboard
   → Customer → /dashboard
   → Owner → /owner/dashboard
   → Admin → /admin/dashboard
```

### Token Management

**Storage:**
- Primary: localStorage
- Alternative: sessionStorage (shared devices)
- Future: httpOnly cookies (more secure)

**Token Attachment:**
```typescript
// Automatic via apiClient
const token = localStorage.getItem('accessToken')
headers.set('Authorization', `Bearer ${token}`)
```

**Token Expiration:**
- JWT expires in 7 days
- Frontend checks expiration on load
- Redirect to login if expired
- Show session expired toast

**Logout Flow:**
```
1. User clicks logout
   → POST /api/auth/logout
   → Clear localStorage
   → Clear AuthContext
   → Redirect to /login
```

### Protected Route Access

```
1. User navigates to protected route
   → ProtectedRoute component checks token
   → If no token: redirect to /login
   → If token exists: check role
   → If role mismatch: redirect to appropriate dashboard
   → If role matches: render children
```

### Auto-Login on App Load

```
1. App initializes
   → Check localStorage for token and user
   → If found: validate token (optional API call)
   → If valid: set AuthContext state
   → If invalid: clear storage, redirect to login
```

---

## 7. Folder Structure

### Complete Frontend Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component
│   ├── vite-env.d.ts
│   └── css/
│       └── index.css               # Global styles
│
│   ├── config/
│   │   └── api.ts                 # API configuration
│   │
│   ├── lib/
│   │   ├── api-client.ts           # Centralized API client
│   │   ├── token.ts               # Token utilities
│   │   ├── parse-api-number.ts    # Type coercion utilities
│   │   ├── format-currency.ts     # Currency formatting
│   │   ├── format-date.ts         # Date formatting
│   │   └── validation.ts          # Form validation helpers
│   │
│   ├── types/
│   │   ├── api.ts                 # API response types
│   │   ├── auth.ts                # Auth types (User, Role, etc.)
│   │   ├── venue.ts               # Venue types
│   │   ├── booking.ts             # Booking types
│   │   ├── payment.ts             # Payment types
│   │   ├── review.ts              # Review types
│   │   └── common.ts              # Common types
│   │
│   ├── services/
│   │   ├── auth.service.ts        # Auth API calls
│   │   ├── users.service.ts       # User API calls
│   │   ├── venues.service.ts      # Venue API calls
│   │   ├── bookings.service.ts    # Booking API calls
│   │   ├── payments.service.ts    # Payment API calls
│   │   ├── reviews.service.ts     # Review API calls
│   │   ├── favorites.service.ts   # Favorites API calls
│   │   ├── admin.service.ts       # Admin API calls
│   │   ├── menu-items.service.ts  # Menu items API calls
│   │   ├── singers.service.ts     # Singers API calls
│   │   ├── cars.service.ts        # Cars API calls
│   │   ├── karnay.service.ts      # Karnay API calls
│   │   └── images.service.ts      # Image upload API calls
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication state
│   │   ├── UserContext.tsx        # User data state
│   │   ├── VenuesContext.tsx      # Venues cache
│   │   ├── BookingsContext.tsx    # Bookings state
│   │   └── NotificationContext.tsx  # Toast notifications
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth hook
│   │   ├── useUser.ts             # User hook
│   │   ├── useVenues.ts           # Venues hook
│   │   ├── useBookings.ts         # Bookings hook
│   │   ├── usePayments.ts         # Payments hook
│   │   ├── useReviews.ts          # Reviews hook
│   │   ├── useFavorites.ts        # Favorites hook
│   │   ├── useDebounce.ts         # Debounce utility
│   │   └── usePagination.ts       # Pagination hook
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx
│   │   │   ├── CustomerLayout.tsx
│   │   │   ├── OwnerLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── Rating.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Table.tsx
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── RegisterForm.tsx
│   │       │   ├── LoginForm.tsx
│   │       │   ├── OtpInput.tsx
│   │       │   ├── ForgotPasswordForm.tsx
│   │       │   └── ResetPasswordForm.tsx
│   │       │
│   │       ├── venues/
│   │       │   ├── VenueCard.tsx
│   │       │   ├── VenueDetail.tsx
│   │       │   ├── VenueFilters.tsx
│   │       │   ├── VenueImageGallery.tsx
│   │       │   ├── MenuItemCard.tsx
│   │       │   ├── SingerCard.tsx
│   │       │   ├── CarCard.tsx
│   │       │   └── KarnayCard.tsx
│   │       │
│   │       ├── bookings/
│   │       │   ├── BookingCard.tsx
│   │       │   ├── BookingForm.tsx
│   │       │   ├── BookingSummary.tsx
│   │       │   ├── AddonSelector.tsx
│   │       │   └── BookingTimeline.tsx
│   │       │
│   │       ├── payments/
│   │       │   ├── PaymentForm.tsx
│   │       │   ├── PaymentSummary.tsx
│   │       │   ├── PaymentSuccess.tsx
│   │       │   └── PaymentHistory.tsx
│   │       │
│   │       ├── reviews/
│   │       │   ├── ReviewCard.tsx
│   │       │   ├── ReviewForm.tsx
│   │       │   ├── ReviewList.tsx
│   │       │   └── RatingStars.tsx
│   │       │
│   │       ├── favorites/
│   │       │   ├── FavoriteCard.tsx
│   │       │   └── FavoriteButton.tsx
│   │       │
│   │       ├── admin/
│   │       │   ├── StatCard.tsx
│   │       │   ├── UserTable.tsx
│   │       │   ├── VenueTable.tsx
│   │       │   ├── BookingTable.tsx
│   │       │   ├── ApprovalCard.tsx
│   │       │   └── QuickActions.tsx
│   │       │
│   │       └── owner/
│   │           ├── VenueForm.tsx
│   │           ├── CatalogForm.tsx
│   │           ├── ImageUploader.tsx
│   │           └── BookingStatusBadge.tsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── VenueListPage.tsx
│   │   │   └── VenueDetailPage.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterCustomerPage.tsx
│   │   │   ├── RegisterOwnerPage.tsx
│   │   │   ├── VerifyOtpPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   │
│   │   ├── customer/
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── BookingsPage.tsx
│   │   │   ├── BookingDetailPage.tsx
│   │   │   ├── CreateBookingPage.tsx
│   │   │   ├── PaymentsPage.tsx
│   │   │   ├── PaymentPage.tsx
│   │   │   ├── FavoritesPage.tsx
│   │   │   ├── ReviewsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── owner/
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── OwnerVenuesPage.tsx
│   │   │   ├── CreateVenuePage.tsx
│   │   │   ├── EditVenuePage.tsx
│   │   │   ├── VenueMenuPage.tsx
│   │   │   ├── VenueSingersPage.tsx
│   │   │   ├── VenueCarsPage.tsx
│   │   │   ├── VenueKarnayPage.tsx
│   │   │   ├── VenueImagesPage.tsx
│   │   │   └── OwnerBookingsPage.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminUsersPage.tsx
│   │   │   ├── AdminOwnersPage.tsx
│   │   │   ├── AdminVenuesPage.tsx
│   │   │   ├── VenueApprovalPage.tsx
│   │   │   ├── AdminBookingsPage.tsx
│   │   │   ├── AdminPaymentsPage.tsx
│   │   │   └── AdminSettingsPage.tsx
│   │   │
│   │   └── error/
│   │       ├── NotFoundPage.tsx
│   │       └── ErrorPage.tsx
│   │
│   ├── routes/
│   │   ├── index.tsx               # Main router configuration
│   │   ├── ProtectedRoute.tsx      # Route guard component
│   │   ├── PublicRoutes.tsx        # Public route definitions
│   │   ├── CustomerRoutes.tsx      # Customer route definitions
│   │   ├── OwnerRoutes.tsx         # Owner route definitions
│   │   └── AdminRoutes.tsx         # Admin route definitions
│   │
│   ├── providers/
│   │   ├── AppProvider.tsx         # Root provider
│   │   ├── AuthProvider.tsx        # Auth context provider
│   │   ├── UserProvider.tsx        # User context provider
│   │   ├── VenuesProvider.tsx      # Venues context provider
│   │   ├── BookingsProvider.tsx    # Bookings context provider
│   │   └── NotificationProvider.tsx  # Toast provider
│   │
│   └── utils/
│       ├── constants.ts            # App constants
│       ├── helpers.ts              # Helper functions
│       └── validators.ts           # Validation functions
│
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 8. Implementation Phases

### Phase 1: Project Setup (Week 1)

- Initialize Vite + React + TypeScript project
- Configure ESLint, Prettier
- Set up folder structure
- Configure environment variables
- Install dependencies (React Router, date-fns, etc.)
- Set up base layout components

### Phase 2: Authentication System (Week 2)

- Implement AuthContext
- Create auth service
- Build login/register pages
- Implement OTP verification
- Add route guards
- Test authentication flow

### Phase 3: Public Pages (Week 3)

- Build home page
- Create venue list page with filters
- Build venue detail page
- Implement venue image gallery
- Add search functionality

### Phase 4: Customer Features (Week 4-5)

- Build customer dashboard
- Implement booking creation flow
- Add payment flow
- Create favorites feature
- Build reviews system
- Implement profile management

### Phase 5: Owner Features (Week 6)

- Build owner dashboard
- Implement venue CRUD
- Add menu/singer/car/karnay management
- Implement image upload
- Build booking management for owners

### Phase 6: Admin Features (Week 7)

- Build admin dashboard
- Implement user management
- Add venue approval system
- Build platform statistics
- Implement booking/payment management

### Phase 7: Polish & Testing (Week 8)

- Add loading states
- Implement error handling
- Add toast notifications
- Responsive design
- Cross-browser testing
- Performance optimization

---

## 9. Technology Stack

### Core Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0"
}
```

### UI Libraries

```json
{
  "lucide-react": "^0.294.0",           // Icons
  "clsx": "^2.0.0",                     // Class names
  "tailwind-merge": "^2.0.0",           // Tailwind utilities
  "date-fns": "^2.30.0",               // Date formatting
  "react-hook-form": "^7.48.0",         // Form handling
  "zod": "^3.22.0",                    // Schema validation
  "@hookform/resolvers": "^3.3.0"      // Form validation
}
```

### Data Fetching

```json
{
  "@tanstack/react-query": "^5.0.0"    // Data fetching (recommended)
}
```

### Styling

```json
{
  "tailwindcss": "^3.3.0",              // CSS framework
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Development Tools

```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.0",
  "eslint": "^8.54.0",
  "prettier": "^3.1.0"
}
```

---

## 10. Key Implementation Notes

### Data Type Handling

**String IDs from API:**
- Backend returns IDs as strings
- Frontend should handle both string and number
- Convert to number when needed for calculations
- Keep as string for display

**Currency Values:**
- Backend returns prices as strings (e.g., "120000.00")
- Parse to number for calculations
- Format for display with proper separators

### Error Handling

**401 Unauthorized:**
- Clear token from localStorage
- Clear AuthContext
- Redirect to login
- Show "Session expired" toast

**403 Forbidden:**
- Show "Permission denied" toast
- Redirect to appropriate dashboard
- Hide unauthorized UI elements

**409 Conflict:**
- Show specific conflict message
- Example: "Venue already booked on this date"
- Allow user to try different date

### Loading States

- Show skeleton loaders for lists
- Show spinner for form submissions
- Disable buttons during API calls
- Show progress for file uploads

### Responsive Design

- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Mobile navigation drawer
- Touch-friendly buttons
- Responsive tables

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

---

*Last updated: 2026-06-03*

# Role Permissions Matrix

## User Roles

- **Admin** - Full system access, can manage all resources
- **Owner** - Can manage their own venues and related resources
- **Customer** - Can browse venues, create bookings, make payments

---

## Complete Permissions Table

| Module | Endpoint | Method | Admin | Owner | Customer | Public |
|--------|----------|--------|-------|-------|----------|--------|
| **Health** | | | | | |
| | `/health` | GET | ✅ | ✅ | ✅ | ✅ |
| **Auth** | | | | | |
| | `/api/auth/register/customer` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/register/owner` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/verify-otp` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/resend-otp` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/login` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/logout` | POST | ✅ | ✅ | ✅ | ❌ |
| | `/api/auth/forgot-password` | POST | ✅ | ✅ | ✅ | ✅ |
| | `/api/auth/reset-password` | POST | ✅ | ✅ | ✅ | ✅ |
| **Users** | | | | | |
| | `/api/users/me` | GET | ✅ | ✅ | ✅ | ❌ |
| | `/api/users/` | GET | ✅ | ❌ | ❌ | ❌ |
| | `/api/users/` | PATCH | ✅ | ✅ | ✅ | ❌ |
| | `/api/users/` | DELETE | ✅ | ✅ | ✅ | ❌ |
| | `/api/users/change-password` | POST | ✅ | ✅ | ✅ | ❌ |
| | `/api/users/:id` | PATCH | ✅ | ❌ | ❌ | ❌ |
| | `/api/users/:id` | DELETE | ✅ | ❌ | ❌ | ❌ |
| **Venues** | | | | | |
| | `/api/venues/` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/venues/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/venues/` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/venues/:id` | PATCH | ✅ | ✅ | ❌ | ❌ |
| | `/api/venues/:id` | DELETE | ✅ | ✅ | ❌ | ❌ |
| | `/api/venues/:id/status` | PATCH | ✅ | ❌ | ❌ | ❌ |
| **Venue Images** | | | | | |
| | `/api/venues/:venueId/images` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/venues/:venueId/images` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/venues/images/:imageId` | DELETE | ✅ | ✅ | ❌ | ❌ |
| **Menu Items** | | | | | |
| | `/api/menu-items/` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/menu-items/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/menu-items/` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/menu-items/:id` | PATCH | ✅ | ✅ | ❌ | ❌ |
| | `/api/menu-items/:id` | DELETE | ✅ | ✅ | ❌ | ❌ |
| **Singers** | | | | | |
| | `/api/singers/` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/singers/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/singers/` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/singers/:id` | PATCH | ✅ | ✅ | ❌ | ❌ |
| | `/api/singers/:id` | DELETE | ✅ | ✅ | ❌ | ❌ |
| **Cars** | | | | | |
| | `/api/cars/` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/cars/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/cars/` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/cars/:id` | PATCH | ✅ | ✅ | ❌ | ❌ |
| | `/api/cars/:id` | DELETE | ✅ | ✅ | ❌ | ❌ |
| **Karnay Surnay** | | | | | |
| | `/api/karnay-surnay/` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/karnay-surnay/:id` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/karnay-surnay/` | POST | ✅ | ✅ | ❌ | ❌ |
| | `/api/karnay-surnay/:id` | PATCH | ✅ | ✅ | ❌ | ❌ |
| | `/api/karnay-surnay/:id` | DELETE | ✅ | ✅ | ❌ | ❌ |
| **Bookings** | | | | | |
| | `/api/bookings/` | POST | ❌ | ❌ | ✅ | ❌ |
| | `/api/bookings/` | GET | ✅ | ✅ | ✅ | ❌ |
| | `/api/bookings/` | PATCH | ✅ | ✅ | ✅ | ❌ |
| | `/api/bookings/` | DELETE | ✅ | ❌ | ❌ | ❌ |
| **Payments** | | | | | |
| | `/api/payments/` | POST | ❌ | ❌ | ✅ | ❌ |
| | `/api/payments/` | GET | ✅ | ✅ | ✅ | ❌ |
| **Reviews** | | | | | |
| | `/api/reviews/venues/:venueId` | GET | ✅ | ✅ | ✅ | ✅ |
| | `/api/reviews/` | POST | ✅ | ✅ | ✅ | ❌ |
| | `/api/reviews/my-reviews` | GET | ✅ | ✅ | ✅ | ❌ |
| | `/api/reviews/:id` | PATCH | ✅ | ✅ | ✅ | ❌ |
| | `/api/reviews/:id` | DELETE | ✅ | ✅ | ✅ | ❌ |
| **Favorites** | | | | | |
| | `/api/favorites/` | GET | ❌ | ❌ | ✅ | ❌ |
| | `/api/favorites/venues/:venueId` | POST | ❌ | ❌ | ✅ | ❌ |
| | `/api/favorites/venues/:venueId` | DELETE | ❌ | ❌ | ✅ | ❌ |
| **Admin** | | | | | |
| | `/api/admin/dashboard` | GET | ✅ | ❌ | ❌ | ❌ |
| | `/api/admin/users` | GET | ✅ | ❌ | ❌ | ❌ |
| | `/api/admin/owners` | GET | ✅ | ❌ | ❌ | ❌ |
| | `/api/admin/venues` | GET | ✅ | ❌ | ❌ | ❌ |
| | `/api/admin/bookings` | GET | ✅ | ❌ | ❌ | ❌ |

---

## Role-Specific Capabilities

### Admin

**Full System Access**
- Manage all users (create, update, delete, change roles)
- Approve/reject venue applications
- View all bookings across the platform
- Access admin dashboard with platform statistics
- Manage any venue, menu item, singer, car, or karnay surnay
- Delete any booking
- View all payments

**Unique Permissions**
- Change venue status (pending → approved/rejected)
- View platform-wide statistics and analytics
- Manage user verification status
- Full CRUD on all resources

---

### Owner

**Venue Management**
- Create venues (status: pending)
- Update own venues
- Delete own venues
- Upload venue images
- Manage venue menu items
- Manage venue singers
- Manage venue cars
- Manage venue karnay surnay

**Booking Management**
- View bookings for own venues
- Update booking status (for own venues)
- Cannot delete bookings

**Restrictions**
- Cannot approve/reject venues (admin only)
- Cannot manage other owners' venues
- Cannot access admin dashboard
- Cannot manage users
- Cannot delete bookings

---

### Customer

**Venue Browsing**
- Browse all venues (public)
- View venue details
- View venue images
- View menu items, singers, cars, karnay surnay
- Read venue reviews

**Booking Management**
- Create bookings
- View own bookings
- Cancel own bookings
- Cannot delete bookings (admin only)

**Payment Management**
- Make advance payments
- Make full payments
- View own payment history

**Social Features**
- Add venues to favorites
- Remove venues from favorites
- View favorite venues
- Write reviews
- Update own reviews
- Delete own reviews

**Account Management**
- View own profile
- Update own profile
- Change password
- Delete own account

**Restrictions**
- Cannot create venues
- Cannot manage any venue resources
- Cannot access admin dashboard
- Cannot manage other users
- Cannot delete bookings

---

## Permission Enforcement

### Authentication Middleware

Applied to all protected routes:
- Validates JWT token
- Extracts user information
- Sets `req.user` context

### Authorization Middleware

Applied to role-specific routes:
- Checks user role against allowed roles
- Returns 403 Forbidden if unauthorized
- Supports multiple roles (e.g., `authorize('owner', 'admin')`)

### Role-Specific Route Guards

**Admin-only routes:**
```typescript
router.get('/admin/dashboard', authenticate, authorize('admin'), controller)
```

**Owner/Admin routes:**
```typescript
router.post('/venues', authenticate, authorize('owner', 'admin'), controller)
```

**Customer-only routes:**
```typescript
router.use(authenticate, authorize('customer'))
router.get('/favorites', controller)
```

**All authenticated users:**
```typescript
router.use(authenticate)
router.get('/me', controller)
```

---

## Business Logic Restrictions

### Booking Creation
- Only customers can create bookings
- Duplicate booking dates for same venue are blocked (409 Conflict)
- Advance amount is automatically calculated (20% of total)

### Payment Flow
- Only customers can make payments
- Must pay advance before full payment
- Payment type: 'advance' or 'full'

### Venue Status
- New venues start as 'pending'
- Only admin can change status to 'approved' or 'rejected'
- Only approved venues can be booked

### Resource Ownership
- Owners can only manage their own venues
- Customers can only manage their own bookings/reviews/favorites
- Admin can manage all resources

---

## Frontend Role-Based UI

### Navigation Menus

**Admin Navigation:**
- Dashboard
- Users Management
- Owners Management
- Venues Management (with approval queue)
- Bookings Management
- Platform Statistics

**Owner Navigation:**
- My Venues
- Create Venue
- Venue Menu Items
- Venue Singers
- Venue Cars
- Venue Karnay Surnay
- Venue Images
- My Bookings

**Customer Navigation:**
- Browse Venues
- My Bookings
- My Payments
- My Favorites
- My Reviews
- Profile Settings

### Route Guards

Implement role-based route protection in frontend:

```typescript
// Admin-only route
<Route path="/admin/*" element={
  <ProtectedRoute roles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

// Owner-only route
<Route path="/owner/*" element={
  <ProtectedRoute roles={['owner', 'admin']}>
    <OwnerDashboard />
  </ProtectedRoute>
} />

// Customer-only route
<Route path="/favorites" element={
  <ProtectedRoute roles={['customer']}>
    <Favorites />
  </ProtectedRoute>
} />

// Any authenticated user
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
```

---

## Security Considerations

### Server-Side Enforcement
- All permissions enforced on server side
- Never trust client-side role checks
- JWT tokens validated on every request
- Role checks performed before business logic

### Client-Side UI
- Use role checks only for UI display
- Always handle 403 responses gracefully
- Redirect unauthorized users appropriately
- Don't hide sensitive data based on UI alone

### Data Isolation
- Customers see only their own data
- Owners see only their venues' data
- Admin sees all data
- Cross-tenant access prevented at database level

---

*Last updated: 2026-06-03*

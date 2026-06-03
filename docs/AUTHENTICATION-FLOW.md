# Authentication Flow Diagram

## JWT Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REGISTRATION FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

User Frontend                    Backend API                    Database
     │                                │                                │
     │  POST /api/auth/register/customer                                │
     │  {firstName, lastName, username, email, phone, password}          │
     ├───────────────────────────────>│                                │
     │                                │  Validate input                 │
     │                                │  Check email uniqueness         │
     │                                │  Check username uniqueness      │
     │                                │  Hash password                  │
     │                                │  Create user (is_verified=false)│
     │                                │  Generate OTP code             │
     │                                │  Save OTP record               │
     │                                │  Send OTP email                │
     │                                ├───────────────────────────────>│
     │                                │                                │
     │  201 Created                   │                                │
     │  {user, otpCode}               │                                │
     │<───────────────────────────────┤                                │
     │                                │                                │
     │  Show OTP input screen         │                                │
     │                                │                                │
     │  POST /api/auth/verify-otp     │                                │
     │  {email, otpCode}              │                                │
     ├───────────────────────────────>│                                │
     │                                │  Validate OTP                  │
     │                                │  Check OTP not expired         │
     │                                │  Mark OTP as used             │
     │                                │  Mark user as verified        │
     │                                │  Generate JWT token           │
     │                                │  Sign token with userId, role, │
     │                                │   username, email             │
     │                                │  Return token + user          │
     │                                ├───────────────────────────────>│
     │                                │                                │
     │  200 OK                        │                                │
     │  {accessToken, user}           │                                │
     │<───────────────────────────────┤                                │
     │                                │                                │
     │  Store token in localStorage   │                                │
     │  Redirect to home              │                                │
     │                                │                                │


┌─────────────────────────────────────────────────────────────────────────────┐
│                            LOGIN FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────┘

User Frontend                    Backend API                    Database
     │                                │                                │
     │  POST /api/auth/login          │                                │
     │  {identifier, password}        │                                │
     ├───────────────────────────────>│                                │
     │                                │  Find user by username/email  │
     │                                │  Compare password hash         │
     │                                │  Check user is verified        │
     │                                │  Generate JWT token           │
     │                                │  Sign token with userId, role, │
     │                                │   username, email             │
     │                                │  Return token + user          │
     │                                ├───────────────────────────────>│
     │                                │                                │
     │  200 OK                        │                                │
     │  {accessToken, user}           │                                │
     │<───────────────────────────────┤                                │
     │                                │                                │
     │  Store token in localStorage   │                                │
     │  Redirect to dashboard         │                                │
     │                                │                                │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROTECTED ROUTE ACCESS FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User Frontend                    Backend API                    Database
     │                                │                                │
     │  GET /api/users/me              │                                │
     │  Authorization: Bearer <token>   │                                │
     ├───────────────────────────────>│                                │
     │                                │  Extract Bearer token          │
     │                                │  Verify JWT signature          │
     │                                │  Check token expiration         │
     │                                │  Validate payload structure    │
     │                                │  Extract userId, role, etc.    │
     │                                │  Convert userId to number      │
     │                                │  Set req.user                   │
     │                                │  Proceed to controller         │
     │                                │                                │
     │  200 OK                        │                                │
     │  {user profile}                │                                │
     │<───────────────────────────────┤                                │
     │                                │                                │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────┘

User Frontend                    Backend API
     │                                │
     │  GET /api/admin/dashboard      │
     │  Authorization: Bearer <token>   │
     ├───────────────────────────────>│
     │                                │
     │                        ┌────────┴────────┐
     │                        │ Authentication │
     │                        │   Middleware    │
     │                        └────────┬────────┘
     │                                 │
     │                        ┌────────┴────────┐
     │                        │  Authorization  │
     │                        │   Middleware    │
     │                        │  (check role)   │
     │                        └────────┬────────┘
     │                                 │
     │                        ┌────────┴────────┐
     │                        │   Controller    │
     │                        │   (admin only)  │
     │                        └────────┬────────┘
     │                                 │
     │  200 OK / 403 Forbidden         │
     │<───────────────────────────────┤
     │                                │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN STRUCTURE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": "14",           // String (PostgreSQL BIGINT)
  "role": "customer",       // UserRole
  "username": "testuser",  // string
  "email": "test@example.com",
  "iat": 1780506085,       // Issued at
  "exp": 1781110885        // Expires at (7 days)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)


┌─────────────────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. Missing Token:
   Frontend → Backend: No Authorization header
   Backend → Frontend: 401 Unauthorized

2. Invalid Token:
   Frontend → Backend: Bearer <invalid_token>
   Backend → Frontend: 401 Unauthorized "Invalid or expired token"

3. Expired Token:
   Frontend → Backend: Bearer <expired_token>
   Backend → Frontend: 401 Unauthorized "Invalid or expired token"

4. Insufficient Permissions:
   Frontend → Backend: Bearer <customer_token> to /api/admin/dashboard
   Backend → Frontend: 403 Forbidden

5. Unverified User:
   Frontend → Backend: Login with unverified account
   Backend → Frontend: 403 Forbidden "User is not verified"


┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY CONSIDERATIONS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. JWT Secret:
   - Stored in environment variable (JWT_SECRET)
   - Never exposed in client code
   - Should be long and random in production

2. Token Storage:
   - Recommended: localStorage or sessionStorage
   - Alternative: httpOnly cookies (requires backend changes)
   - Never store in plain cookies without httpOnly flag

3. Token Expiration:
   - Default: 7 days
   - Configurable via JWT_EXPIRES_IN environment variable
   - Frontend should handle token expiration gracefully

4. Token Refresh:
   - Not currently implemented
   - User must re-login after token expiration
   - Consider implementing refresh tokens for better UX

5. Role Enforcement:
   - Roles enforced on every protected request
   - Never trust client-side role checks
   - Always verify on server side


┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND IMPLEMENTATION CHECKLIST                         │
└─────────────────────────────────────────────────────────────────────────────┘

Registration Flow:
□ Collect user information
□ Call POST /api/auth/register/customer or /register/owner
□ Display OTP input screen
□ Call POST /api/auth/verify-otp
□ Store accessToken in localStorage
□ Store user object in localStorage
□ Redirect to appropriate dashboard

Login Flow:
□ Collect identifier (username/email) and password
□ Call POST /api/auth/login
□ Store accessToken in localStorage
□ Store user object in localStorage
□ Redirect to appropriate dashboard based on role

Protected Requests:
□ Retrieve token from localStorage
□ Add Authorization: Bearer <token> header
□ Handle 401 responses (redirect to login)
□ Handle 403 responses (show permission denied)
□ Handle token expiration gracefully

Logout Flow:
□ Call POST /api/auth/logout
□ Remove accessToken from localStorage
□ Remove user object from localStorage
□ Redirect to login page

Role-Based UI:
□ Show/hide menu items based on user role
□ Implement route guards for role-protected pages
□ Handle permission errors gracefully

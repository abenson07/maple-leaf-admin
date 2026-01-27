# Supabase OTP + Resend SMTP Authentication Implementation Plan

## Overview
This plan outlines the migration from the current password-based authentication system to Supabase OTP (One-Time Password) authentication with Resend SMTP for email delivery, integrated with Supabase's built-in `auth.users` table.

## Current State Analysis

### Existing Authentication System
- **Method**: Single password-based authentication
- **Session Management**: In-memory session store (non-persistent)
- **Files Involved**:
  - `lib/auth.ts` - Session management utilities
  - `pages/login.tsx` - Login UI
  - `pages/api/auth/login.ts` - Login API endpoint
  - `pages/api/auth/check.ts` - Auth check endpoint
  - `middleware.ts` - Route protection middleware

### Supabase Setup
- ✅ Supabase client already configured (`lib/supabaseClient.ts`)
- ✅ Server-side Supabase client available (`lib/serverSupabase.ts`)
- ✅ Database has `people` table with email field
- ❌ Not currently using Supabase Auth

## Implementation Plan

### Phase 1: Supabase Configuration & Setup

#### 1.1 Configure Supabase Auth Settings
**Tasks:**
- [ ] Enable Email OTP provider in Supabase Dashboard
  - Go to Authentication > Providers > Email
  - Enable "Email" provider
  - Configure OTP settings (expiration time, code length)
- [ ] Set up Resend SMTP integration
  - In Supabase Dashboard: Settings > Auth > SMTP Settings
  - Configure Resend SMTP credentials:
    - SMTP Host: `smtp.resend.com`
    - SMTP Port: `465` (SSL) or `587` (TLS)
    - SMTP User: `resend`
    - SMTP Password: Resend API key
    - From Email: Your verified Resend domain email
- [ ] Configure email templates in Supabase
  - Customize OTP email template
  - Set redirect URLs for email links (if using magic links)

#### 1.2 Environment Variables
**Add to `.env.local`:**
```env
# Existing Supabase vars (already present)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New: Resend Configuration (if needed for custom email sending)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Optional: Remove or deprecate
# ADMIN_PASSWORD=your_secret_password_here
```

### Phase 2: Update Supabase Client Configuration

#### 2.1 Update Client-Side Supabase Client
**File: `lib/supabaseClient.ts`**
- [ ] Ensure client is configured for auth
- [ ] Add auth state change listeners if needed
- [ ] Configure redirect URLs

#### 2.2 Create Auth Helper Utilities
**New File: `lib/auth-helpers.ts`**
- [ ] Create `sendOTP(email: string)` function
- [ ] Create `verifyOTP(email: string, token: string)` function
- [ ] Create `signOut()` function
- [ ] Create `getCurrentUser()` function
- [ ] Create `getSession()` function

### Phase 3: Update Login Flow

#### 3.1 Update Login UI
**File: `pages/login.tsx`**
- [ ] Replace password input with email input
- [ ] Add OTP input field (initially hidden)
- [ ] Implement two-step flow:
  1. User enters email → clicks "Send OTP"
  2. OTP sent → show OTP input field
  3. User enters OTP → verify and login
- [ ] Add loading states for each step
- [ ] Add error handling and display
- [ ] Add resend OTP functionality

#### 3.2 Create OTP API Endpoints
**New File: `pages/api/auth/send-otp.ts`**
- [ ] Accept email address
- [ ] Validate email format
- [ ] Call Supabase `signInWithOtp()`
- [ ] Return success/error response

**New File: `pages/api/auth/verify-otp.ts`**
- [ ] Accept email and OTP token
- [ ] Call Supabase `verifyOtp()`
- [ ] Create session cookie using Supabase session
- [ ] Return success/error response

**Update File: `pages/api/auth/login.ts`**
- [ ] Deprecate or remove password-based login
- [ ] Optionally redirect to new OTP flow

### Phase 4: Session Management Migration

#### 4.1 Replace Session System
**File: `lib/auth.ts`**
- [ ] Replace in-memory session store with Supabase session
- [ ] Update `createSession()` to use Supabase session
- [ ] Update `verifySession()` to verify Supabase session
- [ ] Update `deleteSession()` to sign out from Supabase
- [ ] Keep helper functions but adapt them for Supabase

#### 4.2 Update Middleware
**File: `middleware.ts`**
- [ ] Replace session cookie check with Supabase session verification
- [ ] Use `@supabase/ssr` for server-side session handling
- [ ] Update route protection logic
- [ ] Handle session refresh automatically

#### 4.3 Update Auth Check Endpoint
**File: `pages/api/auth/check.ts`**
- [ ] Replace custom session verification with Supabase session check
- [ ] Return user information if authenticated

### Phase 5: User Management Integration

#### 5.1 Link People Table with Auth Users
**Considerations:**
- [ ] Decide on relationship strategy:
  - Option A: Use Supabase `auth.users` email to link with `people.email`
  - Option B: Add `auth_user_id` foreign key to `people` table
  - Option C: Use Supabase user metadata to store people.id
- [ ] Create database trigger/function to sync users (if needed)
- [ ] Update user creation flow to create both auth user and people record

#### 5.2 User Registration Flow (if needed)
**New File: `pages/api/auth/register.ts`** (optional)
- [ ] Create new user in Supabase Auth
- [ ] Create corresponding record in `people` table
- [ ] Send OTP for email verification

### Phase 6: Testing & Migration

#### 6.1 Testing Checklist
- [ ] Test OTP sending with valid email
- [ ] Test OTP verification with correct code
- [ ] Test OTP verification with incorrect code
- [ ] Test expired OTP handling
- [ ] Test session persistence across page refreshes
- [ ] Test logout functionality
- [ ] Test protected route access
- [ ] Test redirect after login
- [ ] Test email delivery via Resend
- [ ] Test on different browsers/devices

#### 6.2 Migration Steps
- [ ] Create backup of current auth system
- [ ] Deploy new auth system to staging
- [ ] Test thoroughly in staging
- [ ] Migrate existing users (if any) to new system
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Remove old password-based auth code after verification

### Phase 7: Cleanup & Documentation

#### 7.1 Code Cleanup
- [ ] Remove unused password comparison functions
- [ ] Remove in-memory session store code
- [ ] Update environment variable documentation
- [ ] Remove `ADMIN_PASSWORD` from env files

#### 7.2 Documentation Updates
- [ ] Update README with new auth flow
- [ ] Document environment variables
- [ ] Add setup instructions for Resend SMTP
- [ ] Document user management process

## Technical Implementation Details

### Supabase OTP Flow
1. User enters email → `supabase.auth.signInWithOtp({ email })`
2. Supabase sends OTP email via Resend SMTP
3. User receives email with OTP code
4. User enters OTP → `supabase.auth.verifyOtp({ email, token, type: 'email' })`
5. Supabase returns session → Store in httpOnly cookie
6. Use session for authenticated requests

### Session Cookie Management
- Use `@supabase/ssr` package for Next.js integration
- Store session in httpOnly, secure cookies
- Configure cookie settings:
  - `HttpOnly`: true
  - `Secure`: true (production)
  - `SameSite`: Strict
  - `Path`: `/`
  - `Max-Age`: Match Supabase session duration

### Error Handling
- Handle network errors
- Handle invalid OTP codes
- Handle expired OTP codes
- Handle rate limiting (too many OTP requests)
- Handle email delivery failures
- Provide user-friendly error messages

## Dependencies

### Already Installed
- ✅ `@supabase/supabase-js` (v2.39.0)
- ✅ `@supabase/ssr` (v0.1.0)

### May Need Updates
- Check if `@supabase/ssr` version is compatible with Next.js 15
- Consider updating to latest versions if needed

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on OTP endpoints to prevent abuse
2. **Email Validation**: Validate email format before sending OTP
3. **OTP Expiration**: Use Supabase's built-in OTP expiration (default 1 hour)
4. **Session Security**: Use httpOnly cookies, secure flag in production
5. **CSRF Protection**: Next.js middleware provides CSRF protection
6. **Email Verification**: Consider requiring email verification for new users

## Rollback Plan

If issues arise:
1. Keep old auth code in a separate branch
2. Can quickly revert to password-based auth
3. Database changes should be minimal (if any)
4. No data loss expected

## Timeline Estimate

- **Phase 1**: 1-2 hours (Supabase/Resend configuration)
- **Phase 2**: 2-3 hours (Client setup & helpers)
- **Phase 3**: 4-6 hours (Login flow & API endpoints)
- **Phase 4**: 3-4 hours (Session management)
- **Phase 5**: 2-3 hours (User management integration)
- **Phase 6**: 3-4 hours (Testing)
- **Phase 7**: 1-2 hours (Cleanup & docs)

**Total Estimate**: 16-24 hours

## Next Steps

1. Review and approve this plan
2. Set up Resend account and get API key
3. Configure Supabase Auth settings
4. Begin Phase 1 implementation
5. Test incrementally after each phase
